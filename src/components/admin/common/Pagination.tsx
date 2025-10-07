"use client"
import React from 'react'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onChange }) => {
  // Validar que los valores sean números válidos
  const safePage = typeof page === 'number' && !isNaN(page) ? page : 1
  const safeTotalPages = typeof totalPages === 'number' && !isNaN(totalPages) ? totalPages : 1
  
  if (safeTotalPages <= 1) return null

  return (
    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onChange(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => onChange(Math.min(safeTotalPages, safePage + 1))}
            disabled={safePage === safeTotalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Página <span className="font-medium">{safePage}</span> de{' '}<span className="font-medium">{safeTotalPages}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => onChange(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => onChange(Math.min(safeTotalPages, safePage + 1))}
                disabled={safePage === safeTotalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
