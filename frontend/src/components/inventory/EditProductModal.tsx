import React, { useState, useEffect } from 'react';
import { X, Plus, AlertTriangle, Save, Check } from 'lucide-react';
import api from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Product, Category } from '../../types';
import CustomSelect from '../ui/CustomSelect';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
}

interface FormData {
  code: string;
  name: string;
  brand: string;
  size: string;
  type: string;
  categoryId: string;
  priceUnit: string;
  priceDozen: string;
  priceWholesale: string;
  alertQuantity: string;
}

export default function EditProductModal({ isOpen, onClose, onSuccess, product }: EditProductModalProps) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    brand: '',
    size: '',
    type: '',
    categoryId: '',
    priceUnit: '',
    priceDozen: '',
    priceWholesale: '',
    alertQuantity: '5'
  });
  const [loading, setLoading] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (product) {
        setFormData({
          code: product.code || '',
          name: product.nombre || '',
          brand: product.marca || '',
          size: product.tamano || '',
          type: product.tipo || '',
          categoryId: product.id_categoria?.toString() || product.category?.id?.toString() || '',
          priceUnit: product.precio_unidad?.toString() || '',
          priceDozen: product.precio_docena?.toString() || '',
          priceWholesale: product.precio_mayoreo?.toString() || '',
          alertQuantity: product.alerta_cantidad?.toString() || '5'
        });
      }
    }
  }, [isOpen, product]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await api.post('/categories', { name: newCategoryName });
      setCategories([...categories, res.data]);
      setFormData({ ...formData, categoryId: res.data.id?.toString() });
      setIsAddingCategory(false);
      setNewCategoryName('');
    } catch (err) {
      console.error(err);
      alert(t('inventory.form.errorCategory'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setLoading(true);
    try {
      await api.put(`/products/${product.id_producto}`, {
        code: formData.code,
        nombre: formData.name,
        marca: formData.brand,
        tamano: formData.size,
        tipo: formData.type,
        id_categoria: formData.categoryId ? Number(formData.categoryId) : null,
        precio_unidad: Number(formData.priceUnit),
        precio_docena: Number(formData.priceDozen),
        precio_mayoreo: Number(formData.priceWholesale),
        alerta_cantidad: Number(formData.alertQuantity),
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-secondary/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-surface-dark rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header content matching screenshot */}
        <div className="bg-[#003366] p-6 sm:p-10 text-white flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 className="text-xl sm:text-3xl font-black tracking-tight">{t('inventory.form.editTitle')}</h3>
            <p className="text-white/60 text-xs sm:text-sm font-bold">{t('inventory.form.editSubtitle')}</p>
          </div>
          <button 
            onClick={onClose}
            className="hover:bg-white/10 p-2 sm:p-3 rounded-2xl transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.code')}</label>
              <input 
                required
                type="text"
                placeholder="Ej: ISBN-000-000"
                className="w-full bg-[#FFF5F0] border-none rounded-[1.5rem] p-5 text-secondary font-bold placeholder:text-secondary/20 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.name')}</label>
              <input 
                required
                type="text"
                placeholder="Ej: Crónica de una muerte anunciada"
                className="w-full bg-[#FFF5F0] border-none rounded-[1.5rem] p-5 text-secondary font-bold placeholder:text-secondary/20 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.brand')}</label>
              <input 
                type="text"
                placeholder="Ej: Nike, Samsung..."
                className="w-full bg-[#FFF5F0] border-none rounded-[1.5rem] p-5 text-secondary font-bold placeholder:text-secondary/20 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={formData.brand}
                onChange={e => setFormData({...formData, brand: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.size') || 'Tamaño'}</label>
              <input 
                type="text"
                placeholder={'Ej: XL, 500ml, 12"'}
                className="w-full bg-[#FFF5F0] border-none rounded-[1.5rem] p-5 text-secondary font-bold placeholder:text-secondary/20 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={formData.size}
                onChange={e => setFormData({...formData, size: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.type') || 'Tipo'}</label>
              <input 
                type="text"
                placeholder="Ej: Deporte, Led..."
                className="w-full bg-[#FFF5F0] border-none rounded-[1.5rem] p-5 text-secondary font-bold placeholder:text-secondary/20 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.category')}</label>
            <div className="flex gap-3">
              {isAddingCategory ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder={t('inventory.form.placeholderCategory')}
                    className="flex-1 bg-[#FFF5F0] border-none rounded-[1.5rem] p-5 text-secondary font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={handleCreateCategory}
                    className="bg-green-600 text-white px-5 rounded-[1.5rem] hover:bg-green-700 transition-colors flex items-center justify-center shadow-lg shadow-green-900/20"
                  >
                    <Check size={24} />
                  </button>
                </div>
              ) : (
                <div className="flex-1 w-full">
                  <CustomSelect
                    options={[
                      { value: '', label: 'Seleccionar categoría...' },
                      ...categories.map(cat => ({ value: String(cat.id), label: cat.name }))
                    ]}
                    value={formData.categoryId || ''}
                    onChange={(value) => setFormData({...formData, categoryId: value})}
                  />
                </div>
              )}
              <button 
                type="button"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className={`text-white p-5 flex items-center justify-center rounded-[1.5rem] transition-all hover:translate-y-[-2px] shadow-lg ${isAddingCategory ? 'bg-red-500 hover:bg-red-600 shadow-red-900/20' : 'bg-[#335577] hover:bg-secondary shadow-blue-900/20'}`}
              >
                {isAddingCategory ? <X size={28} /> : <Plus size={28} />}
              </button>
            </div>
          </div>

          {/* Price Schema Box */}
          <div className="bg-[#FFF5F0] rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-3 text-secondary/60 ml-2">
              <span className="text-secondary/60 flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full font-black text-xs">Q</span>
              <span className="text-xs font-black uppercase tracking-[0.2em]">{t('inventory.form.priceSchema')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest ml-1">{t('inventory.form.unit')}</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40 font-bold">Q</span>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-white border-none rounded-2xl py-4 pl-10 pr-5 text-secondary font-black outline-none shadow-sm focus:shadow-md transition-shadow"
                    value={formData.priceUnit}
                    onChange={e => setFormData({...formData, priceUnit: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest ml-1">{t('inventory.form.dozen')}</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40 font-bold">Q</span>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-white border-none rounded-2xl py-4 pl-10 pr-5 text-secondary font-black outline-none shadow-sm focus:shadow-md transition-shadow"
                    value={formData.priceDozen}
                    onChange={e => setFormData({...formData, priceDozen: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest ml-1">{t('inventory.form.wholesale')}</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40 font-bold">Q</span>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-white border-none rounded-2xl py-4 pl-10 pr-5 text-secondary font-black outline-none shadow-sm focus:shadow-md transition-shadow"
                    value={formData.priceWholesale}
                    onChange={e => setFormData({...formData, priceWholesale: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-w-[280px]">
            <label className="text-xs font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.alertQuantity')}</label>
            <div className="relative">
              <input 
                required
                type="number"
                className="w-full bg-[#FFF5F0] border-none rounded-[1.5rem] p-5 text-secondary font-bold outline-none"
                value={formData.alertQuantity}
                onChange={e => setFormData({...formData, alertQuantity: e.target.value})}
              />
              <AlertTriangle className="absolute right-5 top-1/2 -translate-y-1/2 text-red-400" size={24} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-8 pt-6">
            <button 
              type="button"
              onClick={onClose}
              className="text-secondary font-black text-sm hover:text-primary transition-colors pr-4"
            >
              {t('common.cancel')}
            </button>
            <button 
              disabled={loading}
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-black px-12 py-5 rounded-[1.5rem] shadow-primary flex items-center gap-2 hover:translate-y-[-2px] active:scale-95 transition-all disabled:opacity-50"
            >
              <Save size={24} />
              {loading ? t('inventory.form.updating') : t('inventory.form.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
