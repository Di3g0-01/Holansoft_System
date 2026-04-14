import React, { useState, useEffect } from 'react';
import { X, Search, ShoppingCart, Trash2, Plus, Minus, Info, Check } from 'lucide-react';
import type { Product, Sale, SaleItem } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../lib/api';
import { toast } from 'sonner';

interface EditSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sale: Sale | null;
}

interface CartItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  stock: number; // current stock in DB
  precio_unidad: number;
  precio_docena: number;
  precio_mayoreo: number;
}

export default function EditSaleModal({ isOpen, onClose, onSuccess, sale }: EditSaleModalProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConversion, setShowConversion] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && sale) {
      setCustomer(sale.customer);
      const initialCart: CartItem[] = sale.items.map((item: SaleItem) => ({
        productId: item.product.id_producto,
        name: item.product.nombre,
        quantity: item.cantidad,
        price: item.precio,
        stock: item.product.cantidad, 
        precio_unidad: item.product.precio_unidad,
        precio_docena: item.product.precio_docena,
        precio_mayoreo: item.product.precio_mayoreo
      }));
      setCart(initialCart);
    }
  }, [isOpen, sale]);

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

  const addToCart = (product: Product) => {
    const existing = cart.find((item: CartItem) => item.productId === product.id_producto);
    if (existing) {
      const newQty = existing.quantity + 1;
      updateQuantity(product.id_producto, newQty);
    } else {
      const newItem: CartItem = {
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
  };

  const updateQuantity = (productId: number, newQty: number) => {
    if (newQty < 0) return;
    
    setCart((prev: CartItem[]) => prev.map((item: CartItem) => {
      if (item.productId === productId) {
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
    setCart(cart.filter((item: CartItem) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum: number, item: CartItem) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;
    if (cart.length === 0) {
      toast.error(t('sales.emptyCart'));
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        customer: customer || t('common.finalConsumer') || 'Consumidor Final',
        items: cart.map((item: CartItem) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.price)
        }))
      };

      await api.patch(`/sales/${sale.id}`, payload);
      toast.success(t('inventory.form.success') || 'Sale updated!');
      onSuccess();
      onClose();
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
      
      <div className="relative bg-[#F8FAFC] dark:bg-surface-dark w-full max-w-5xl h-[95vh] sm:h-[90vh] rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 transition-all">
        {/* Header */}
        <div className="bg-[#AA5500] p-4 sm:p-8 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="bg-white/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
              <ShoppingCart size={24} className="sm:w-8 sm:h-8" />
            </div>
            <div>
              <h3 className="text-xl sm:text-3xl font-black tracking-tight">{t('sales.edit') || 'Editar Venta'}</h3>
              <p className="text-white/60 text-[10px] sm:text-sm font-bold">{sale?.rpNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all">
            <X size={24} className="sm:w-8 sm:h-8" />
          </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Side: Search & Catalog */}
          <div className="w-full lg:w-1/2 p-4 sm:p-8 border-b lg:border-r lg:border-b-0 border-gray-200 dark:border-white/5 flex flex-col gap-4 sm:gap-6 overflow-y-auto max-h-[40vh] lg:max-h-full">
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
                searchResults.map((product: Product) => (
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
                            {t('sales.unitPriceShort')}: <span className="text-secondary dark:text-white">Q{product.precio_unidad}</span>
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
          <div className="flex-1 bg-white dark:bg-black/5 p-4 sm:p-8 flex flex-col gap-4 sm:gap-6 overflow-hidden">
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
                cart.map((item: CartItem) => (
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
            <div className="bg-[#AA5500] p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-xl shadow-primary/20 shrink-0 mt-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <span className="text-xs font-black uppercase tracking-widest opacity-60">{t('sales.totalToPay')}</span>
                <span className="text-2xl sm:text-4xl font-black tracking-tighter">Q {calculateTotal().toFixed(2)}</span>
              </div>
              <button 
                disabled={loading || cart.length === 0}
                onClick={handleSubmit}
                className="w-full bg-white text-[#AA5500] hover:bg-[#F0F0F0] active:scale-95 disabled:opacity-50 disabled:active:scale-100 py-4 sm:py-6 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-lg transition-all"
              >
                {loading ? (
                  t('sales.processing')
                ) : (
                  <>
                    <Check size={20} className="sm:w-7 sm:h-7" />
                    {t('common.saveChanges') || 'Guardar Cambios'}
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
