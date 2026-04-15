import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import AddProductModal from '../components/inventory/AddProductModal';
import EditProductModal from '../components/inventory/EditProductModal';
import ProductDetailsModal from '../components/inventory/ProductDetailsModal';
import { Package, Plus, Search, Edit3, Trash2 } from 'lucide-react';
import type { Product } from '../types';


export default function InventoryPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      // Ensure we always set an array to avoid crash when mapping
      setProducts(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      String(p.nombre || '').toLowerCase().includes(term) ||
      String(p.code || '').toLowerCase().includes(term) ||
      String(p.marca || '').toLowerCase().includes(term) ||
      String(p.tamano || '').toLowerCase().includes(term) ||
      String(p.tipo || '').toLowerCase().includes(term) ||
      String(p.category?.name || p.category?.nombre || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('inventory.title')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('inventory.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-2xl font-black shadow-primary flex items-center gap-2 transition-all hover:translate-y-[-2px] active:scale-95"
        >
          <Plus size={20} />
          {t('inventory.newProduct')}
        </button>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t('common.search')} 
              className="w-full pl-12 pr-4 py-3 border-none bg-slate-50 dark:bg-black/20 rounded-[1.2rem] focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-secondary dark:text-white transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-black/20 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-white/5">
              <tr>
                <th className="px-6 py-4">{t('inventory.table.code')}</th>
                <th className="px-6 py-4">{t('inventory.table.name')}</th>
                <th className="px-6 py-4">{t('inventory.table.category')}</th>
                <th className="px-6 py-4 text-right">{t('common.price')}</th>
                <th className="px-6 py-4 text-center">{t('common.stock')}</th>
                <th className="px-6 py-4 text-center">{t('inventory.table.status')}</th>
                <th className="px-6 py-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">{t('common.loading')}</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">{t('common.noData')}</td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => {
                  if (!product) return null;
                  return (
                  <tr 
                    key={product.id_producto || index} 
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsDetailsModalOpen(true);
                    }}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <span className="bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg font-mono text-[11px] font-black text-slate-500">{product.code || '-'}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl text-primary shrink-0">
                          <Package size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-secondary dark:text-white">{product.nombre || '-'}</span>
                          {(product.marca || product.tamano || product.tipo) && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              {[product.marca, product.tamano, product.tipo].filter(Boolean).join(' • ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-400 font-bold">{product.category?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-secondary dark:text-white">
                      Q {Number(product.precio_unidad || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black ${(product.cantidad || 0) <= (product.alerta_cantidad || 0) ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-700'}`}>
                        {product.cantidad || 0}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {(product.cantidad || 0) <= (product.alerta_cantidad || 0) ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-red-100 text-red-700 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                          {t('common.status.lowStock')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-green-100 text-green-700 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                          {t('common.status.optimal')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                            setIsEditModalOpen(true);
                          }}
                          className="bg-white dark:bg-white/5 p-2 rounded-xl text-slate-400 hover:text-primary hover:shadow-md transition-all border border-slate-100 dark:border-white/5"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white dark:bg-white/5 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:shadow-md transition-all border border-slate-100 dark:border-white/5"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddProductModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchProducts}
      />

      <EditProductModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchProducts}
        product={selectedProduct}
      />

      <ProductDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}
