import { useEffect, useState } from 'react';
import api from '../lib/api';
import { format } from 'date-fns';
import AddPurchaseModal from '../components/purchases/AddPurchaseModal';
import PurchaseDetailsModal from '../components/purchases/PurchaseDetailsModal';
import { ShoppingBag, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PurchaseItem {
  id: number;
  cantidad: number;
  precio: number;
  sub_total: number;
  product: {
    nombre: string;
    code: string;
  };
}

interface Purchase {
  id: number;
  poNumber: string;
  provider: string;
  date: string;
  total: number;
  items: PurchaseItem[];
}

export default function PurchasesPage() {
  const { t } = useLanguage();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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
  });

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

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
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
          <table className="w-full text-left text-sm">
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
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">{t('purchases.loading')}</td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">{t('purchases.noResults')}</td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr 
                    key={purchase.id} 
                    onClick={() => handleShowDetails(purchase)}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">{purchase.poNumber}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{purchase.provider}</td>
                    <td className="px-6 py-4 text-center text-gray-500">{format(new Date(purchase.date), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {purchase.items?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white font-bold">Q {Number(purchase.total).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                        <Eye size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AddPurchaseModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchPurchases}
      />
      <PurchaseDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        purchase={selectedPurchase}
      />
    </div>
  );
}
