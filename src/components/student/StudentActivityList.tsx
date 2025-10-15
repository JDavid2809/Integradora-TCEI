'use client'

import { useState } from 'react'
import { Search, Filter, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { StudentActivityWithSubmission } from '@/types/student-activity'
import StudentActivityCard from './StudentActivityCard'

interface StudentActivityListProps {
  activities: StudentActivityWithSubmission[]
  courseId: number
  onRefresh: () => void
}

type FilterType = 'all' | 'pending' | 'submitted' | 'graded'

export default function StudentActivityList({ activities, courseId, onRefresh }: StudentActivityListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')

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
    <div className="space-y-6">
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
          <div className="text-sm text-yellow-600 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Pendientes
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
          <div className="text-2xl font-bold text-blue-700">{stats.submitted}</div>
          <div className="text-sm text-blue-600 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Enviadas
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
          <div className="text-2xl font-bold text-green-700">{stats.graded}</div>
          <div className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Calificadas
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar actividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-all"
              />
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <Filter className="w-4 h-4" />
              Todas
            </button>
            
            <button
              onClick={() => setFilterType('pending')}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filterType === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <Clock className="w-4 h-4" />
              Pendientes
            </button>
            
            <button
              onClick={() => setFilterType('submitted')}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filterType === 'submitted'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <Clock className="w-4 h-4" />
              Enviadas
            </button>
            
            <button
              onClick={() => setFilterType('graded')}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filterType === 'graded'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Calificadas
            </button>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <StudentActivityCard
              key={activity.id}
              activity={activity}
              courseId={courseId}
              onSubmitSuccess={onRefresh}
            />
          ))}
        </div>
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
