"use client"

import React, { createContext, useContext, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface SearchResult {
  id: string
  title: string
  description: string
  url: string
  type: 'course' | 'resource' | 'page' | 'content'
  section?: string
  preview?: string
}

interface SearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: SearchResult[]
  setSearchResults: (results: SearchResult[]) => void
  isSearching: boolean
  setIsSearching: (searching: boolean) => void
  performSearch: (query: string) => void
  clearSearch: () => void
  currentPage: string
  highlightText: (text: string, searchTerm: string) => React.ReactNode
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export const useSearch = () => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const currentPage = pathname || '/'

  // Función para resaltar texto de búsqueda
  const highlightText = (text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} className="bg-yellow-200 text-yellow-800 font-medium px-1 rounded">
          {part}
        </span> : part
    )
  }

  // Base de datos de contenido searcheable
  const searchableContent = [
    // Páginas principales
    {
      id: 'page-home',
      title: 'Inicio',
      description: 'Domina el inglés con inteligencia artificial. Aprende 10x más rápido.',
      url: '/',
      type: 'page' as const,
      section: 'Navegación',
      preview: 'Plataforma de aprendizaje de inglés con IA cuántica. Lecciones adaptativas y mentores virtuales.'
    },
    {
      id: 'content-home-hero',
      title: 'Domina Inglés con IA',
      description: 'La primera plataforma que usa inteligencia artificial cuántica para acelerar tu aprendizaje',
      url: '/',
      type: 'content' as const,
      section: 'Página Principal',
      preview: 'Aprendizaje adaptativo, lecciones personalizadas, mentores IA, progreso en tiempo real'
    },
    {
      id: 'page-courses',
      title: 'Cursos',
      description: 'Catálogo completo de cursos de inglés disponibles',
      url: '/Courses',
      type: 'page' as const,
      section: 'Navegación',
      preview: 'Todos nuestros cursos desde principiante hasta avanzado'
    },
    {
      id: 'page-resources',
      title: 'Recursos',
      description: 'Materiales de apoyo y recursos educativos',
      url: '/recursos',
      type: 'resource' as const,
      section: 'Navegación',
      preview: 'Libros, videos, ejercicios y más recursos para aprender'
    },
    {
      id: 'page-certifications',
      title: 'Certificaciones',
      description: 'Obtén certificados reconocidos internacionalmente',
      url: '/certificaciones',
      type: 'page' as const,
      section: 'Navegación',
      preview: 'TOEFL, IELTS, Cambridge y más certificaciones disponibles'
    },
    // Cursos específicos
    {
      id: 'course-1',
      title: 'English Conversation Mastery',
      description: 'Domina las conversaciones en inglés con confianza y fluidez natural',
      url: '/Courses',
      type: 'course' as const,
      section: 'Cursos',
      preview: 'Aprende speaking, listening y pronunciation con Sarah Johnson'
    },
    {
      id: 'course-2',
      title: 'Business English Professional',
      description: 'Inglés empresarial para profesionales que buscan destacar',
      url: '/Courses',
      type: 'course' as const,
      section: 'Cursos',
      preview: 'Business writing, presentations y meetings con Michael Brown'
    },
    {
      id: 'course-3',
      title: 'English Grammar Complete',
      description: 'Domina la gramática inglesa de forma práctica',
      url: '/Courses',
      type: 'course' as const,
      section: 'Cursos',
      preview: 'Gramática, ejercicios y práctica con Lisa Anderson'
    },
    // Contenido educativo
    {
      id: 'content-grammar',
      title: 'Gramática Inglesa',
      description: 'Aprende las reglas fundamentales del inglés',
      url: '/Courses',
      type: 'content' as const,
      section: 'Contenido Educativo',
      preview: 'Tiempos verbales, estructuras y reglas gramaticales'
    },
    {
      id: 'content-vocabulary',
      title: 'Vocabulario',
      description: 'Amplía tu vocabulario en inglés con palabras útiles',
      url: '/Courses',
      type: 'content' as const,
      section: 'Contenido Educativo',
      preview: 'Palabras comunes, expresiones y frases idiomáticas'
    },
    {
      id: 'content-pronunciation',
      title: 'Pronunciación',
      description: 'Mejora tu pronunciación y acento en inglés',
      url: '/Courses',
      type: 'content' as const,
      section: 'Contenido Educativo',
      preview: 'Fonética, acentos y técnicas de pronunciación'
    },
    {
      id: 'content-conversation',
      title: 'Conversación',
      description: 'Practica conversaciones reales en inglés',
      url: '/Courses',
      type: 'content' as const,
      section: 'Contenido Educativo',
      preview: 'Diálogos naturales, expresiones cotidianas, fluidez'
    },
    {
      id: 'content-listening',
      title: 'Comprensión Auditiva',
      description: 'Mejora tu habilidad para entender el inglés hablado',
      url: '/Courses',
      type: 'content' as const,
      section: 'Contenido Educativo',
      preview: 'Audios nativos, diferentes acentos, comprensión contextual'
    }
  ]

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      clearSearch()
      return
    }

    setIsSearching(true)
    setSearchQuery(query)

    try {
      // Buscar en el contenido disponible
      const results = searchableContent.filter(item => {
        const searchLower = query.toLowerCase()
        return (
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.section?.toLowerCase().includes(searchLower) ||
          item.preview?.toLowerCase().includes(searchLower)
        )
      })

      setSearchResults(results)

      // Si estamos en la página de cursos, mantener el comportamiento actual
      if (currentPage.includes('/Courses')) {
        const searchParams = new URLSearchParams()
        searchParams.set('search', query)
        router.push(`/Courses?${searchParams.toString()}`)
      }
      
    } catch (error) {
      console.error('Error en la búsqueda:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
  }

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
    performSearch,
    clearSearch,
    currentPage,
    highlightText
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}
