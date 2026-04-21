import { useState, useMemo } from 'react';

export function usePagination<T>(items: T[], defaultPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'Todos'>(defaultPerPage);

  const totalItems = items.length;
  
  const currentItemsPerPage = itemsPerPage === 'Todos' ? totalItems : itemsPerPage;
  
  const totalPages = itemsPerPage === 'Todos' || currentItemsPerPage === 0
    ? 1 
    : Math.ceil(totalItems / currentItemsPerPage);

  // Ensure current page is within bounds when items change or size changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const paginatedItems = useMemo(() => {
    if (itemsPerPage === 'Todos') return items;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const handleChangePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleChangeItemsPerPage = (size: number | 'Todos') => {
    setItemsPerPage(size);
    setCurrentPage(1); // Reset to first page
  };

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedItems,
    handleChangePage,
    handleChangeItemsPerPage
  };
}
