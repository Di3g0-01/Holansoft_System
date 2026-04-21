import React, { useState, useEffect } from 'react';
import { X, Plus, AlertTriangle, Save, Check } from 'lucide-react';
import api from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Category } from '../../types';
import CustomSelect from '../ui/CustomSelect';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
  stock: string;
  alertQuantity: string;
}

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
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
    stock: '',
    alertQuantity: '5'
  });
  const [loading, setLoading] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

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
    setLoading(true);
    try {
      await api.post('/products', {
        code: formData.code,
        nombre: formData.name,
        marca: formData.brand,
        tamano: formData.size,
        tipo: formData.type,
        id_categoria: formData.categoryId ? Number(formData.categoryId) : null,
        precio_unidad: Number(formData.priceUnit),
        precio_docena: Number(formData.priceDozen),
        precio_mayoreo: Number(formData.priceWholesale),
        cantidad: Number(formData.stock),
        alerta_cantidad: Number(formData.alertQuantity),
      });
      onSuccess();
      onClose();
      setFormData({
        code: '',
        name: '',
        brand: '',
        size: '',
        type: '',
        categoryId: '',
        priceUnit: '',
        priceDozen: '',
        priceWholesale: '',
        stock: '',
        alertQuantity: '5'
      });
    } catch (err) {
      console.error(err);
      alert(t('inventory.form.savingError'));
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
      
      <div className="relative bg-white dark:bg-surface-dark rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header content matching screenshot */}
        <div className="bg-[#003366] p-6 sm:p-8 text-white flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">{t('inventory.form.newTitle')}</h3>
            <p className="text-white/60 text-xs sm:text-sm font-bold">{t('inventory.form.subtitle')}</p>
          </div>
          <button 
            onClick={onClose}
            className="hover:bg-white/10 p-2 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.code')}</label>
              <input 
                required
                type="text"
                placeholder="Ej: ISBN-000-000"
                className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold placeholder:text-secondary/20 focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.name')}</label>
              <input 
                required
                type="text"
                placeholder="Ej: Crónica de una muerte anunciada"
                className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold placeholder:text-secondary/20 focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.brand')}</label>
              <input 
                type="text"
                placeholder="Ej: Nike, Samsung..."
                className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold placeholder:text-secondary/20 focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.brand}
                onChange={e => setFormData({...formData, brand: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.size') || 'Tamaño'}</label>
              <input 
                type="text"
                placeholder={'Ej: XL, 500ml, 12"'}
                className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold placeholder:text-secondary/20 focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.size}
                onChange={e => setFormData({...formData, size: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.type') || 'Tipo'}</label>
              <input 
                type="text"
                placeholder="Ej: Deporte, Led..."
                className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold placeholder:text-secondary/20 focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.category')}</label>
            <div className="flex gap-2">
              {isAddingCategory ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder={t('inventory.form.placeholderCategory')}
                    className="flex-1 bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={handleCreateCategory}
                    className="bg-green-600 text-white px-4 rounded-2xl hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Check size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex-1 w-full">
                  <CustomSelect
                    options={[
                      { value: '', label: 'Seleccionar categoría...' },
                      ...categories.map(cat => ({ value: String(cat.id), label: cat.name || '' }))
                    ]}
                    value={formData.categoryId || ''}
                    onChange={(value) => setFormData({...formData, categoryId: value})}
                  />
                </div>
              )}
              <button 
                type="button"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className={`text-white p-4 flex items-center justify-center rounded-2xl transition-colors ${isAddingCategory ? 'bg-red-500 hover:bg-red-600' : 'bg-[#335577] hover:bg-secondary'}`}
              >
                {isAddingCategory ? <X size={24} /> : <Plus size={24} />}
              </button>
            </div>
          </div>

          {/* Price Schema Box */}
          <div className="bg-[#FFF5F0] rounded-[2rem] p-6 space-y-4">
            <div className="flex items-center gap-2 text-secondary/60 ml-2">
              <span className="text-secondary/60 flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full font-black text-[10px]">Q</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{t('inventory.form.priceSchema')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-secondary/40 uppercase tracking-widest ml-1">{t('inventory.form.unit')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 font-bold">Q</span>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-white border-none rounded-xl py-3 pl-8 pr-4 text-secondary font-bold outline-none"
                    value={formData.priceUnit}
                    onChange={e => setFormData({...formData, priceUnit: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-secondary/40 uppercase tracking-widest ml-1">{t('inventory.form.dozen')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 font-bold">Q</span>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-white border-none rounded-xl py-3 pl-8 pr-4 text-secondary font-bold outline-none"
                    value={formData.priceDozen}
                    onChange={e => setFormData({...formData, priceDozen: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-secondary/40 uppercase tracking-widest ml-1">{t('inventory.form.wholesale')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 font-bold">Q</span>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-white border-none rounded-xl py-3 pl-8 pr-4 text-secondary font-bold outline-none"
                    value={formData.priceWholesale}
                    onChange={e => setFormData({...formData, priceWholesale: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.initialStock')}</label>
              <div className="flex gap-2">
                <input 
                  required
                  type="number"
                  className="flex-1 bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold outline-none"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                />
                <div className="bg-[#FFF5F0] px-4 flex items-center rounded-2xl text-[10px] font-black text-secondary/30 uppercase tracking-widest">
                  {t('inventory.form.units')}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('inventory.form.alertQuantity')}</label>
              <div className="relative">
                <input 
                  required
                  type="number"
                  className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold outline-none"
                  value={formData.alertQuantity}
                  onChange={e => setFormData({...formData, alertQuantity: e.target.value})}
                />
                <AlertTriangle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400" size={20} />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 sm:gap-6 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto text-secondary font-black text-sm hover:text-primary transition-colors py-2"
            >
              {t('common.cancel')}
            </button>
            <button 
              disabled={loading}
              type="submit"
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-black px-10 py-4 rounded-2xl shadow-primary flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? t('inventory.form.saving') : t('inventory.form.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
