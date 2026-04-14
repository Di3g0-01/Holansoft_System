import React, { useState, useEffect } from 'react';
import { X, Search, ShoppingBag, Trash2, Plus, Minus, Save, DollarSign } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../lib/api';
import { toast } from 'sonner';
import type { Product, Purchase, PurchaseItem } from '../../types';

interface EditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  purchase: Purchase | null;
}

interface PurchaseCartItem {
  productId: number;
  name: string;
  quantity: number;
  cost: number;
  stock: number;
  precio_unitario: number; // For UI helper or updating
  precio_unidad: number;
  precio_docena: number;
  precio_mayoreo: number;
}

export default function EditPurchaseModal({ isOpen, onClose, onSuccess, purchase }: EditPurchaseModalProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<PurchaseCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState('');

  useEffect(() => {
    if (isOpen && purchase) {
      setProvider(purchase.provider);
      const initialCart: PurchaseCartItem[] = purchase.items.map((item: PurchaseItem) => ({
        productId: item.product.id_producto,
        name: item.product.nombre,
        quantity: item.cantidad,
        cost: item.precio,
        stock: item.product.cantidad,
        precio_unitario: item.product.precio_unidad,
        precio_unidad: item.product.precio_unidad,
        precio_docena: item.product.precio_docena,
        precio_mayoreo: item.product.precio_mayoreo
      }));
      setCart(initialCart);
    }
  }, [isOpen, purchase]);

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
        precio_unitario: product.precio_unidad || 0,
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
    if (!purchase) return;
    if (cart.length === 0) {
      toast.error(t('purchases.emptyCart') || 'Debe agregar al menos un producto');
      return;
    }
    if (!provider.trim()) {
      toast.error(t('purchases.providerError') || 'Escriba el nombre del proveedor');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        provider: provider,
        date: purchase.date, // Keep original date
        items: cart.map((item: PurchaseCartItem) => ({
          productId: item.productId,
          quantity: item.quantity,
          cost: Number(item.cost),
          precio_unidad: Number(item.precio_unidad),
          precio_docena: Number(item.precio_docena),
          precio_mayoreo: Number(item.precio_mayoreo)
        }))
      };

      await api.patch(`/purchases/${purchase.id}`, payload);
      toast.success(t('inventory.form.success') || '¡Compra actualizada con éxito!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('purchases.error') || 'Error al actualizar la compra');
    } finally {
      setLoading(false);
    }
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
              <h3 className="text-xl sm:text-3xl font-black tracking-tight">{t('common.edit') || 'Editar'} {t('common.purchases')}</h3>
              <p className="text-white/60 text-[10px] sm:text-sm font-bold">{purchase?.poNumber}</p>
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

            <div className="grid grid-cols-1 gap-4">
              {searchResults.map((product: Product) => (
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
              ))}
            </div>
          </div>

          {/* Right Side: Cart */}
          <div className="flex-1 bg-white dark:bg-black/5 p-4 sm:p-8 flex flex-col gap-4 sm:gap-6 overflow-hidden">
            <div className="space-y-3 shrink-0">
              <label className="text-xs font-black text-secondary/40 uppercase tracking-[0.2em] ml-2">{t('purchases.providerLabel')}</label>
              <input 
                type="text"
                placeholder={t('purchases.providerPlaceholder')}
                className="w-full bg-[#E5E7EB] border-none rounded-2xl p-5 font-bold text-secondary outline-none focus:ring-2 focus:ring-blue-500/20"
                value={provider}
                onChange={e => setProvider(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {cart.length > 0 ? (
                cart.map((item: PurchaseCartItem) => (
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
                          onChange={e => updateCost(item.productId, Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('common.quantity')}</label>
                        <div className="flex items-center bg-slate-50 dark:bg-black/20 rounded-xl px-2">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Minus size={14} /></button>
                          <input 
                            type="number" 
                            className="w-20 bg-transparent border-none text-center font-black text-secondary dark:text-white outline-none"
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={e => updateQuantity(item.productId, Number(e.target.value))}
                            min="1"
                          />
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-black/10 p-4 rounded-2xl space-y-3">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('purchases.updateSellingPrices')}</p>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">Uni. <DollarSign size={10} /></label>
                            <input 
                              type="number" 
                              step="0.01"
                              className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs font-bold text-secondary dark:text-white outline-none" 
                              value={item.precio_unidad === 0 ? '' : item.precio_unidad} 
                              onChange={e => updatePriceField(item.productId, 'precio_unidad', Number(e.target.value))} 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">Doc. <DollarSign size={10} /></label>
                            <input 
                              type="number" 
                              step="0.01"
                              className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs font-bold text-secondary dark:text-white outline-none" 
                              value={item.precio_docena === 0 ? '' : item.precio_docena} 
                              onChange={e => updatePriceField(item.productId, 'precio_docena', Number(e.target.value))} 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">May. <DollarSign size={10} /></label>
                            <input 
                              type="number" 
                              step="0.01"
                              className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs font-bold text-secondary dark:text-white outline-none" 
                              value={item.precio_mayoreo === 0 ? '' : item.precio_mayoreo} 
                              onChange={e => updatePriceField(item.productId, 'precio_mayoreo', Number(e.target.value))} 
                            />
                          </div>
                       </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                  <ShoppingBag size={80} strokeWidth={1} />
                  <p className="font-black text-lg uppercase tracking-widest">{t('purchases.emptyCart')}</p>
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
                {loading ? t('common.loading') : <><Save size={24} className="sm:w-7 sm:h-7" /> {t('common.saveChanges')}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
