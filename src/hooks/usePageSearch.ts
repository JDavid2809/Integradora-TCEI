"use client"

import { useEffect } from 'react'
import { useSearch } from '../contexts/SearchContext'

export const usePageSearch = (pageContent: string[], pageName: string) => {
  const { searchQuery, highlightText } = useSearch()

  useEffect(() => {
    if (searchQuery) {
      // Aquí podrías agregar lógica específica para cada página
      console.log(`Buscando "${searchQuery}" en página: ${pageName}`)
    }
  }, [searchQuery, pageName])

  // Función para determinar si un elemento contiene el término de búsqueda
  const matchesSearch = (text: string): boolean => {
    if (!searchQuery) return true
    return text.toLowerCase().includes(searchQuery.toLowerCase())
  }

  // Función para filtrar contenido basado en la búsqueda
  const filterContent = <T extends Record<string, unknown>>(content: T[], searchFields: string[] = ['title', 'description']) => {
    if (!searchQuery) return content
    
    return content.filter(item => {
      return searchFields.some(field => {
        const value = item[field]
        return value && typeof value === 'string' && matchesSearch(value)
      })
    })
  }

  return {
    searchQuery,
    highlightText,
    matchesSearch,
    filterContent,
    hasActiveSearch: !!searchQuery
  }
}
