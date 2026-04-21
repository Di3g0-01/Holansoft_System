import React, { useState, useEffect } from 'react';
import { X, Search, ShoppingBag, Trash2, Plus, Minus, Check, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../lib/api';
import { toast } from 'sonner';
import InputDialog from '../ui/InputDialog';
import CustomSelect from '../ui/CustomSelect';
import type { Product, Category } from '../../types';

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface NewProductForm {
  code: string;
  nombre: string;
  brand: string;
  size: string;
  type: string;
  categoryId: string;
  priceUnit: string | number;
  priceDozen: string | number;
  priceWholesale: string | number;
  alertQuantity: string | number;
}


interface PurchaseCartItem {
  productId: number;
  name: string;
  quantity: number;
  cost: number;
  stock: number;
  precio_unidad: number;
  precio_docena: number;
  precio_mayoreo: number;
}

export default function AddPurchaseModal({ isOpen, onClose, onSuccess }: AddPurchaseModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<PurchaseCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderNumber] = useState(`C-${Date.now().toString().slice(-6)}`);
  
  const [providers, setProviders] = useState<string[]>(['Proveedor General']);
  const [selectedProvider, setSelectedProvider] = useState('Proveedor General');
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

  const { t } = useLanguage();
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const [newProduct, setNewProduct] = useState<NewProductForm>({
    code: '',
    nombre: '',
    brand: '',
    size: '',
    type: '',
    categoryId: '',
    priceUnit: '',
    priceDozen: '',
    priceWholesale: '',
    alertQuantity: '5'
  });
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/products', {
        code: newProduct.code,
        nombre: newProduct.nombre,
        marca: newProduct.brand,
        tamano: newProduct.size,
        tipo: newProduct.type,
        categoryId: newProduct.categoryId ? Number(newProduct.categoryId) : null,
        precio_unidad: Number(newProduct.priceUnit),
        precio_docena: Number(newProduct.priceDozen),
        precio_mayoreo: Number(newProduct.priceWholesale),
        cantidad: 0 // Initial stock is 0, will be updated by the purchase
      });
      addToCart(res.data);
      setIsQuickCreateOpen(false);
      setNewProduct({ code: '', nombre: '', brand: '', size: '', type: '', categoryId: '', priceUnit: '', priceDozen: '', priceWholesale: '', alertQuantity: '5' });
      toast.success(t('inventory.form.success') || 'Producto creado y agregado a la compra');
    } catch (err) {
      toast.error(t('inventory.form.savingError') || 'Error al crear el producto');
    }
  };

  const searchProducts = async () => {
    try {
      const res = await api.get(`/products?search=${searchTerm}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id_producto);
    if (existing) {
      updateQuantity(product.id_producto, existing.quantity + 1);
      } else {
      const newItem: PurchaseCartItem = {
        productId: product.id_producto,
        name: product.nombre,
        quantity: 1,
        cost: 0,
        stock: product.cantidad || 0,
        precio_unidad: product.precio_unidad || 0,
        precio_docena: product.precio_docena || 0,
        precio_mayoreo: product.precio_mayoreo || 0,
      };
      setCart([...cart, newItem]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateQuantity = (productId: number, newQty: number) => {
    if (newQty < 0) return;
    setCart(cart.map((item: PurchaseCartItem) => item.productId === productId ? { ...item, quantity: newQty } : item));
  };

  const updateCost = (productId: number, cost: number) => {
    setCart(cart.map((item: PurchaseCartItem) => item.productId === productId ? { ...item, cost } : item));
  };

  const updatePriceField = (productId: number, field: string, value: number) => {
    setCart(cart.map((item: PurchaseCartItem) => item.productId === productId ? { ...item, [field]: value } : item));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item: PurchaseCartItem) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum: number, item: PurchaseCartItem) => sum + (item.quantity * item.cost), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error(t('purchases.emptyCart') || 'Debe agregar al menos un producto');
      return;
    }
    if (!selectedProvider.trim()) {
      toast.error(t('purchases.providerError') || 'Seleccione un proveedor proveedor');
      return;
    }
    if (cart.some((item: PurchaseCartItem) => item.quantity < 1)) {
      toast.error(t('purchases.invalidQuantity') || 'La cantidad no puede estar vacía o ser 0 en ninguno de los productos');
      return;
    }
    setLoading(true);

    try {
      const payload = {
        poNumber: orderNumber,
        provider: selectedProvider,
        date: new Date().toISOString(),
        items: cart.map((item: PurchaseCartItem) => ({
          productId: item.productId,
          quantity: item.quantity,
          cost: Number(item.cost),
          precio_unidad: Number(item.precio_unidad),
          precio_docena: Number(item.precio_docena),
          precio_mayoreo: Number(item.precio_mayoreo)
        }))
      };

      await api.post('/purchases', payload);
      toast.success(t('purchases.success') || '¡Compra registrada con éxito!');
      onSuccess();
      onClose();
      setCart([]);
      setSelectedProvider('Proveedor General');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('purchases.error') || 'Error al registrar la compra');
    } finally {
      setLoading(false);
    }
  };

  const renderConversion = (qty: number) => {
    const dozens = Math.floor(qty / 12);
    const wholesale = Math.floor(qty / 50);
    return (
      <div className="bg-secondary p-4 rounded-2xl text-white text-xs space-y-2 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between border-b border-white/10 pb-1">
          <span>{t('purchases.currentUnits') || 'Unidades actuales'}:</span>
          <span className="font-black">{qty}</span>
        </div>
        <div className="flex justify-between border-b border-white/10 pb-1">
          <span>{t('inventory.form.dozen')}:</span>
          <span className="font-black">{dozens}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('inventory.form.wholesale')} (50s):</span>
          <span className="font-black">{wholesale}</span>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-secondary/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-[#F3F4F6] dark:bg-surface-dark w-full max-w-5xl h-[95vh] sm:h-[90vh] rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 transition-all">
        {/* Header */}
        <div className="bg-[#1e293b] p-4 sm:p-8 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="bg-white/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
              <ShoppingBag size={24} className="sm:w-8 sm:h-8" />
            </div>
            <div>
              <h3 className="text-xl sm:text-3xl font-black tracking-tight">{t('purchases.title')}</h3>
              <p className="text-white/60 text-[10px] sm:text-sm font-bold">{t('purchases.newPurchaseSubtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all">
            <X size={24} className="sm:w-8 sm:h-8" />
          </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Side: Search */}
          <div className="w-full lg:w-1/2 p-4 sm:p-8 border-b lg:border-r lg:border-b-0 border-gray-200 dark:border-white/5 flex flex-col gap-4 sm:gap-6 overflow-y-auto max-h-[40vh] lg:max-h-full">
            <div className="space-y-3">
              <label className="text-xs font-black text-secondary/40 uppercase tracking-[0.2em] ml-2">{t('purchases.searchProductTitle')}</label>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                <input 
                  autoFocus
                  type="text"
                  placeholder={t('purchases.searchPlaceholder')}
                  className="w-full bg-white dark:bg-black/20 border-none rounded-[1.5rem] py-5 pl-14 pr-6 text-xl font-bold text-secondary dark:text-white shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Results or Quick Create */}
            <div className="grid grid-cols-1 gap-4">
              {searchResults.length > 0 ? (
                searchResults.map((product: Product) => (
                  <div 
                    key={product.id_producto}
                    className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-transparent hover:border-blue-500/30 hover:shadow-xl transition-all cursor-pointer group relative"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{product.code}</span>
                        <h4 className="text-xl font-black text-secondary dark:text-white">{product.nombre}</h4>
                      </div>
                      <div className="text-right">
                        <div className="px-4 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-500">
                          {t('common.stock')}: {product.cantidad}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : searchTerm.length > 1 && (
                <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[2.5rem] border-2 border-dashed border-blue-200 dark:border-blue-500/20 text-center space-y-4">
                  <Plus className="mx-auto text-blue-500" size={48} />
                  <p className="text-blue-900 dark:text-blue-300 font-bold">{t('sales.noResults')} "{searchTerm}"</p>
                  <button 
                    onClick={() => {
                      setNewProduct({ ...newProduct, nombre: searchTerm });
                      setIsQuickCreateOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition-all active:scale-95"
                  >
                    {t('purchases.quickCreateProduct')}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Create Modal Interior */}
            {isQuickCreateOpen && (
              <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm" onClick={() => setIsQuickCreateOpen(false)} />
                <div className="relative bg-white dark:bg-surface-dark w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="bg-[#003366] p-8 text-white flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{t('purchases.quickCreateProduct')}</h3>
                      <p className="text-white/60 text-sm font-bold">{t('purchases.enterDetails')}</p>
                    </div>
                    <button onClick={() => setIsQuickCreateOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleQuickCreate} className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.table.code')}</label>
                        <input required type="text" className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold outline-none focus:ring-2 focus:ring-primary/20" value={newProduct.code} onChange={e => setNewProduct({...newProduct, code: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.table.name')}</label>
                        <input required type="text" className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold outline-none focus:ring-2 focus:ring-primary/20" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.brand') || 'Marca'}</label>
                        <input type="text" className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold outline-none" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.size') || 'Tamaño'}</label>
                        <input type="text" className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold outline-none" value={newProduct.size} onChange={e => setNewProduct({...newProduct, size: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.type') || 'Tipo'}</label>
                        <input type="text" className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold outline-none" value={newProduct.type} onChange={e => setNewProduct({...newProduct, type: e.target.value})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.table.category')}</label>
                        <CustomSelect
                          options={[
                            { value: '', label: t('inventory.form.selectCategory') || 'Seleccionar...' },
                            ...categories.map((cat: Category) => ({ value: String(cat.id), label: (cat.nombre || cat.name || '') as string }))
                          ]}
                          value={newProduct.categoryId}
                          onChange={(val) => setNewProduct({ ...newProduct, categoryId: val })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('purchases.stockAlert')}</label>
                        <input required type="number" className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold outline-none focus:ring-2 focus:ring-primary/20" value={newProduct.alertQuantity} onChange={e => setNewProduct({...newProduct, alertQuantity: e.target.value})} />
                      </div>
                    </div>

                    <div className="bg-[#FFF5F0] rounded-[2rem] p-6 space-y-4">
                      <div className="flex items-center gap-2 text-secondary/60 ml-2">
                        <Check size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('purchases.priceSchema')}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-secondary/40 uppercase tracking-widest ml-1">{t('purchases.unitary')}</label>
                          <input required type="number" step="0.01" className="w-full bg-white border-none rounded-xl p-3 text-secondary font-bold outline-none" value={newProduct.priceUnit} onChange={e => setNewProduct({...newProduct, priceUnit: e.target.value})} />

                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-secondary/40 uppercase tracking-widest ml-1">{t('inventory.form.dozen')}</label>
                          <input required type="number" step="0.01" className="w-full bg-white border-none rounded-xl p-3 text-secondary font-bold outline-none" value={newProduct.priceDozen} onChange={e => setNewProduct({...newProduct, priceDozen: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-secondary/40 uppercase tracking-widest ml-1">{t('inventory.form.wholesale')}</label>
                          <input required type="number" step="0.01" className="w-full bg-white border-none rounded-xl p-3 text-secondary font-bold outline-none" value={newProduct.priceWholesale} onChange={e => setNewProduct({...newProduct, priceWholesale: e.target.value})} />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                      <button type="button" onClick={() => setIsQuickCreateOpen(false)} className="text-secondary font-black text-sm px-6">{t('common.cancel')}</button>
                      <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-black px-8 py-4 rounded-2xl shadow-primary transition-all">{t('inventory.form.save')}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Cart */}
          <div className="flex-1 bg-white dark:bg-black/5 p-4 sm:p-8 flex flex-col gap-4 sm:gap-6 overflow-hidden">
            <div className="space-y-3 shrink-0">
              <label className="text-xs font-black text-secondary/40 uppercase tracking-[0.2em] ml-2">{t('purchases.providerLabel')}</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <CustomSelect
                    options={providers.map(p => ({ value: p, label: p }))}
                    value={selectedProvider}
                    onChange={val => setSelectedProvider(val)}
                  />
                </div>
                <button 
                  onClick={() => setIsProviderModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-sm transition-transform active:scale-95"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {cart.length > 0 ? (
                cart.map((item: any) => (
                  <div key={item.productId} className="bg-white dark:bg-white/5 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h5 className="font-black text-secondary dark:text-white text-lg">{item.name}</h5>
                      <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-red-500"><Trash2 size={20} /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('purchases.unitCost')}</label>
                        <input 
                          type="number"
                          className="w-full bg-slate-50 dark:bg-black/20 border-none rounded-xl p-3 font-bold text-secondary outline-none"
                          value={item.cost === 0 ? '' : item.cost}
                          onChange={e => {
                            const val = e.target.value;
                            updateCost(item.productId, val === '' ? 0 : Number(val));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('common.quantity')}</label>
                        <div className="flex items-center bg-slate-50 dark:bg-black/20 rounded-xl px-2">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Minus size={14} /></button>
                          <input 
                            type="number" 
                            className="w-20 bg-transparent border-none text-center font-black text-secondary dark:text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={e => {
                              const val = e.target.value;
                              updateQuantity(item.productId, val === '' ? 0 : Number(val));
                            }}
                            min="1"
                          />
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>

                    {/* Selling Prices Updates */}
                    <div className="bg-slate-50 dark:bg-black/10 p-4 rounded-2xl space-y-3">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('purchases.updateSellingPrices')}</p>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">Uni. <span className="text-[10px]">Q</span></label>
                            <input 
                              type="number" 
                              step="0.01"
                              className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs font-bold text-secondary dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" 
                              value={item.precio_unidad === 0 ? '' : item.precio_unidad} 
                              onChange={e => {
                                const val = e.target.value;
                                updatePriceField(item.productId, 'precio_unidad', val === '' ? 0 : Number(val));
                              }} 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">Doc. <span className="text-[10px]">Q</span></label>
                            <input 
                              type="number" 
                              step="0.01"
                              className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs font-bold text-secondary dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" 
                              value={item.precio_docena === 0 ? '' : item.precio_docena} 
                              onChange={e => {
                                const val = e.target.value;
                                updatePriceField(item.productId, 'precio_docena', val === '' ? 0 : Number(val));
                              }} 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">May. <span className="text-[10px]">Q</span></label>
                            <input 
                              type="number" 
                              step="0.01"
                              className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs font-bold text-secondary dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" 
                              value={item.precio_mayoreo === 0 ? '' : item.precio_mayoreo} 
                              onChange={e => {
                                const val = e.target.value;
                                updatePriceField(item.productId, 'precio_mayoreo', val === '' ? 0 : Number(val));
                              }} 
                            />
                          </div>
                       </div>
                    </div>
                    {/* Conversion Helper */}
                    <div className="mt-2">
                       {renderConversion(item.quantity)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                  <ShoppingBag size={80} strokeWidth={1} />
                  <p className="font-black text-lg uppercase tracking-widest">{t('purchases.emptyCart') || 'Ingrese su Pedido'}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-xl shrink-0 mt-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <span className="text-xs font-black uppercase tracking-widest opacity-60">{t('common.total')}</span>
                <span className="text-2xl sm:text-4xl font-black">Q {calculateTotal().toFixed(2)}</span>
              </div>
              <button 
                disabled={loading || cart.length === 0}
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 py-4 sm:py-6 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition-all"
              >
                {loading ? t('common.loading') : <><Save size={24} className="sm:w-7 sm:h-7" /> {t('purchases.confirmPurchase')}</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <InputDialog
        isOpen={isProviderModalOpen}
        title="Nuevo Proveedor"
        placeholder="Nombre del proveedor..."
        onConfirm={(name) => {
          setProviders(prev => [...prev, name]);
          setSelectedProvider(name);
          setIsProviderModalOpen(false);
        }}
        onCancel={() => setIsProviderModalOpen(false)}
      />

    </div>
  );
}
