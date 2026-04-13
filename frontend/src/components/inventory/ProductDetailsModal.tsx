import { X, Package, Tag, Layers, Ruler, BarChart3, Bell, DollarSign } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Product {
  id_producto: number;
  code: string;
  nombre: string;
  marca?: string;
  tamano?: string;
  tipo?: string;
  precio_unidad: number;
  precio_docena: number;
  precio_mayoreo: number;
  cantidad: number;
  alerta_cantidad: number;
  category: { name: string } | null;
}

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductDetailsModal({ isOpen, onClose, product }: ProductDetailsModalProps) {
  const { t } = useLanguage();
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-surface-dark w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-[#003366] p-10 text-white flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-white/10 p-4 rounded-3xl">
              <Package size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tight">{product.nombre}</h3>
              <p className="text-white/60 font-black text-xs uppercase tracking-[0.3em]">{product.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-3 rounded-2xl transition-all">
            <X size={28} />
          </button>
        </div>

        <div className="p-10 space-y-10">
          {/* Attributes Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Tag size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">{t('inventory.form.brand') || 'Marca'}</span>
              </div>
              <p className="font-bold text-secondary dark:text-white truncate">{product.marca || '-'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Ruler size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">{t('inventory.form.size') || 'Tamaño'}</span>
              </div>
              <p className="font-bold text-secondary dark:text-white truncate">{product.tamano || '-'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Layers size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">{t('inventory.form.type') || 'Tipo'}</span>
              </div>
              <p className="font-bold text-secondary dark:text-white truncate">{product.tipo || '-'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-3xl">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Layers size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">{t('inventory.form.category') || 'Categoría'}</span>
              </div>
              <p className="font-bold text-secondary dark:text-white truncate">{product.category?.name || '-'}</p>
            </div>
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-primary/5 dark:bg-primary/10 p-8 rounded-[2.5rem] border border-primary/20 flex flex-col items-center justify-center text-center">
              <div className="bg-primary/20 p-3 rounded-2xl text-primary mb-3"><BarChart3 size={24} /></div>
              <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">{t('common.stock') || 'Stock Actual'}</p>
              <p className="text-4xl font-black text-primary">{product.cantidad}</p>
            </div>
            <div className="bg-red-500/5 dark:bg-red-500/10 p-8 rounded-[2.5rem] border border-red-500/20 flex flex-col items-center justify-center text-center">
              <div className="bg-red-500/20 p-3 rounded-2xl text-red-500 mb-3"><Bell size={24} /></div>
              <p className="text-[10px] font-black text-red-500/60 uppercase tracking-widest mb-1">{t('inventory.form.alertQuantity') || 'Alerta Bajo'}</p>
              <p className="text-4xl font-black text-red-500">{product.alerta_cantidad}</p>
            </div>
          </div>

          {/* Pricing Schema */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 ml-2">
              <DollarSign size={16} className="text-slate-400" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('inventory.form.priceSchema')}</h4>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-100 dark:bg-white/5 p-5 rounded-3xl text-center">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('inventory.form.unit')}</p>
                <p className="text-xl font-black text-secondary dark:text-white">Q {Number(product.precio_unidad).toFixed(2)}</p>
              </div>
              <div className="bg-slate-100 dark:bg-white/5 p-5 rounded-3xl text-center">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('inventory.form.dozen')}</p>
                <p className="text-xl font-black text-secondary dark:text-white">Q {Number(product.precio_docena).toFixed(2)}</p>
              </div>
              <div className="bg-slate-100 dark:bg-white/5 p-5 rounded-3xl text-center">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t('inventory.form.wholesale')}</p>
                <p className="text-xl font-black text-secondary dark:text-white">Q {Number(product.precio_mayoreo).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
