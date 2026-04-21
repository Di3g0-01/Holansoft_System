import React, { useState } from 'react';
import { X, UserPlus, Check, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../lib/api';
import { toast } from 'sonner';
import CustomSelect from '../ui/CustomSelect';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', formData);
      toast.success(t('users.messages.successCreate'));
      onSuccess();
      onClose();
      setFormData({ name: '', username: '', password: '', role: 'user' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-surface-dark w-full max-w-lg rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-[#003366] p-6 sm:p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/10 p-2 rounded-xl">
              <UserPlus size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">{t('users.newUser')}</h3>
              <p className="text-white/60 text-[10px] sm:text-sm font-bold">{t('users.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('users.form.fullName')}</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required 
                  type="text" 
                  className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 pl-12 text-secondary font-bold outline-none focus:ring-2 focus:ring-primary/20" 
                  placeholder="Ej: Diego Valenzuela"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('users.form.username')}</label>
              <input 
                required 
                type="text" 
                className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold outline-none focus:ring-2 focus:ring-primary/20" 
                placeholder="ej: diego.val"
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('users.form.password')}</label>
                <input 
                  required 
                  type="password" 
                  className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 text-secondary font-bold outline-none focus:ring-2 focus:ring-primary/20" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('users.form.role')}</label>
                  <CustomSelect
                    options={[
                      { value: 'user', label: t('users.form.standardUser') },
                      { value: 'admin', label: t('users.form.admin') }
                    ]}
                    value={formData.role}
                    onChange={(val) => setFormData({ ...formData, role: val })}
                  />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="w-full sm:w-auto text-secondary font-black text-sm py-2">{t('common.cancel')}</button>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-black px-8 py-4 rounded-2xl shadow-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? t('common.loading') : <><Check size={20} /> {t('common.add')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
