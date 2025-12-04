"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ExternalLink, BookOpen, FileText, Home, Award } from 'lucide-react'
import { useSearch } from '../contexts/SearchContext'
import { useRouter } from 'next/navigation'

const getIcon = (type: string) => {
  switch (type) {
    case 'course': return <BookOpen className="w-4 h-4" />
    case 'resource': return <FileText className="w-4 h-4" />
    case 'page': return <Home className="w-4 h-4" />
    case 'content': return <Award className="w-4 h-4" />
    default: return <Search className="w-4 h-4" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'course': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
    case 'resource': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
    case 'page': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800'
    case 'content': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800'
    default: return 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-slate-700'
  }
}

interface SearchResultsProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchResults({ isOpen, onClose }: SearchResultsProps) {
  const { searchQuery, searchResults, isSearching, highlightText, clearSearch } = useSearch()
  const router = useRouter()

  const handleResultClick = (url: string) => {
    router.push(url)
    onClose()
  }

  const handleClearSearch = () => {
    clearSearch()
    onClose()
  }

  if (!isOpen || !searchQuery) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[70] flex items-start justify-center pt-20"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 w-full max-w-2xl mx-4 max-h-[70vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-[#e30f28] dark:text-red-500" />
                <h2 className="text-xl font-bold text-[#00246a] dark:text-blue-100">
                  Resultados de búsqueda
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Buscando:</span>
              <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-sm font-medium">
                &ldquo;{searchQuery}&rdquo;
              </span>
              <button
                onClick={handleClearSearch}
                className="text-xs text-[#e30f28] dark:text-red-400 hover:underline ml-2"
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-96">
            {isSearching ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e30f28] dark:border-red-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Buscando...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 px-2">
                  Se encontraron <span className="font-semibold text-[#e30f28] dark:text-red-400">{searchResults.length}</span> resultados
                </p>
                {searchResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleResultClick(result.url)}
                    className="p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer group transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg group-hover:bg-[#e30f28] dark:group-hover:bg-red-600 group-hover:text-white transition-all duration-200">
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-[#00246a] dark:text-blue-100 font-semibold group-hover:text-[#e30f28] dark:group-hover:text-red-400 transition-colors duration-200">
                            {highlightText(result.title, searchQuery)}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(result.type)}`}>
                            {result.section}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {highlightText(result.description, searchQuery)}
                        </p>
                        {result.preview && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {highlightText(result.preview, searchQuery)}
                          </p>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="bg-gray-100 dark:bg-slate-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No encontramos contenido relacionado con &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  onClick={handleClearSearch}
                  className="bg-[#e30f28] hover:bg-[#c20e24] dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
