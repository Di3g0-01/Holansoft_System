import React, { useState, useEffect } from 'react';
import { X, Search, Trash2, Plus, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../lib/api';
import { toast } from 'sonner';
import InputDialog from '../ui/InputDialog';
import CustomSelect from '../ui/CustomSelect';
import type { Product } from '../../types';

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
      toast.error(t('purchases.providerError') || 'Seleccione un proveedor');
      return;
    }
    if (cart.some((item: PurchaseCartItem) => item.quantity < 1)) {
      toast.error(t('purchases.invalidQuantity') || 'La cantidad no puede estar vacía o ser 0');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#fafaf9] dark:bg-surface-dark w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-[#0f172a] p-6 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold tracking-tight">{t('purchases.title')}</h3>
            <p className="text-slate-400 text-xs font-medium">{t('purchases.newPurchaseSubtitle')}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Provider Section */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('purchases.providerLabel')}</label>
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
                className="bg-[#f97316] hover:bg-[#ea580c] text-white p-3 sm:p-3.5 rounded-xl shadow-sm transition-transform active:scale-95 shrink-0"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('purchases.searchProductTitle')}</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder={t('purchases.searchPlaceholder')}
                className="w-full bg-[#fff7ed] dark:bg-black/20 border-none rounded-xl py-3.5 sm:py-4 pl-12 pr-6 text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-slate-100 dark:border-white/5 z-50 overflow-hidden max-h-60 overflow-y-auto">
                  {searchResults.map((product) => (
                    <div 
                      key={product.id_producto}
                      onClick={() => addToCart(product)}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="font-bold text-slate-700 dark:text-white truncate">{product.nombre}</p>
                        <p className="text-[10px] text-slate-400 font-black">{product.code}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-400 shrink-0">Stock: {product.cantidad}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Table with horizontal scroll on mobile */}
          <div className="bg-white dark:bg-black/10 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px] sm:min-w-full">
                <thead className="bg-[#fff7ed] dark:bg-white/5 text-slate-500 font-black uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                  <tr>
                    <th className="px-4 sm:px-6 py-4">{t('inventory.table.code')}</th>
                    <th className="px-4 sm:px-6 py-4">{t('inventory.table.name')}</th>
                    <th className="px-4 sm:px-6 py-4 text-center">{t('common.quantity')}</th>
                    <th className="px-4 sm:px-6 py-4 text-center">{t('purchases.unitCost')}</th>
                    <th className="px-4 sm:px-6 py-4 text-right">{t('reports.table.total')}</th>
                    <th className="px-4 sm:px-6 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {cart.map((item) => (
                    <tr key={item.productId} className="group">
                      <td className="px-4 sm:px-6 py-4 font-mono text-slate-400 text-[10px]">{item.productId}</td>
                      <td className="px-4 sm:px-6 py-4 font-bold text-slate-700 dark:text-white max-w-[150px] sm:max-w-none truncate">{item.name}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-center">
                          <input 
                            type="number"
                            className="w-16 sm:w-20 bg-slate-50 dark:bg-black/20 border-none rounded-lg p-2 text-center font-bold text-slate-700 dark:text-white outline-none text-xs"
                            value={item.quantity}
                            onChange={e => updateQuantity(item.productId, Number(e.target.value))}
                          />
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <span className="text-slate-400 font-bold">Q</span>
                          <input 
                            type="number"
                            step="0.01"
                            className="w-20 sm:w-24 bg-slate-50 dark:bg-black/20 border-none rounded-lg p-2 font-bold text-slate-700 dark:text-white outline-none text-xs"
                            value={item.cost || ''}
                            onChange={e => updateCost(item.productId, Number(e.target.value))}
                          />
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right font-black text-[#f97316] text-sm sm:text-xs">
                        Q {(item.quantity * item.cost).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cart.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                        {t('purchases.emptyCart') || 'No hay productos en la compra'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer / Summary */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex justify-end items-center gap-4 sm:gap-8">
                <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">TOTAL COMPRA</span>
                <span className="text-xl sm:text-2xl font-black text-[#0f172a] dark:text-white">Q {calculateTotal().toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-surface-dark flex justify-end items-center gap-4 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button 
            disabled={loading || cart.length === 0}
            onClick={handleSubmit}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white px-8 py-3.5 rounded-xl shadow-lg shadow-orange-500/20 font-black text-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <span className="animate-spin text-lg">⏳</span> : <><Save size={18} /> {t('purchases.confirmPurchase')}</>}
          </button>
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
