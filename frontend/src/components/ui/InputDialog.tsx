import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface InputDialogProps {
  isOpen: boolean;
  title: string;
  placeholder?: string;
  initialValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function InputDialog({ isOpen, title, placeholder, initialValue = '', onConfirm, onCancel }: InputDialogProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-secondary/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      <div className="relative bg-white dark:bg-surface-dark rounded-[1.5rem] sm:rounded-[2rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="bg-[#003366] p-5 sm:p-6 text-white flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-black tracking-tight">{title}</h3>
          <button onClick={onCancel} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          <input 
            autoFocus
            type="text"
            placeholder={placeholder}
            className="w-full bg-[#FFF5F0] dark:bg-black/20 border-none rounded-2xl p-4 text-secondary dark:text-white font-bold outline-none focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
            value={value}
            onChange={e => setValue(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              type="button"
              onClick={onCancel}
              className="order-2 sm:order-1 flex-1 text-secondary dark:text-slate-400 font-black text-sm hover:text-primary transition-colors py-3"
            >
              {t('common.cancel') || 'Cancelar'}
            </button>
            <button 
              type="submit"
              disabled={!value.trim()}
              className="order-1 sm:order-2 flex-1 bg-primary hover:bg-primary-dark text-white font-black py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-primary flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all disabled:opacity-50"
            >
              <Check size={18} />
              {t('common.save') || 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
