import React, { useState, useEffect } from 'react';
import { X, Search, ShoppingCart, Trash2, Plus, Minus, Info, Check, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../lib/api';
import { toast } from 'sonner';

interface AddSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Product {
  id_producto: number;
  code: string;
  nombre: string;
  precio_unidad: number;
  precio_docena: number;
  precio_mayoreo: number;
  cantidad: number;
}

interface SaleItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  stock: number;
  precio_unidad: number;
  precio_docena: number;
  precio_mayoreo: number;
}

export default function AddSaleModal({ isOpen, onClose, onSuccess }: AddSaleModalProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customer, setCustomer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConversion, setShowConversion] = useState<number | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        searchProducts();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const searchProducts = async () => {
    try {
      const res = await api.get(`/products?search=${searchTerm}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getPriceForQuantity = (product: Product, qty: number) => {
    if (qty >= 50) return product.precio_mayoreo;
    if (qty >= 12) return product.precio_docena;
    return product.precio_unidad;
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id_producto);
    if (existing) {
      if (existing.quantity + 1 > product.cantidad) {
        toast.error(t('inventory.form.savingError')); // We should add a generic stock error
        return;
      }
      const newQty = existing.quantity + 1;
      updateQuantity(product.id_producto, newQty);
    } else {
      if (product.cantidad < 1) {
        toast.error(t('common.status.outOfStock'));
        return;
      }
      const newItem: SaleItem = {
        productId: product.id_producto,
        name: product.nombre,
        quantity: 1,
        price: product.precio_unidad,
        stock: product.cantidad,
        precio_unidad: product.precio_unidad,
        precio_docena: product.precio_docena,
        precio_mayoreo: product.precio_mayoreo
      };
      setCart([...cart, newItem]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateQuantity = (productId: number, newQty: number) => {
    if (newQty < 0) return;
    
    setCart(prev => prev.map((item: SaleItem) => {
      if (item.productId === productId) {
        if (newQty > item.stock && newQty > 0) {
          toast.error('Stock insuficiente');
          return item;
        }

        // Automatic Pricing Engine
        let price = item.precio_unidad;
        if (newQty >= 50) price = item.precio_mayoreo;
        else if (newQty >= 12) price = item.precio_docena;

        return { ...item, quantity: newQty, price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error(t('sales.emptyCart'));
      return;
    }
    
    // Check for invalid quantities
    if (cart.some(item => item.quantity <= 0)) {
      toast.error(t('sales.invalidQuantity') || 'Invalid quantity');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        rpNumber: `V-${Date.now().toString().slice(-6)}`,
        customer: customer || t('common.finalConsumer') || 'Consumidor Final',
        date: new Date().toISOString(),
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.price)
        }))
      };

      await api.post('/sales', payload);
      toast.success(t('sales.success') || 'Sale completed!');
      onSuccess();
      onClose();
      setCart([]);
      setCustomer('');
    } catch (err: any) {
      const msg = err.response?.data?.message || t('sales.error');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderConversion = (qty: number) => {
    const dozens = Math.floor(qty / 12);
    const wholesale = Math.floor(qty / 50);
    const remainingForWholesale = qty % 50;

    return (
      <div className="bg-secondary p-4 rounded-2xl text-white text-xs space-y-2 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between border-b border-white/10 pb-1">
          <span>Unidades totales:</span>
          <span className="font-black">{qty}</span>
        </div>
        <div className="flex justify-between border-b border-white/10 pb-1">
          <span>Equivale a:</span>
          <span className="font-black">{dozens} docenas</span>
        </div>
        <div className="flex justify-between">
          <span>Mayoreo (50s):</span>
          <span className="font-black">{wholesale} lote(s) + {remainingForWholesale}</span>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-secondary/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-[#F8FAFC] dark:bg-surface-dark w-full max-w-5xl h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-[#003366] p-8 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-2xl">
              <ShoppingCart size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tight">{t('common.sales')}</h3>
              <p className="text-white/60 text-sm font-bold">{t('sales.newSaleSubtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-3 rounded-2xl transition-all">
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Search & Catalog */}
          <div className="w-1/2 p-8 border-r border-gray-200 dark:border-white/5 flex flex-col gap-6 overflow-y-auto">
            <div className="space-y-3">
              <label className="text-xs font-black text-secondary/40 uppercase tracking-[0.2em] ml-2">{t('common.search')}</label>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                <input 
                  autoFocus
                  type="text"
                  placeholder={t('sales.searchBoxPlaceholder')}
                  className="w-full bg-white dark:bg-black/20 border-none rounded-[1.5rem] py-5 pl-14 pr-6 text-xl font-bold text-secondary dark:text-white shadow-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="grid grid-cols-1 gap-4">
              {searchResults.length > 0 ? (
                searchResults.map(product => (
                  <div 
                    key={product.id_producto}
                    className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-transparent hover:border-primary/30 hover:shadow-xl transition-all cursor-pointer group relative"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{product.code}</span>
                        <h4 className="text-xl font-black text-secondary dark:text-white leading-tight">{product.nombre}</h4>
                        <div className="flex gap-4 mt-2">
                          <div className="text-[10px] font-bold text-slate-400">
                            {t('sales.unitPriceShort')}: <span className="text-secondary dark:text-white">Q{product.precio_unitario || product.precio_unidad}</span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-400">
                            {t('inventory.form.dozen')}: <span className="text-secondary dark:text-white">Q{product.precio_docena}</span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-400">
                            {t('inventory.form.wholesale')}: <span className="text-secondary dark:text-white">Q{product.precio_mayoreo}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${product.cantidad <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {product.cantidad} {t('sales.inStock')}
                        </div>
                        <button 
                          onMouseEnter={() => setShowConversion(product.id_producto)}
                          onMouseLeave={() => setShowConversion(null)}
                          className="mt-4 text-primary hover:text-primary-dark transition-colors"
                        >
                          <Info size={20} />
                        </button>
                      </div>
                    </div>

                    {showConversion === product.id_producto && (
                      <div className="absolute right-0 top-full mt-2 z-10 w-64 shadow-2xl transition-all">
                        {renderConversion(product.cantidad)}
                      </div>
                    )}
                  </div>
                ))
              ) : searchTerm && (
                <div className="text-center py-10 text-slate-400 font-bold">
                  {t('sales.noResults')} "{searchTerm}"
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Cart & Details */}
          <div className="flex-1 bg-white dark:bg-black/5 p-8 flex flex-col gap-6">
            <div className="space-y-3 shrink-0">
              <label className="text-xs font-black text-secondary/40 uppercase tracking-[0.2em] ml-2">{t('sales.customerLabel')}</label>
              <input 
                type="text"
                placeholder={t('sales.customerPlaceholder')}
                className="w-full bg-[#FFF5F0] border-none rounded-2xl p-5 font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/20"
                value={customer}
                onChange={e => setCustomer(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {cart.length > 0 ? (
                cart.map(item => (
                  <div key={item.productId} className="bg-white dark:bg-white/5 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-between group">
                    <div className="flex-1">
                      <h5 className="font-black text-secondary dark:text-white">{item.name}</h5>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-1">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                          {item.quantity < 12 ? 'U' : item.quantity < 50 ? 'D' : 'M'}
                        </span>
                        <span>Q{item.price} c/u</span>
                        <span className="text-secondary dark:text-white ml-2">Total: Q{(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-slate-100 dark:bg-white/10 rounded-xl p-1">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-2 hover:bg-white dark:hover:bg-black/20 rounded-lg text-slate-400 hover:text-primary transition-all"
                        >
                          <Minus size={16} />
                        </button>
                        <input 
                          type="number"
                          className="w-12 bg-transparent border-none text-center font-black text-secondary dark:text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={e => {
                            const val = e.target.value;
                            updateQuantity(item.productId, val === '' ? 0 : Number(val));
                          }}
                        />
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-2 hover:bg-white dark:hover:bg-black/20 rounded-lg text-slate-400 hover:text-primary transition-all"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.productId)}
                        className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                  <div className="bg-slate-50 dark:bg-white/5 p-10 rounded-[3rem]">
                    <ShoppingCart size={80} strokeWidth={1} />
                  </div>
                  <p className="font-black text-lg uppercase tracking-widest">{t('sales.emptyCart')}</p>
                </div>
              )}
            </div>

            {/* Grand Total Area */}
            <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-xl shadow-primary/20 shrink-0">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-black uppercase tracking-widest opacity-60">{t('sales.totalToPay')}</span>
                <span className="text-4xl font-black tracking-tighter">Q {calculateTotal().toFixed(2)}</span>
              </div>
              <button 
                disabled={loading || cart.length === 0}
                onClick={handleSubmit}
                className="w-full bg-white text-primary hover:bg-[#F0F0F0] active:scale-95 disabled:opacity-50 disabled:active:scale-100 py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-lg transition-all"
              >
                {loading ? (
                  t('sales.processing')
                ) : (
                  <>
                    <Check size={28} />
                    {t('sales.finishSale')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
