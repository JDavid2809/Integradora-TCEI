import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ 
  page, 
  totalPages, 
  onChange, 
  className = '' 
}) => {
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onChange(newPage);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ajustar startPage si estamos cerca del final
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm rounded-md transition-colors ${
            i === page
              ? 'bg-[#00246a] dark:bg-blue-600 text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 ${className}`}>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Página {page} de {totalPages}
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className={`p-2 rounded-md transition-colors ${
            page <= 1
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {renderPageNumbers()}
        
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className={`p-2 rounded-md transition-colors ${
            page >= totalPages
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;