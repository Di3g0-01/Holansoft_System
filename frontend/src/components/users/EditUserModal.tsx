import React, { useState, useEffect } from 'react';
import { X, Edit3, Check, Shield, User as UserIcon, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../lib/api';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        username: user.username,
        password: '',
        role: user.role
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const updateData: any = { ...formData };
      if (!updateData.password) delete updateData.password;

      await api.put(`/users/${user.id}`, updateData);
      toast.success(t('users.messages.successUpdate'));
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-surface-dark w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-[#003366] p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl">
              <Edit3 size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">{t('users.editUser')}</h3>
              <p className="text-white/60 text-sm font-bold">{user?.name}</p>
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
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  {t('users.form.newPassword')} <span className="text-[8px] opacity-40 lowercase">{t('users.form.optional')}</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="password" 
                    className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 pl-10 text-secondary font-bold outline-none focus:ring-2 focus:ring-primary/20" 
                    placeholder="••••••••"
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] ml-2">{t('users.form.role')}</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    className="w-full bg-[#FFF5F0] border-none rounded-2xl p-4 pl-12 text-secondary font-black outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">{t('users.form.standardUser')}</option>
                    <option value="admin">{t('users.form.admin')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="text-secondary font-black text-sm px-6">{t('common.cancel')}</button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-primary hover:bg-primary-dark text-white font-black px-8 py-4 rounded-2xl shadow-primary transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? t('common.loading') : <><Check size={20} /> {t('common.save')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
