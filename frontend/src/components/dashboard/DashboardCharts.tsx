import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import api from '../../lib/api';
import { TrendingUp, PieChart as PieIcon, AlertTriangle, CheckCircle, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function DashboardCharts() {
  const [weeklySales, setWeeklySales] = useState<any[]>([]);
  const [weeklyPurchases, setWeeklyPurchases] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [stockStatus, setStockStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // Changed default to month for utility focus
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesRes, purchasesRes, catRes, stockRes] = await Promise.all([
        api.get(`/analytics/weekly-sales?period=${period}&lang=${language}`),
        api.get(`/analytics/weekly-purchases?period=${period}&lang=${language}`),
        api.get('/analytics/categories'),
        api.get('/analytics/stock-status')
      ]);
      setWeeklySales(salesRes.data);
      setWeeklyPurchases(purchasesRes.data);
      setCategoryDistribution(catRes.data);
      
      const translatedStock = stockRes.data.map((s: any) => ({
        ...s,
        name: s.name === 'goodStock' ? t('common.status.optimal') : t('common.status.lowStock')
      }));
      setStockStatus(translatedStock);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const utilityData = weeklySales.map((sale) => {
    const purchase = weeklyPurchases.find(p => p.name === sale.name) || { total: 0 };
    return {
      name: sale.name,
      utility: sale.total - purchase.total,
      sales: sale.total,
      purchases: purchase.total
    };
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white dark:bg-surface-dark h-80 rounded-[2.5rem] shadow-sm shadow-blue-500/5"></div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20 flex items-center justify-between">
          <div>
            <p className="text-white/60 font-black uppercase tracking-widest text-xs mb-2">{t('dashboard.charts.salesWeekly')}</p>
            <h3 className="text-4xl font-black">Q {weeklySales.reduce((a: number, b: any) => a + b.total, 0).toLocaleString()}</h3>
          </div>
          <div className="bg-white/10 p-4 rounded-3xl"><TrendingUp size={32} /></div>
        </div>

        <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-2">{t('dashboard.charts.inventoryHealth')}</p>
            <div className="flex items-center gap-2">
              <h3 className="text-4xl font-black text-secondary dark:text-white">
                {Math.round((stockStatus.find((s: any) => s.name === t('common.status.optimal')) as any)?.value / 
                (stockStatus.reduce((a: number, b: any) => a + b.value, 0) || 1) * 100)}%
              </h3>
              <span className="text-emerald-500 font-bold text-sm">{t('dashboard.charts.optimal')}</span>
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-3xl text-emerald-500"><CheckCircle size={32} /></div>
        </div>

        <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-2">{t('dashboard.charts.stockAlerts')}</p>
            <h3 className="text-4xl font-black text-secondary dark:text-white">
              {(stockStatus.find((s: any) => s.name === t('common.status.lowStock')) as any)?.value || 0}
            </h3>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-3xl text-amber-500"><AlertTriangle size={32} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Sales Chart */}
        <div className="bg-white dark:bg-surface-dark p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-2xl text-blue-500"><TrendingUp size={24} /></div>
              <h4 className="text-xl font-black text-secondary dark:text-white">
                {t('common.sales')} ({period === 'month' ? t('dashboard.charts.ranges.month') : period === 'week' ? t('dashboard.charts.ranges.week') : t('dashboard.charts.ranges.day')})
              </h4>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySales} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 10}} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 10}} 
                  tickFormatter={(value) => `Q${Number(value).toLocaleString()}`}
                />
                <Tooltip 
                  cursor={{fill: '#F1F5F9'}} 
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Purchases Chart */}
        <div className="bg-white dark:bg-surface-dark p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 dark:bg-purple-500/10 p-3 rounded-2xl text-purple-500"><ShoppingBag size={24} /></div>
              <h4 className="text-xl font-black text-secondary dark:text-white">
                {t('common.purchases')} ({period === 'month' ? t('dashboard.charts.ranges.month') : period === 'week' ? t('dashboard.charts.ranges.week') : t('dashboard.charts.ranges.day')})
              </h4>
            </div>
            
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
              <button 
                onClick={() => setPeriod('day')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${period === 'day' ? 'bg-white dark:bg-secondary shadow-sm text-primary' : 'text-slate-500 hover:text-secondary dark:hover:text-white'}`}
              >
                {t('dashboard.charts.periods.day')}
              </button>
              <button 
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${period === 'week' ? 'bg-white dark:bg-secondary shadow-sm text-primary' : 'text-slate-500 hover:text-secondary dark:hover:text-white'}`}
              >
                {t('dashboard.charts.periods.week')}
              </button>
              <button 
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${period === 'month' ? 'bg-white dark:bg-secondary shadow-sm text-primary' : 'text-slate-500 hover:text-secondary dark:hover:text-white'}`}
              >
                {t('dashboard.charts.periods.month')}
              </button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyPurchases} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 10}} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 10}} 
                  tickFormatter={(value) => `Q${Number(value).toLocaleString()}`}
                />
                <Tooltip 
                  cursor={{fill: '#F1F5F9'}} 
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white dark:bg-surface-dark p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 lg:col-span-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-violet-50 dark:bg-violet-500/10 p-3 rounded-2xl text-violet-500"><PieIcon size={24} /></div>
            <h4 className="text-xl font-black text-secondary dark:text-white">{t('dashboard.charts.categoryDist')}</h4>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Utility Chart */}
        <div className="bg-white dark:bg-surface-dark p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 lg:col-span-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-2xl text-emerald-500"><TrendingUp size={24} /></div>
            <h4 className="text-xl font-black text-secondary dark:text-white">
              {t('dashboard.charts.utilityMonth') || 'Utilidad Mensual (Ingresos - Gastos)'}
            </h4>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilityData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 10}} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 10}} 
                  tickFormatter={(value) => `Q${Number(value).toLocaleString()}`}
                />
                <Tooltip 
                  cursor={{fill: '#F1F5F9'}} 
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: any) => [`Q ${Number(value).toFixed(2)}`, '']}
                />
                <Bar dataKey="utility" radius={[6, 6, 0, 0]} barSize={50}>
                  {utilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.utility >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
