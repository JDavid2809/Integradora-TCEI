"use client"
import React from 'react'
import { Search, Filter } from 'lucide-react'

export interface FilterOption {
  value: string
  label: string
}

interface FilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: Array<{
    key: string
    value: string
    options: FilterOption[]
    onChange: (value: string) => void
    icon?: React.ReactNode
  }>
  actions?: React.ReactNode
  className?: string
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters = [],
  actions,
  className = ''
}) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
      <div className="flex gap-4 items-center flex-wrap">
        {/* Búsqueda */}
        <div className="flex-1 min-w-64 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
          />
        </div>

        {/* Filtros */}
        {filters.map((filter) => (
          <div key={filter.key} className="flex items-center gap-2">
            {filter.icon || <Filter className="w-5 h-5 text-gray-400" />}
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Acciones adicionales */}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  )
}