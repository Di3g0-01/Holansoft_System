import React, { useState, useRef } from 'react';
import { X, Upload, Check, Download, FilePlus } from 'lucide-react';
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
          code: String(row['Codigo'] || row['code'] || ''),
          name: String(row['Nombre'] || row['name'] || ''),
          brand: String(row['Marca'] || row['brand'] || ''),
          size: String(row['Tamaño'] || row['size'] || ''),
          type: String(row['Tipo'] || row['type'] || ''),
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

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Codigo': 'PROD001',
        'Nombre': 'Producto de Ejemplo',
        'Marca': 'Marca A',
        'Tamaño': 'Grande',
        'Tipo': 'Tipo 1',
        'Precio Unidad': 10.50,
        'Docena': 110.00,
        'Mayoreo': 9.00,
        'Cantidad': 100,
        'Alerta': 10
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');
    XLSX.writeFile(workbook, 'Plantilla_Importacion_Holansoft.xlsx');
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    setLoading(true);
    setProgress(0);

    let successCount = 0;
    
    for (let i = 0; i < parsedData.length; i++) {
      const p = parsedData[i];
      try {
        await api.post('/products', {
          code: p.code,
          nombre: p.name,
          marca: p.brand,
          tamano: p.size,
          tipo: p.type,
          id_categoria: null,
          precio_unidad: p.priceUnit,
          precio_docena: p.priceDozen,
          precio_mayoreo: p.priceWholesale,
          cantidad: p.stock,
          alerta_cantidad: p.alertQuantity,
        });
        successCount++;
      } catch (err: any) {
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
      
      <div className="relative bg-white dark:bg-surface-dark rounded-[1.5rem] sm:rounded-[2rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header - Fixed at top */}
        <div className="bg-[#002B49] p-5 sm:p-6 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">Importar Productos</h3>
            <p className="text-white/70 text-[10px] sm:text-xs font-medium mt-0.5 sm:mt-1">Carga masiva de inventario desde Excel</p>
          </div>
          <button onClick={handleClose} className="hover:bg-white/10 p-2 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto">
          {/* Template Download Section */}
          <div className="bg-white dark:bg-white/5 border border-dashed border-orange-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 text-center">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              ¿No tienes el formato correcto?<br className="sm:hidden" /> Descarga nuestra plantilla base.
            </p>
            <button 
              onClick={handleDownloadTemplate}
              className="w-full sm:w-auto bg-[#3B5998] hover:bg-[#2d4373] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mx-auto transition-all hover:translate-y-[-1px] active:scale-95 shadow-md"
            >
              <Download size={18} />
              Descargar Archivo de Ejemplo
            </button>
          </div>

          {/* File Upload Section */}
          <div className="space-y-3">
            <label className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest block px-1">
              SELECCIONAR ARCHIVO (.XLSX, .CSV)
            </label>
            
            {!file ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-orange-100 dark:border-white/5 bg-[#FFF9F6] dark:bg-black/20 rounded-[1.5rem] sm:rounded-[2rem] p-8 sm:p-12 cursor-pointer hover:border-primary/50 transition-all group text-center"
              >
                <div className="bg-orange-100/50 text-orange-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FilePlus size={24} />
                </div>
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm sm:text-base">
                  Haz clic para buscar o arrastra el archivo
                </p>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium">
                  Compatible con .xlsx, .xls y .csv
                </p>
              </div>
            ) : (
              <div className="bg-[#FFF5F0] dark:bg-black/20 rounded-2xl p-4 sm:p-5 flex items-center gap-4 text-left border border-orange-100 dark:border-white/5 animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-green-100 text-green-600 p-2.5 rounded-xl shrink-0">
                  <Check size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-white truncate text-sm sm:text-base">{file.name}</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-bold">{parsedData.length} productos detectados</p>
                </div>
                <button 
                  onClick={() => {
                    setFile(null);
                    setParsedData([]);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          {loading && (
            <div className="space-y-2 px-1">
              <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-black text-center uppercase tracking-widest">{progress}% completado</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-2">
            <button 
              disabled={loading}
              onClick={handleClose}
              className="order-2 sm:order-1 w-full sm:w-auto text-slate-500 hover:text-slate-700 font-bold text-sm transition-colors py-3 px-6"
            >
              Cancelar
            </button>
            <button 
              disabled={loading || !file || parsedData.length === 0}
              onClick={handleImport}
              className="order-1 sm:order-2 w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-black py-3.5 px-8 rounded-xl sm:rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:translate-y-[-2px] active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              <Upload size={18} />
              {loading ? 'Importando...' : 'Importar Productos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
