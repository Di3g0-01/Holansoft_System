import { useEffect, useState } from 'react';
import api from '../lib/api';
import { format } from 'date-fns';
import AddPurchaseModal from '../components/purchases/AddPurchaseModal';
import EditPurchaseModal from '../components/purchases/EditPurchaseModal';
import PurchaseDetailsModal from '../components/purchases/PurchaseDetailsModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { ShoppingBag, Eye, Edit2, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import type { Purchase } from '../types';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/ui/Pagination';


export default function PurchasesPage() {
  const { t } = useLanguage();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const fetchPurchases = async () => {
    try {
      const res = await api.get('/purchases');
      setPurchases(res.data);
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
      await api.delete(`/purchases/${confirmDelete.id}`);
      toast.success(t('users.messages.successDelete') || 'Eliminado con éxito');
      fetchPurchases();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    } finally {
      setConfirmDelete({ open: false, id: null });
    }
  };

  const filteredPurchases = purchases.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchBase = p.poNumber?.toLowerCase().includes(term) || p.provider?.toLowerCase().includes(term);
    const matchItems = p.items?.some(item => 
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
  } = usePagination(filteredPurchases, 10);

  const handleShowDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDetailsModalOpen(true);
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('purchases.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('purchases.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 transition-all hover:translate-y-[-2px] active:scale-95"
        >
          <ShoppingBag size={20} />
          {t('purchases.newPurchase')}
        </button>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              type="text" 
              placeholder={t('purchases.searchPlaceholder')}
              className="w-full bg-[#F8FAFC] dark:bg-black/20 border-none rounded-2xl py-4 pl-12 pr-6 font-bold text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-black/20 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-white/5">
              <tr>
                <th className="px-6 py-4">{t('purchases.table.bill')}</th>
                <th className="px-6 py-4">{t('purchases.table.provider')}</th>
                <th className="px-6 py-4 text-center">{t('purchases.table.date')}</th>
                <th className="px-6 py-4 text-center">{t('purchases.table.items')}</th>
                <th className="px-6 py-4 text-right">{t('common.total')}</th>
                <th className="px-6 py-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">{t('purchases.loading')}</td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">{t('purchases.noResults')}</td>
                </tr>
              ) : (
                paginatedItems.map((purchase) => (
                  <tr 
                    key={purchase.id} 
                    onClick={() => handleShowDetails(purchase)}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">{purchase.poNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-700 dark:text-gray-300 font-bold">{purchase.provider}</span>
                        <span className="text-[10px] text-gray-400 font-medium italic">
                          {purchase.items?.length > 2 
                            ? t('reports.table.multipleProducts') 
                            : purchase.items?.map((i: any) => i.product?.nombre).join(', ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">{format(new Date(purchase.date), 'dd/MM/yyyy HH:mm')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {purchase.items?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold whitespace-nowrap">
                      Q {Number(purchase.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleShowDetails(purchase)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedPurchase(purchase);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 hover:bg-orange-500/10 text-slate-400 hover:text-orange-500 rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteRequest(purchase.id)}
                            className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
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
      <AddPurchaseModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchPurchases}
      />
      <EditPurchaseModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchPurchases}
        purchase={selectedPurchase}
      />
      <PurchaseDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        purchase={selectedPurchase}
      />
      <ConfirmDialog
        isOpen={confirmDelete.open}
        title={t('purchases.table.bill') + ' - Eliminar'}
        message={t('purchases.confirmDelete') || '¿Está seguro de eliminar esta compra? El stock se ajustará automáticamente.'}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </div>
  );
}
