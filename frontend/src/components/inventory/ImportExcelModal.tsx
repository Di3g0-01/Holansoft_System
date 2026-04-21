import React, { useState, useRef } from 'react';
import { X, Upload, Check, AlertCircle, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import * as XLSX from 'xlsx';
import api from '../../lib/api';
import { toast } from 'sonner';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedProduct {
  code: string;
  name: string;
  brand: string;
  size: string;
  type: string;
  categoryId?: number | null;
  priceUnit: number;
  priceDozen: number;
  priceWholesale: number;
  stock: number;
  alertQuantity: number;
}

export default function ImportExcelModal({ isOpen, onClose, onSuccess }: ImportExcelModalProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      parseExcel(selected);
    }
  };

  const parseExcel = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        const mapped: ParsedProduct[] = jsonData.map(row => ({
          code: row['Codigo'] || row['code'] || '',
          name: row['Nombre'] || row['name'] || '',
          brand: row['Marca'] || row['brand'] || '',
          size: row['Tamaño'] || row['size'] || '',
          type: row['Tipo'] || row['type'] || '',
          priceUnit: Number(row['Precio Unidad'] || row['priceUnit'] || 0),
          priceDozen: Number(row['Docena'] || row['priceDozen'] || 0),
          priceWholesale: Number(row['Mayoreo'] || row['priceWholesale'] || 0),
          stock: Number(row['Cantidad'] || row['stock'] || 0),
          alertQuantity: Number(row['Alerta'] || row['alertQuantity'] || 5),
        })).filter(p => p.name && p.code); // Basic validation

        setParsedData(mapped);
      } catch (err) {
        console.error(err);
        toast.error('Error al leer el archivo Excel.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    setLoading(true);
    setProgress(0);

    let successCount = 0;
    
    // We will post them one by one. Existing codes will fail and are ignored.
    for (let i = 0; i < parsedData.length; i++) {
      const p = parsedData[i];
      try {
        await api.post('/products', {
          code: p.code,
          nombre: p.name,
          marca: p.brand,
          tamano: p.size,
          tipo: p.type,
          id_categoria: null, // Basic import implies no specific category linking initially, or default.
          precio_unidad: p.priceUnit,
          precio_docena: p.priceDozen,
          precio_mayoreo: p.priceWholesale,
          cantidad: p.stock,
          alerta_cantidad: p.alertQuantity,
        });
        successCount++;
      } catch (err: any) {
        // Ignore duplicate code error (HTTP 409 usually or uniqueness error)
        console.warn('Skipped product', p.code, err?.response?.data || err.message);
      }
      setProgress(Math.round(((i + 1) / parsedData.length) * 100));
    }

    setLoading(false);
    toast.success(`Se importaron ${successCount} productos correctamente.`);
    onSuccess();
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-secondary/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      <div className="relative bg-white dark:bg-surface-dark rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="bg-[#003366] p-6 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight">{t('common.import') || 'Importar Productos'}</h3>
            <p className="text-white/60 text-xs font-bold">Desde archivo Excel (.xlsx)</p>
          </div>
          <button onClick={handleClose} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 text-center">
          {!file && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-[2rem] p-10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 hover:border-primary transition-all group"
            >
              <div className="bg-primary/10 text-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <p className="font-bold text-gray-600 dark:text-gray-300">
                Haz clic para subir un archivo
              </p>
              <p className="text-xs text-gray-400 mt-2">
                (.xlsx, .xls)
              </p>
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="hidden"
          />

          {file && (
            <div className="space-y-4">
              <div className="bg-[#FFF5F0] dark:bg-black/20 rounded-2xl p-4 flex items-center gap-3 text-left">
                <Check className="text-green-500" size={24} />
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-secondary dark:text-white truncate">{file.name}</p>
                  <p className="text-xs text-secondary/60">{parsedData.length} {t('common.validRows') || 'productos válidos encontrados'}</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-2xl text-xs flex gap-2 text-left">
                <AlertCircle size={16} className="shrink-0" />
                <p>Si el código de un producto en el excel ya existe en el sistema, será ignorado automáticamente.</p>
              </div>

              {loading && (
                <div className="space-y-2">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-bold">{progress}% completado</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  disabled={loading}
                  onClick={handleClose}
                  className="flex-1 text-secondary font-black text-sm hover:text-primary transition-colors py-3"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  disabled={loading || parsedData.length === 0}
                  onClick={handleImport}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-black py-3 rounded-2xl shadow-primary flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? t('common.loading') : 'Inicar Importación'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
