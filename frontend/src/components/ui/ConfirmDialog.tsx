import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const colorMap = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      btn: 'bg-red-600 hover:bg-red-700 shadow-red-200',
      IconComponent: AlertTriangle
    },
    warning: {
      icon: 'bg-amber-100 text-amber-600',
      btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
      IconComponent: AlertTriangle
    },
    primary: {
      icon: 'bg-primary/10 text-primary',
      btn: 'bg-primary hover:bg-primary-dark shadow-primary/20',
      IconComponent: AlertTriangle // Can be changed if needed, but keeping it simple
    },
  };

  const colors = colorMap[variant];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-secondary/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-surface-dark rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 pb-0 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${colors.icon} shrink-0`}>
              <colors.IconComponent size={24} />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-secondary dark:text-white leading-tight">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 transition-all flex-shrink-0 mt-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <p className="px-6 sm:px-8 py-4 sm:py-5 text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
          {message}
        </p>

        {/* Footer */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="order-2 sm:order-1 flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-secondary dark:text-white font-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl transition-all active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`order-1 sm:order-2 flex-1 ${colors.btn} text-white font-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg transition-all active:scale-95`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
