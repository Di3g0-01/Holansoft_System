import { X, ShoppingBag, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

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

interface PurchaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
}

export default function PurchaseDetailsModal({ isOpen, onClose, purchase }: PurchaseDetailsModalProps) {
  if (!isOpen || !purchase) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-surface-dark w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-2xl">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black">Detalle de Compra</h3>
              <p className="text-white/60 font-bold text-sm uppercase tracking-widest">{purchase.poNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Proveedor</p>
              <p className="text-xl font-black text-secondary dark:text-white">{purchase.provider}</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Fecha de Registro</p>
              <p className="text-xl font-black text-secondary dark:text-white">
                {format(new Date(purchase.date), 'PPPP')}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Productos Adquiridos</h4>
            <div className="bg-slate-50 dark:bg-white/5 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-white/5">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-black/20 text-slate-500 font-black uppercase tracking-widest text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4 text-center">Cantidad</th>
                    <th className="px-6 py-4 text-right">Costo U.</th>
                    <th className="px-6 py-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {purchase.items.map((item) => (
                    <tr key={item.id} className="text-secondary dark:text-white">
                      <td className="px-6 py-4">
                        <div className="font-bold">{item.product.nombre}</div>
                        <div className="text-[10px] font-black text-slate-400">{item.product.code}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-black">{item.cantidad}</td>
                      <td className="px-6 py-4 text-right font-bold">Q {Number(item.precio).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-black">Q {Number(item.sub_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center bg-secondary p-8 rounded-[2rem] text-white shadow-xl">
              <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-lg"><DollarSign size={20} /></div>
                  <span className="text-sm font-bold uppercase tracking-widest opacity-60">Total de esta compra</span>
              </div>
              <span className="text-4xl font-black">Q {Number(purchase.total).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
