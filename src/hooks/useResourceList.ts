import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/apiClient'
import { useDebounce } from './useDebounce'

interface UseResourceListOptions {
  endpoint: string
  limit?: number
  debounceDelay?: number
}

interface ResourceListState<T> {
  data: T[]
  total: number
  totalPages: number
  loading: boolean
  error: string | null
  page: number
  searchTerm: string
  filters: Record<string, string>
}

interface ResourceListActions {
  setPage: (page: number) => void
  setSearchTerm: (term: string) => void
  setFilter: (key: string, value: string) => void
  refetch: () => void
  resetFilters: () => void
}

export function useResourceList<T>(
  options: UseResourceListOptions
): [ResourceListState<T>, ResourceListActions] {
  const { endpoint, limit = 10, debounceDelay = 400 } = options
  const abortRef = useRef<AbortController | null>(null)

  const [state, setState] = useState<ResourceListState<T>>({
    data: [],
    total: 0,
    totalPages: 0,
    loading: true,
    error: null,
    page: 1,
    searchTerm: '',
    filters: {}
  })

  const debouncedSearch = useDebounce(state.searchTerm, debounceDelay)

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // Cancelar request previo
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const params = new URLSearchParams({
        page: state.page.toString(),
        limit: limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...Object.fromEntries(
          Object.entries(state.filters).filter(([, value]) => value && value !== 'ALL')
        )
      })

      const response = await api<{ 
        data?: T[]
        items?: T[]
        users?: T[]
        courses?: T[]
        exams?: T[]
        payments?: T[]
        total: number 
      }>(`${endpoint}?${params}`, { signal: controller.signal })

      // Detectar automáticamente la clave de datos en la respuesta
      const data = response.data || response.items || response.users || 
                   response.courses || response.exams || response.payments || []

      setState(prev => ({
        ...prev,
        data: data as T[],
        total: response.total,
        totalPages: Math.ceil(response.total / limit),
        loading: false
      }))
    } catch (error: any) {
      if (error?.name === 'AbortError') return
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Error al cargar datos'
      }))
    }
  }

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page, debouncedSearch, state.filters])

  const actions: ResourceListActions = {
    setPage: (page: number) => setState(prev => ({ ...prev, page })),
    setSearchTerm: (searchTerm: string) => setState(prev => ({ 
      ...prev, 
      searchTerm, 
      page: 1 // Reset página al buscar
    })),
    setFilter: (key: string, value: string) => setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      page: 1 // Reset página al filtrar
    })),
    refetch: fetchData,
    resetFilters: () => setState(prev => ({
      ...prev,
      filters: {},
      searchTerm: '',
      page: 1
    }))
  }

  return [state, actions]
}