import { X, ShoppingCart, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Sale } from '../../types';

interface SaleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export default function SaleDetailsModal({ isOpen, onClose, sale }: SaleDetailsModalProps) {
  const { t, language } = useLanguage();
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white dark:bg-surface-dark w-full max-w-3xl rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        
        {/* Header - fixed */}
        <div className="bg-primary p-5 sm:p-8 text-white flex items-center justify-between flex-shrink-0 rounded-t-[2rem] sm:rounded-t-[2.5rem]">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="bg-white/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex-shrink-0">
              <ShoppingCart size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-2xl font-black truncate">{t('sales.details.title')}</h3>
              <p className="text-white/60 font-bold text-xs sm:text-sm uppercase tracking-widest truncate">{sale.rpNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-xl transition-all flex-shrink-0 ml-2">
            <X size={22} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8 space-y-6">
          
          {/* Info Grid - responsive: 1 col mobile, 2 col tablet+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-center gap-3 sm:gap-4">
              <div className="bg-primary/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-primary flex-shrink-0">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{t('sales.table.customer')}</p>
                <p className="text-base sm:text-xl font-black text-secondary dark:text-white truncate">
                  {sale.customer === 'common.finalConsumer' ? t('common.finalConsumer') : sale.customer}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex items-center gap-3 sm:gap-4">
              <div className="bg-blue-50 dark:bg-blue-500/10 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-blue-500 flex-shrink-0">
                <Calendar size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{t('sales.table.date')}</p>
                <p className="text-sm sm:text-base font-black text-secondary dark:text-white">
                  {format(new Date(sale.date), 'PPP', { locale: language === 'es' ? es : enUS })}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table - with horizontal scroll on mobile */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">{t('sales.details.products')}</h4>
            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl sm:rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[480px]">
                  <thead className="bg-slate-100 dark:bg-black/20 text-slate-500 font-black uppercase tracking-widest text-[10px]">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 sm:py-4">{t('reports.details.product')}</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-center">{t('reports.details.quantity')}</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">{t('reports.details.priceCost')}</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">{t('reports.details.subtotal')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                    {sale.items?.map((item) => (
                      <tr key={item.id} className="text-secondary dark:text-white hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="font-bold text-sm">{item.product?.nombre}</div>
                          <div className="text-[10px] font-black text-slate-400">{item.product?.code}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-center font-black">{item.cantidad}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right font-bold whitespace-nowrap">Q {Number(item.precio).toFixed(2)}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right font-black whitespace-nowrap">Q {Number(item.sub_total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center bg-secondary p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] text-white shadow-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg">Q</div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest opacity-60">{t('common.total')}</span>
            </div>
            <span className="text-2xl sm:text-4xl font-black">Q {Number(sale.total).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
