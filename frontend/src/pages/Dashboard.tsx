import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  X, 
  ArrowUpRight, 
  History as HistoryIcon,
  ShoppingBag
} from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import DashboardCharts from '../components/dashboard/DashboardCharts';

interface DashboardStats {
  products: number;
  lowStock: number;
  recentSales: number;
  recentPurchases: number;
}

interface ProductInfo {
  id_producto: number;
  code: string;
  nombre: string;
  cantidad: number;
  alerta_cantidad: number;
}

interface ActivityInfo {
  id: number;
  total: string | number;
  createdAt: string;
}

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    lowStock: 0,
    recentSales: 0,
    recentPurchases: 0
  });
  const [lowStockList, setLowStockList] = useState<ProductInfo[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityInfo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [summaryRes, lowStockRes, salesRes, purchasesRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/products/low-stock'),
        api.get('/sales'),
        api.get('/purchases')
      ]);
      
      setStats({
        products: summaryRes.data.products,
        lowStock: summaryRes.data.lowStock,
        recentSales: summaryRes.data.recentSales,
        recentPurchases: summaryRes.data.recentPurchases,
      });
      setLowStockList(lowStockRes.data);
      
      // Combine and sort activity
      const salesActivity = salesRes.data.map((s: any) => ({ 
        id: s.id, 
        total: s.total, 
        createdAt: s.date || s.createdAt, 
        type: 'sale' 
      }));
      const purchasesActivity = purchasesRes.data.map((p: any) => ({ 
        id: p.id, 
        total: p.total, 
        createdAt: p.date || p.createdAt, 
        type: 'purchase' 
      }));
      
      const combined = [...salesActivity, ...purchasesActivity]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
        
      setRecentActivity(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-10 animate-fade-in p-2 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="relative">
          <h2 className="text-4xl font-black text-secondary tracking-tighter">{t('dashboard.title')}</h2>
          <div className="h-1.5 w-16 bg-primary rounded-full mt-2"></div>
          <p className="text-slate-500 font-bold mt-3 max-w-md uppercase tracking-widest text-[10px] opacity-70">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={fetchStats}
              className="bg-white text-secondary font-black px-6 py-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md active:scale-95 transition-all flex items-center gap-2 group"
            >
                <div className={`${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`}>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                {t('common.update')}
            </button>
            <button className="bg-secondary text-white font-black px-6 py-3 rounded-2xl shadow-secondary hover:translate-y-[-2px] active:scale-95 transition-all flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {t('common.export')}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <div 
          onClick={() => navigate('/inventory')}
          className="relative group overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"></div>
          <div className="relative bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 shadow-premium border border-slate-100 dark:border-white/5 flex flex-col gap-6 hover:translate-y-[-8px] transition-all duration-500 h-full group-hover:bg-white/10 group-hover:backdrop-blur-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-white group-hover:text-blue-600 transition-colors shadow-sm">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-white/80 transition-colors">{t('dashboard.stats.products')}</p>
              <h3 className="text-5xl font-black text-secondary dark:text-white mt-1 group-hover:text-white transition-colors">{stats.products}</h3>
            </div>
            <div className="mt-auto pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-white transition-colors">
              <span className="flex items-center gap-1">{t('dashboard.actions.viewInventory')} <ArrowUpRight size={14} /></span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setIsModalOpen(true)}
          className="relative group overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"></div>
          <div className="relative bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 shadow-premium border border-slate-100 dark:border-white/5 flex flex-col gap-6 hover:translate-y-[-8px] transition-all duration-500 h-full group-hover:bg-white/10 group-hover:backdrop-blur-sm">
            <div className={`bg-red-50 dark:bg-red-900/20 w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${stats.lowStock > 0 ? 'text-red-600 bg-red-100 animate-pulse' : 'text-slate-400'} group-hover:bg-white transition-colors shadow-sm`}>
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-white/80 transition-colors">{t('dashboard.stats.lowStock')}</p>
              <h3 className="text-5xl font-black text-secondary dark:text-white mt-1 group-hover:text-white transition-colors">{stats.lowStock}</h3>
            </div>
            <div className="mt-auto pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between text-xs font-bold text-red-600 group-hover:text-white transition-colors">
              <span className="flex items-center gap-1">{t('dashboard.actions.showList')} <ArrowUpRight size={14} /></span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/purchases')}
          className="relative group overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"></div>
          <div className="relative bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 shadow-premium border border-slate-100 dark:border-white/5 flex flex-col gap-6 hover:translate-y-[-8px] transition-all duration-500 h-full group-hover:bg-white/10 group-hover:backdrop-blur-sm">
            <div className="bg-purple-50 dark:bg-purple-900/20 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-white transition-colors shadow-sm">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-white/80 transition-colors">{t('dashboard.stats.purchases')}</p>
              <h3 className="text-4xl font-black text-secondary dark:text-white mt-1 group-hover:text-white transition-colors">Q {stats.recentPurchases.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="mt-auto pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between text-xs font-bold text-purple-600 group-hover:text-white transition-colors">
              <span className="flex items-center gap-1">{t('dashboard.actions.viewPurchases')} <ArrowUpRight size={14} /></span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/reports')}
          className="relative group overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]"></div>
          <div className="relative bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 shadow-premium border border-slate-100 dark:border-white/5 flex flex-col gap-6 hover:translate-y-[-8px] transition-all duration-500 h-full group-hover:bg-white/10 group-hover:backdrop-blur-sm">
            <div className="bg-green-50 dark:bg-green-900/20 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-green-600 dark:text-green-400 group-hover:bg-white group-hover:text-green-600 transition-colors shadow-sm">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-white/80 transition-colors">{t('dashboard.stats.sales')}</p>
              <h3 className="text-4xl font-black text-secondary dark:text-white mt-1 group-hover:text-white transition-colors">Q {stats.recentSales.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="mt-auto pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between text-xs font-bold text-green-600 group-hover:text-white transition-colors">
              <span className="flex items-center gap-1">{t('dashboard.actions.viewReports')} <ArrowUpRight size={14} /></span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <DashboardCharts />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 pb-10">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-10 translate-y-[-10px] group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-2xl font-black text-secondary flex items-center gap-3">
                  <HistoryIcon className="w-6 h-6 text-primary" />
                  {t('dashboard.activity.title')}
                </h4>
              </div>
              <div className="space-y-4">
                  {recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-5 p-5 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                        <div className={`w-3 h-3 rounded-full ${(activity as any).type === 'purchase' ? 'bg-purple-500' : 'bg-green-500'} shadow-lg`} />
                        <div className="flex-1">
                            <p className="text-md font-bold text-secondary">
                              {(activity as any).type === 'purchase' ? t('dashboard.activity.purchase') : t('dashboard.activity.sale')} #{activity.id}
                            </p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                              {format(new Date(activity.createdAt), 'p', { locale: language === 'es' ? es : enUS })}
                            </p>
                        </div>
                        <span className={`font-black text-lg ${(activity as any).type === 'purchase' ? 'text-purple-600' : 'text-green-600'}`}>
                          Q {Number(activity.total).toFixed(2)}
                        </span>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-40">
                      <HistoryIcon size={48} className="mb-3" />
                      <p className="font-black text-gray-500">{t('dashboard.activity.noMovement')}</p>
                    </div>
                  )}
              </div>
          </div>

          <div className="bg-gradient-to-br from-[#003366] to-[#004488] rounded-[2.5rem] p-10 shadow-secondary text-white flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
              <div className="relative">
                  <h4 className="text-3xl font-black mb-2 tracking-tight">{t('dashboard.utility.title') || 'Rendimiento'}</h4>
                  <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px]">{t('dashboard.utility.subtitle') || 'Balance de Ingresos vs Gastos'}</p>
              </div>
              <div className="flex items-end justify-between mt-16 relative">
                  <div className="text-left">
                      <p className="text-5xl font-black mb-1">
                        {stats.recentSales > 0 
                          ? Math.round(((stats.recentSales - stats.recentPurchases) / stats.recentSales) * 100) 
                          : 0}
                        <span className="text-primary">%</span>
                      </p>
                      <p className="text-[10px] font-black text-white/40 tracking-[0.2em]">{t('dashboard.utility.label') || 'MARGEN DE UTILIDAD'}</p>
                  </div>
                  <div className="flex gap-2 items-end">
                      {[3, 8, 4, 12, 5, 9, 8, 14, 10, 18].map((h, i) => (
                          <div key={i} className={`w-3 bg-white/20 rounded-full group-hover:bg-primary transition-all duration-500 delay-${i*50}`} style={{ height: `${h * 3}px` }}></div>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-secondary/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-red-100 p-4 rounded-2xl text-red-600">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-secondary tracking-tight">{t('dashboard.stockAlertModal.title')}</h3>
                    <p className="text-slate-500 font-bold">{t('dashboard.stockAlertModal.subtitle')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-50 p-4 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {lowStockList.length > 0 ? lowStockList.map((product) => (
                  <div key={product.id_producto} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border-2 border-transparent hover:border-red-100 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center text-secondary shadow-sm group-hover:scale-105 transition-transform">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="font-black text-secondary text-lg">{product.nombre}</p>
                        <p className="text-sm font-bold text-slate-400">{t('dashboard.stockAlertModal.code')}: {product.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-red-600">{product.cantidad}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-secondary/40">{t('dashboard.stockAlertModal.available')}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10">
                    <p className="text-lg font-bold text-slate-400">{t('dashboard.stockAlertModal.optimal')}</p>
                  </div>
                )}
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-secondary font-black py-5 rounded-3xl transition-all"
                >
                  {t('dashboard.stockAlertModal.understand')}
                </button>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    navigate('/inventory');
                  }}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-3xl shadow-primary transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  {t('dashboard.stockAlertModal.goToPurchases')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
