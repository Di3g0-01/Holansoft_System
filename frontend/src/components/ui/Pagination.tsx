import { ChevronLeft, ChevronRight } from 'lucide-react';
import CustomSelect from './CustomSelect';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number | 'Todos';
  onChangePage: (page: number) => void;
  onChangeItemsPerPage: (size: number | 'Todos') => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onChangePage,
  onChangeItemsPerPage,
}: PaginationProps) {
  const pageSizes = [10, 25, 50, 100, 'Todos'];

  const startIndex = itemsPerPage === 'Todos' ? 1 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = itemsPerPage === 'Todos' 
    ? totalItems 
    : Math.min(startIndex + itemsPerPage - 1, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-100 dark:border-white/5 gap-4 bg-white dark:bg-black/20 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <span>Mostrar</span>
        <div className="w-24">
          <CustomSelect
            options={pageSizes.map(size => ({ value: String(size), label: String(size) }))}
            value={String(itemsPerPage)}
            onChange={(val) => {
              onChangeItemsPerPage(val === 'Todos' ? 'Todos' : Number(val));
            }}
          />
        </div>
        <span>registros</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <span>
          Mostrando <span className="font-bold text-gray-700 dark:text-gray-300">{startIndex}</span> a <span className="font-bold text-gray-700 dark:text-gray-300">{endIndex}</span> de <span className="font-bold text-gray-700 dark:text-gray-300">{totalItems}</span> resultados
        </span>

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => onChangePage(currentPage - 1)}
            className="p-1 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          
          <span className="px-3 font-medium text-gray-700 dark:text-gray-300">
            {currentPage} de {totalPages}
          </span>
          
          <button
            disabled={currentPage === totalPages}
            onClick={() => onChangePage(currentPage + 1)}
            className="p-1 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
