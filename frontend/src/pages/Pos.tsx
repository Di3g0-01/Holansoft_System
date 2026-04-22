import { useState, useEffect } from 'react';
import { Search, Plus, Minus, X, Trash2, Printer } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../lib/api';
import { toast } from 'sonner';
import InputDialog from '../components/ui/InputDialog';
import CustomSelect from '../components/ui/CustomSelect';
import { generateReceipt } from '../lib/pdfGenerator';
import type { Product } from '../types';

interface CartItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  stock: number;
  precio_unidad: number;
  precio_docena: number;
  precio_mayoreo: number;
  categoryName?: string;
  code?: string;
}

export default function PosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Client state management
  const [customers, setCustomers] = useState<string[]>(['Consumidor Final']);
  const [selectedCustomer, setSelectedCustomer] = useState('Consumidor Final');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      String(p.nombre || '').toLowerCase().includes(term) ||
      String(p.code || '').toLowerCase().includes(term) ||
      String(p.category?.name || '').toLowerCase().includes(term)
    );
  });

  const addToCart = (product: Product) => {
    if (Number(product.cantidad) < 1) {
      toast.error('Producto sin stock disponible');
      return;
    }
    const existing = cart.find(item => item.productId === product.id_producto);
    if (existing) {
      updateQuantity(product.id_producto, existing.quantity + 1);
    } else {
      const newItem: CartItem = {
        productId: product.id_producto,
        name: product.nombre,
        quantity: 1,
        price: Number(product.precio_unidad) || 0,
        stock: Number(product.cantidad) || 0,
        precio_unidad: Number(product.precio_unidad) || 0,
        precio_docena: Number(product.precio_docena) || 0,
        precio_mayoreo: Number(product.precio_mayoreo) || 0,
        categoryName: product.category?.name,
        code: product.code
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (productId: number, newQty: number) => {
    if (newQty < 0) return;
    
    setCart((prev: CartItem[]) => prev.map((item: CartItem) => {
      if (item.productId === productId) {
        if (newQty > item.stock && newQty > 0) {
          toast.error('Stock insuficiente');
          return item;
        }

        // Automatic Pricing Engine
        let price = Number(item.precio_unidad);
        if (newQty >= 50) price = Number(item.precio_mayoreo);
        else if (newQty >= 12) price = Number(item.precio_docena);

        return { ...item, quantity: newQty, price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmit = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const payload = {
        rpNumber: `V-${Date.now().toString().slice(-6)}`,
        customer: selectedCustomer || 'Consumidor Final',
        date: new Date().toISOString(),
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.price),
          name: item.name // send name to pdf generator easily if needed
        }))
      };

      await api.post('/sales', payload);
      toast.success('Venta Procesada');
      
      // Attempt PDF Generation
      try {
        generateReceipt(payload);
      } catch (pdfErr) {
        console.error('Error generating PDF', pdfErr);
        toast.error('Venta guardada pero hubo error generando PDF');
      }

      setCart([]);
      setSelectedCustomer('Consumidor Final');
      fetchProducts(); // Refresh stock
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error procesando venta');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = (name: string) => {
    setCustomers(prev => [...prev, name]);
    setSelectedCustomer(name);
    setIsClientModalOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full lg:h-[calc(100vh-theme(spacing.24))] overflow-hidden -m-2 p-2">
      
      {/* Left Area: Product Search and Grid */}
      <div className="flex-1 flex flex-col bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-gray-100 dark:border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Punto de Venta</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              autoFocus
              type="text" 
              placeholder="Código o nombre..." 
              className="w-full pl-12 pr-4 py-3 sm:py-4 border border-gray-200 dark:border-white/10 focus:border-primary/50 bg-white dark:bg-black/20 rounded-2xl outline-none text-base sm:text-lg font-bold text-secondary dark:text-white shadow-sm transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>


        {/* Products List Scrollable Table */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[400px] h-full flex flex-col">
            {/* Table Header */}
            <div className="flex px-4 py-2 bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
              <div className="w-16 shrink-0">{t('inventory.table.code')}</div>
              <div className="flex-1">{t('inventory.table.name')}</div>
              <div className="w-20 text-right shrink-0">{t('common.price')}</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-white/5">
              {filteredProducts.map(product => (
                <div 
                  key={product.id_producto}
                  onClick={() => addToCart(product)}
                  className="flex items-center px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <div className="w-16 shrink-0 font-mono text-[9px] font-black text-slate-400 truncate pr-2">
                    {product.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-secondary dark:text-white truncate leading-tight uppercase">
                      {product.nombre}
                    </p>
                  </div>
                  <div className="w-20 shrink-0 text-right">
                    <p className="text-[10px] font-black text-primary">
                      Q {Number(product.precio_unidad).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="p-8 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest">
                  {t('sales.noResults')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Area: Checkout / Cart */}
      <div className="w-full lg:w-[400px] flex flex-col bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden shrink-0">
        
        {/* Customer Selector */}
        <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/10">
          <label className="text-[10px] font-black text-secondary/50 dark:text-gray-400 uppercase tracking-widest block mb-2">CLIENTE</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <CustomSelect
                options={customers.map(c => ({ value: c, label: c }))}
                value={selectedCustomer}
                onChange={value => setSelectedCustomer(value)}
              />
            </div>
            <button 
              onClick={() => setIsClientModalOpen(true)}
              className="bg-primary hover:bg-primary-dark text-white p-3 rounded-2xl shadow-sm transition-transform active:scale-95"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Cart Items Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-gray-400">
              <Printer size={64} className="mb-4" />
              <p className="font-bold uppercase tracking-widest text-sm">CARRITO VACÍO</p>
            </div>
          )}
          
          {cart.map(item => (
            <div key={item.productId} className="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl p-4 shadow-sm relative group overflow-hidden">
              <button 
                onClick={() => removeFromCart(item.productId)}
                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
              
              <div className="pr-6">
                <h4 className="font-black text-secondary dark:text-white mb-3 text-sm leading-tight">{item.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-black mr-2">
                      {item.quantity < 12 ? 'U' : item.quantity < 50 ? 'D' : 'M'}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">Q{Number(item.price).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2 py-1 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-l-lg transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <input 
                      type="number"
                      className="w-10 bg-transparent text-center text-sm font-bold border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={item.quantity}
                      onChange={e => updateQuantity(item.productId, Number(e.target.value))}
                    />
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2 py-1 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-r-lg transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <span className="font-black text-secondary dark:text-white text-base">
                    Q{(item.quantity * Number(item.price)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Checkout */}
        <div className="p-6 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5">
          <div className="flex justify-between items-end mb-6">
            <span className="text-secondary dark:text-white font-black text-xl">Total</span>
            <span className="text-primary font-black text-3xl">Q{calculateTotal().toFixed(2)}</span>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setCart([])}
              disabled={cart.length === 0}
              className="bg-red-100 text-red-600 hover:bg-red-200 p-4 rounded-2xl transition-colors disabled:opacity-50 active:scale-95"
            >
              <Trash2 size={24} />
            </button>
            <button 
              onClick={handleSubmit}
              disabled={cart.length === 0 || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 active:scale-95"
            >
              <Printer size={20} />
              Finalizar Venta
            </button>
          </div>
        </div>

      </div>

      <InputDialog
        isOpen={isClientModalOpen}
        title="Nuevo Cliente"
        placeholder="Nombre del cliente..."
        onConfirm={handleAddCustomer}
        onCancel={() => setIsClientModalOpen(false)}
      />

    </div>
  );
}
