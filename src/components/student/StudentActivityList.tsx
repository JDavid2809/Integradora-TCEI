'use client'

import { useState } from 'react'
import { Search, Filter, CheckCircle2, Clock, XCircle, Grid3x3, List } from 'lucide-react'
import { StudentActivityWithSubmission } from '@/types/student-activity'
import StudentActivityCard from './StudentActivityCard'

interface StudentActivityListProps {
  activities: StudentActivityWithSubmission[]
  courseId: number
  onRefresh: () => void
}

type FilterType = 'all' | 'pending' | 'submitted' | 'graded'
type ViewMode = 'grid' | 'list'

export default function StudentActivityList({ activities, courseId, onRefresh }: StudentActivityListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Filtrar actividades
  const filteredActivities = activities.filter(activity => {
    // Filtro de búsqueda
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro de tipo
    let matchesFilter = true
    if (filterType === 'pending') {
      matchesFilter = !activity.submission
    } else if (filterType === 'submitted') {
      matchesFilter = !!activity.submission && activity.submission.status !== 'GRADED'
    } else if (filterType === 'graded') {
      matchesFilter = !!activity.submission && activity.submission.status === 'GRADED'
    }

    return matchesSearch && matchesFilter
  })

  // Estadísticas
  const stats = {
    total: activities.length,
    pending: activities.filter(a => !a.submission).length,
    submitted: activities.filter(a => a.submission && a.submission.status !== 'GRADED').length,
    graded: activities.filter(a => a.submission && a.submission.status === 'GRADED').length
  }

  return (
    <div className="space-y-4">
      
      {/* Stats Cards - Diseño compacto y llamativo */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600 mt-1">Total</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-yellow-700">{stats.pending}</div>
          <div className="text-xs text-yellow-700 mt-1 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            Pendientes
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-blue-700">{stats.submitted}</div>
          <div className="text-xs text-blue-700 mt-1 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            Enviadas
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-green-700">{stats.graded}</div>
          <div className="text-xs text-green-700 mt-1 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Calificadas
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros - Diseño compacto */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar actividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Filter buttons compactos */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            
            <button
              onClick={() => setFilterType('pending')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendientes
            </button>
            
            <button
              onClick={() => setFilterType('submitted')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'submitted'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Enviadas
            </button>
            
            <button
              onClick={() => setFilterType('graded')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'graded'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Calificadas
            </button>
          </div>

          {/* Toggle de vista */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista de tarjetas"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista de lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      {filteredActivities.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredActivities.map((activity) => (
              <StudentActivityCard
                key={activity.id}
                activity={activity}
                courseId={courseId}
                onSubmitSuccess={onRefresh}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <StudentActivityCard
                key={activity.id}
                activity={activity}
                courseId={courseId}
                onSubmitSuccess={onRefresh}
                viewMode="list"
              />
            ))}
          </div>
        )
      ) : (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? 'No se encontraron actividades' : 'No hay actividades'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'El profesor aún no ha publicado actividades para este curso'
            }
          </p>
        </div>
      )}
    </div>
  )
}
