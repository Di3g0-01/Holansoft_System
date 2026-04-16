import React, { useState, useMemo, useEffect } from 'react';
import api from '../lib/api';
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Calendar, TrendingUp, Filter, Search, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import DatePicker from '../components/ui/DatePicker';
import CustomSelect from '../components/ui/CustomSelect';

type FilterMode = 'day' | 'week' | 'range';

export default function ReportsPage() {
  const { t, language } = useLanguage();
  const [filterMode, setFilterMode] = useState<FilterMode>('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('sales'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const toggleRow = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };
  const applyFilter = async (mode: FilterMode) => {
    setFilterMode(mode);
    let start = new Date();
    let end = new Date();

    if (mode === 'day') {
      start = startOfDay(start);
      end = endOfDay(end);
    } else if (mode === 'week') {
      // Sunday to Sunday logic
      start = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday
      end = endOfWeek(new Date(), { weekStartsOn: 0 }); // Saturday/Sunday
    } else {
      return; // Range mode handles itself with generateReport button
    }

    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');
    setStartDate(startStr);
    setEndDate(endStr);
    fetchData(startStr, endStr);
  };

  const fetchData = async (s: string, e: string) => {
    if (!s || !e) return;
    setLoading(true);
    try {
      const endpoint = type === 'sales' ? '/reports/sales' : '/reports/purchases';
      const res = await api.get(`${endpoint}?start=${s}&end=${e}`);
      setReportData(res.data);
      setExpandedRows([]); // Reset expansions on new data
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => fetchData(startDate, endDate);

  // Auto-fetch when type, startDate or endDate changes
  useEffect(() => {
    if (startDate && endDate) {
      fetchData(startDate, endDate);
    }
  }, [type, startDate, endDate]);

  // Initial fetch for 'day' mode
  useEffect(() => {
    applyFilter('day');
  }, []);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return reportData;

    return reportData.filter(item => {
      const customer = (item.customer || item.provider || '').toLowerCase();
      const docNum = (item.rpNumber || item.poNumber || '').toLowerCase();
      const matchBase = customer.includes(term) || docNum.includes(term);
      
      const matchProducts = item.items?.some((i: any) => 
        i.product?.nombre?.toLowerCase().includes(term) ||
        i.product?.code?.toLowerCase().includes(term) ||
        i.product?.marca?.toLowerCase().includes(term) ||
        i.product?.tamano?.toLowerCase().includes(term) ||
        i.product?.tipo?.toLowerCase().includes(term) ||
        i.product?.category?.nombre?.toLowerCase().includes(term)
      );

      return matchBase || matchProducts;
    });
  }, [reportData, searchTerm]);

  const stats = useMemo(() => {
    const total = filteredData.reduce((acc, curr) => acc + Number(curr.total), 0);
    const count = filteredData.length;
    const avg = count > 0 ? total / count : 0;
    return { total, count, avg };
  }, [filteredData]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-secondary dark:text-white tracking-tight">{t('reports.title')}</h2>
          <p className="text-slate-500 font-bold mt-1">{t('reports.subtitle')}</p>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 text-slate-600 px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 font-bold hover:bg-slate-200 transition-all active:scale-95">
          <Download size={18} />
          {t('reports.exportPdf')}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-4 min-w-0">
          <div className="bg-primary/10 w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl text-primary font-black text-xl">Q</div>
          <div className="min-w-0 overflow-hidden">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('reports.stats.totalIncome')}</p>
            <p className="text-xl sm:text-2xl font-black text-secondary dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">Q {stats.total.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-4 min-w-0">
          <div className="bg-blue-500/10 p-4 rounded-2xl text-blue-500 flex-shrink-0"><TrendingUp size={24} /></div>
          <div className="min-w-0 overflow-hidden">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('reports.stats.movements')}</p>
            <p className="text-xl sm:text-2xl font-black text-secondary dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">{stats.count} {t('reports.stats.registries')}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-4 min-w-0">
          <div className="bg-slate-500/10 w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl text-slate-500 font-black text-xl">Q</div>
          <div className="min-w-0 overflow-hidden">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('reports.stats.avgPerTrans')}</p>
            <p className="text-xl sm:text-2xl font-black text-secondary dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">Q {stats.avg.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                <Filter size={14} /> {t('reports.filters.title')}
              </label>
              <div className="bg-slate-50 dark:bg-black/20 p-1.5 rounded-2xl flex gap-1">
                {(['day', 'week', 'range'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => applyFilter(m)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                      filterMode === m 
                        ? 'bg-white dark:bg-white/10 text-primary shadow-sm shadow-primary/10' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {m === 'day' ? t('reports.filters.day') : m === 'week' ? t('reports.filters.week') : t('reports.filters.range')}
                  </button>
                ))}
              </div>
            </div>

            <CustomSelect 
              label={t('reports.type.title')}
              value={type}
              onChange={(val) => setType(val)}
              options={[
                { value: 'sales', label: t('reports.type.sales') },
                { value: 'purchases', label: t('reports.type.purchases') }
              ]}
            />

            {filterMode === 'range' ? (
              <>
                <div className="animate-in slide-in-from-right-5 duration-500">
                  <DatePicker
                    label={t('reports.date.from')}
                    value={startDate}
                    onChange={(val) => setStartDate(val)}
                  />
                </div>
                <div className="animate-in slide-in-from-right-10 duration-500 space-y-3">
                  <DatePicker
                    label={t('reports.date.to')}
                    value={endDate}
                    onChange={(val) => setEndDate(val)}
                  />
                </div>
                {/* Search column - we move the search here or keep it at the end */}
              </>
            ) : (
              // Empty space fillers to keep search at the end if not in range mode
              <div className="hidden lg:block lg:col-span-2" />
            )}

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">{t('reports.searchInResults')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder={t('reports.searchPlaceholder')}
                  className="w-full bg-slate-50 dark:bg-black/20 border-none rounded-2xl p-3.5 pl-10 text-sm font-bold text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Range Action Button - Separated for better alignment */}
            {filterMode === 'range' && (
              <div className="col-span-1 md:col-span-2 lg:col-span-5 flex justify-end mt-2 animate-in fade-in duration-700">
                <button 
                  onClick={generateReport}
                  disabled={loading || !startDate || !endDate}
                  className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white px-8 py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 font-black text-sm min-w-[200px]"
                >
                  {loading ? <span className="animate-spin text-xl">⏳</span> : <><Search size={16} /> {t('reports.filters.range')}</>}
                </button>
              </div>
            )}
          </div>

          {/* Results Table Listing */}
          {filteredData.length > 0 ? (
            <div className="border border-slate-100 dark:border-white/5 rounded-[2rem] overflow-hidden animate-in fade-in duration-700">
              <div className="bg-slate-50/50 dark:bg-black/20 px-8 py-5 border-b border-slate-100 dark:border-white/5">
                <h3 className="font-black text-secondary dark:text-white uppercase text-xs tracking-[0.2em]">
                  {t('reports.results.title')} ({filteredData.length})
                </h3>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/30 dark:bg-black/10 text-slate-500 font-black text-[10px] uppercase tracking-widest sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="px-8 py-4">{t('reports.table.products')}</th>
                      <th className="px-8 py-4">{type === 'sales' ? t('reports.table.customer') : t('reports.table.provider')}</th>
                      <th className="px-8 py-4 text-center">{t('reports.date.title') || t('common.date')}</th>
                      <th className="px-8 py-4 text-right">{t('reports.table.total')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredData.map((item) => (
                      <React.Fragment key={item.id}>
                        <tr 
                          onClick={() => toggleRow(item.id)}
                          className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-secondary dark:text-white">
                                {item.items?.length > 2 
                                  ? t('reports.table.multipleProducts') 
                                  : item.items?.map((i: any) => i.product?.nombre).join(', ') || 'N/A'}
                              </span>
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                {item.items?.length > 2 
                                  ? '' 
                                  : item.items?.map((i: any) => i.product?.code).join(', ') || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="font-bold text-slate-600 dark:text-slate-300">
                              {type === 'sales' 
                                ? (item.customer === 'common.finalConsumer' ? t('common.finalConsumer') : item.customer)
                                : item.provider}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="text-slate-400 font-bold text-xs">
                              {format(new Date(item.date), 'dd MMM, yyyy', { locale: language === 'es' ? es : enUS })}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className="font-black text-secondary dark:text-white whitespace-nowrap">Q {Number(item.total).toFixed(2)}</span>
                          </td>
                        </tr>
                        {expandedRows.includes(item.id) && (
                          <tr className="bg-slate-50/20 dark:bg-white/5 animate-in slide-in-from-top-2 duration-300">
                            <td colSpan={4} className="px-8 py-6">
                              <div className="bg-white dark:bg-black/20 rounded-2xl p-6 border border-slate-100 dark:border-white/5">
                                <div className="flex justify-between items-start mb-6">
                                  <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('reports.details.title')}: {type === 'sales' ? item.rpNumber : item.poNumber}</h4>
                                    <p className="text-lg font-black text-secondary dark:text-white">
                                      {type === 'sales' 
                                        ? (item.customer === 'common.finalConsumer' ? t('common.finalConsumer') : item.customer)
                                        : item.provider}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('reports.date.title') || t('common.date')}</p>
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                      {format(new Date(item.date), 'PPPP p', { locale: language === 'es' ? es : enUS })}
                                    </p>
                                  </div>
                                </div>
                                <table className="w-full text-xs">
                                  <thead className="text-slate-500 font-black uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                                    <tr>
                                      <th className="py-2">{t('reports.details.product')}</th>
                                      <th className="py-2 text-center">{t('reports.details.quantity')}</th>
                                      <th className="py-2 text-right">{t('reports.details.priceCost')}</th>
                                      <th className="py-2 text-right">{t('reports.details.subtotal')}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                    {item.items?.map((detail: any, idx: number) => (
                                      <tr key={idx}>
                                        <td className="py-3 font-bold text-secondary dark:text-white">{detail.product?.nombre}</td>
                                        <td className="py-3 text-center font-black">{detail.cantidad}</td>
                                        <td className="py-3 text-right whitespace-nowrap">Q {Number(detail.precio || 0).toFixed(2)}</td>
                                        <td className="py-3 text-right font-black whitespace-nowrap">Q {Number((detail.cantidad * (detail.precio || 0))).toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="border-t-2 border-slate-200 dark:border-white/10">
                                    <tr>
                                      <td colSpan={3} className="py-4 text-right font-black text-slate-500 uppercase tracking-widest text-[10px]">{t('common.total')}</td>
                                      <td className="py-4 text-right font-black text-xl text-primary whitespace-nowrap">Q {Number(item.total).toFixed(2)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem]">
              <Calendar size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">{t('reports.noData.title')}</p>
              <p className="text-slate-300 text-sm">{t('reports.noData.subtitle')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
