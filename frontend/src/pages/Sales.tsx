import { useEffect, useState } from 'react';
import api from '../lib/api';
import { format } from 'date-fns';
import EditSaleModal from '../components/sales/EditSaleModal';
import SaleDetailsModal from '../components/sales/SaleDetailsModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import type { Sale } from '../types';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/ui/Pagination';


export default function SalesPage() {
  const { t } = useLanguage();
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const fetchSales = async () => {
    try {
      const res = await api.get('/sales');
      setSales(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (id: number) => {
    setConfirmDelete({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.id) return;
    try {
      await api.delete(`/sales/${confirmDelete.id}`);
      toast.success(t('users.messages.successDelete') || 'Venta eliminada con éxito');
      fetchSales();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    } finally {
      setConfirmDelete({ open: false, id: null });
    }
  };

  const filteredSales = sales.filter(s => {
    const term = searchTerm.toLowerCase().trim();
    // Resolve the displayed customer name for searching
    const customerDisplay = (s.customer === 'common.finalConsumer' || s.customer === 'Consumidor Final')
      ? 'consumidor final'
      : (s.customer || '').toLowerCase();
    // 'CF' or 'consumidor' or 'final' all match final consumer
    const isFinalConsumer = customerDisplay === 'consumidor final';
    const matchesCF = isFinalConsumer && (
      'consumidor final'.includes(term) ||
      'cf'.includes(term) ||
      term === 'cf' ||
      'consumidor final'.startsWith(term)
    );
    const matchBase = s.rpNumber?.toLowerCase().includes(term) ||
      customerDisplay.includes(term) ||
      matchesCF;
    const matchItems = s.items?.some(item => 
      item.product?.nombre?.toLowerCase().includes(term) ||
      item.product?.code?.toLowerCase().includes(term) ||
      item.product?.id_producto?.toString().includes(term) ||
      item.product?.category?.nombre?.toLowerCase().includes(term)
    );
    return matchBase || matchItems;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedItems,
    handleChangePage,
    handleChangeItemsPerPage
  } = usePagination(filteredSales, 10);

  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('sales.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('sales.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              type="text" 
              placeholder={t('sales.searchPlaceholder')}
              className="w-full bg-[#F8FAFC] dark:bg-black/20 border-none rounded-2xl py-4 pl-12 pr-6 font-bold text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[560px]">
            <thead className="bg-gray-50 dark:bg-black/20 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-white/5">
              <tr>
                <th className="px-6 py-4">{t('sales.table.bill')}</th>
                <th className="px-6 py-4">{t('sales.table.customer')}</th>
                <th className="px-6 py-4 text-center">{t('sales.table.date')}</th>
                <th className="px-6 py-4 text-center">{t('sales.table.items')}</th>
                <th className="px-6 py-4 text-right">{t('common.total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">{t('sales.loading')}</td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">{t('sales.noResults')}</td>
                </tr>
              ) : (
                paginatedItems.map((sale) => (
                  <tr 
                    key={sale.id} 
                    onClick={() => {
                      setSelectedSale(sale);
                      setIsDetailsModalOpen(true);
                    }}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white whitespace-nowrap">{sale.rpNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-700 dark:text-gray-300 font-bold">
                          {sale.customer === 'common.finalConsumer' ? t('common.finalConsumer') : sale.customer}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium italic">
                          {sale.items?.length > 2 
                            ? t('reports.table.multipleProducts') 
                            : sale.items?.map((i: any) => i.product?.nombre).join(', ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500 whitespace-nowrap">{format(new Date(sale.date), 'dd/MM/yyyy HH:mm')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        {sale.items?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold">
                      <div className="flex items-center justify-end gap-3">
                        <span className="mr-2 whitespace-nowrap">Q {Number(sale.total).toFixed(2)}</span>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => {
                              setSelectedSale(sale);
                              setIsDetailsModalOpen(true);
                            }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedSale(sale);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 hover:bg-orange-500/10 text-slate-400 hover:text-orange-500 rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteRequest(sale.id)}
                            className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onChangePage={handleChangePage}
          onChangeItemsPerPage={handleChangeItemsPerPage}
        />
      </div>

      <SaleDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        sale={selectedSale}
      />
      <EditSaleModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchSales}
        sale={selectedSale}
      />
      <ConfirmDialog
        isOpen={confirmDelete.open}
        title={t('sales.table.bill') + ' - Eliminar'}
        message={t('sales.confirmDelete') || '¿Está seguro de eliminar esta venta? El stock se restaurará automáticamente.'}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </div>
  );
}
