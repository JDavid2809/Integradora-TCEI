'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  BookOpen, 
  Calendar, 
  Users,
  Globe,
  MapPin,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText
} from 'lucide-react'
import { TeacherCourseListItem } from '@/types/course-creation'
import { getTeacherCourses, toggleCourseStatus, deleteCourse } from '@/actions/teacher/courseActions'

interface CourseListProps {
  teacherId: number
  onCreateNew: () => void
  onEditCourse: (courseId: number) => void
  onViewDetails: (courseId: number) => void
}

export default function CourseList({ teacherId, onCreateNew, onEditCourse, onViewDetails }: CourseListProps) {
  const [courses, setCourses] = useState<TeacherCourseListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [actioningCourse, setActioningCourse] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<TeacherCourseListItem | null>(null)

  // Cargar cursos
  const loadCourses = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await getTeacherCourses(teacherId)
      if (result.success) {
        setCourses(result.courses)
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setIsLoading(false)
    }
  }, [teacherId])

  // Refrescar cursos
  const refreshCourses = useCallback(async () => {
    setIsRefreshing(true)
    await loadCourses()
    setIsRefreshing(false)
  }, [loadCourses])

  // Toggle status del curso
  const handleToggleStatus = useCallback(async (courseId: number) => {
    try {
      setActioningCourse(courseId)
      const result = await toggleCourseStatus(courseId, teacherId)
      if (result.success) {
        // Actualizar el curso en la lista local
        setCourses(prev => prev.map(course => 
          course.id_curso === courseId 
            ? { ...course, b_activo: !course.b_activo }
            : course
        ))
      }
    } catch (error) {
      console.error('Error toggling course status:', error)
    } finally {
      setActioningCourse(null)
    }
  }, [teacherId])

  // Confirmar eliminación
  const handleDeleteRequest = (course: TeacherCourseListItem) => {
    setCourseToDelete(course)
    setShowDeleteModal(true)
  }

  // Eliminar curso
  const handleDeleteCourse = useCallback(async () => {
    if (!courseToDelete) return

    try {
      setActioningCourse(courseToDelete.id_curso)
      const result = await deleteCourse(courseToDelete.id_curso, teacherId)
      
      if (result.success) {
        // Remover el curso de la lista local
        setCourses(prev => prev.filter(course => course.id_curso !== courseToDelete.id_curso))
        setShowDeleteModal(false)
        setCourseToDelete(null)
      } else {
        alert(result.message) // TODO: Mejorar con toast notification
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Error inesperado al eliminar el curso')
    } finally {
      setActioningCourse(null)
    }
  }, [courseToDelete, teacherId])

  // Efecto para cargar cursos al montar
  useEffect(() => {
    loadCourses()
  }, [teacherId, loadCourses])

  // Filtrar cursos
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && course.b_activo) ||
                         (statusFilter === 'inactive' && !course.b_activo)

    return matchesSearch && matchesStatus
  })

  // Función para formatear fechas
  const formatDate = (date: Date | null) => {
    if (!date) return 'No definida'
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Función para calcular el status del curso
  const getCourseStatus = (course: TeacherCourseListItem) => {
    if (!course.b_activo) return 'inactive'
    
    const now = new Date()
    const startDate = course.inicio ? new Date(course.inicio) : null
    const endDate = course.fin ? new Date(course.fin) : null
    
    if (!startDate || !endDate) return 'draft'
    if (now < startDate) return 'upcoming'
    if (now >= startDate && now <= endDate) return 'active'
    return 'finished'
  }

  // Componente de status badge
  const StatusBadge = ({ course }: { course: TeacherCourseListItem }) => {
    const status = getCourseStatus(course)
    
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Activo' },
      upcoming: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Próximo' },
      finished: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Finalizado' },
      inactive: { color: 'bg-red-100 text-red-800', icon: EyeOff, label: 'Inactivo' },
      draft: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'Borrador' }
    }
    
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00246a]" />
          <p className="text-gray-600">Cargando cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#00246a]">Mis Cursos</h1>
          <p className="text-sm sm:text-base text-gray-600">Gestiona tus cursos creados</p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={refreshCourses}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 sm:flex-none justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-[#00246a] text-white rounded-lg hover:bg-blue-700 flex-1 sm:flex-none justify-center"
          >
            <Plus className="w-4 h-4" />
            Nuevo Curso
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Solo activos</option>
            <option value="inactive">Solo inactivos</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{courses.length}</p>
              <p className="text-xs sm:text-sm text-blue-700">Total de Cursos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {courses.filter(c => c.b_activo).length}
              </p>
              <p className="text-xs sm:text-sm text-green-700">Cursos Activos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 flex-shrink-0" />
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-600">
                {courses.reduce((sum, course) => sum + course.studentCount, 0)}
              </p>
              <p className="text-xs sm:text-sm text-gray-700">Total Estudiantes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course List */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {courses.length === 0 ? 'No tienes cursos creados' : 'No se encontraron cursos'}
          </h3>
          <p className="text-gray-500 mb-6">
            {courses.length === 0 
              ? 'Crea tu primer curso para comenzar a enseñar'
              : 'Intenta ajustar los filtros de búsqueda'
            }
          </p>
          {courses.length === 0 && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00246a] text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Crear Primer Curso
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id_curso} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {/* Course Header */}
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.nombre}
                    </h3>
                    <StatusBadge course={course} />
                  </div>
                  
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => onViewDetails(course.id_curso)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onEditCourse(course.id_curso)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors hidden sm:block"
                      title="Editar curso"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteRequest(course)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors hidden sm:block"
                      title="Eliminar curso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {course.descripcion && (
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
                    {course.descripcion}
                  </p>
                )}

                {/* Course Info */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    {course.modalidad === 'ONLINE' ? (
                      <Globe className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{course.modalidad}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{course.studentCount} estudiantes</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 col-span-2 sm:col-span-1">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{formatDate(course.inicio)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 col-span-2 sm:col-span-1">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{formatDate(course.fin)}</span>
                  </div>
                </div>
              </div>

              {/* Course Footer */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-xs text-gray-500 truncate w-full sm:w-auto">
                    Creado el {formatDate(course.created_at)}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleToggleStatus(course.id_curso)}
                      disabled={actioningCourse === course.id_curso}
                      className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded text-xs font-medium flex-1 sm:flex-none justify-center ${
                        course.b_activo
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      } disabled:opacity-50`}
                    >
                      {actioningCourse === course.id_curso ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : course.b_activo ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                      <span className="hidden sm:inline">{course.b_activo ? 'Desactivar' : 'Activar'}</span>
                    </button>
                    
                    <button
                      onClick={() => onViewDetails(course.id_curso)}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 flex-1 sm:flex-none justify-center"
                    >
                      <FileText className="w-3 h-3" />
                      <span className="hidden sm:inline">Detalles</span>
                    </button>
                    
                    <button
                      onClick={() => onEditCourse(course.id_curso)}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 flex-1 sm:flex-none justify-center"
                    >
                      <Edit className="w-3 h-3" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Eliminar Curso</h3>
                <p className="text-xs sm:text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-sm sm:text-base text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar el curso <strong>&ldquo;{courseToDelete.nombre}&rdquo;</strong>?
            </p>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setCourseToDelete(null)
                }}
                className="px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={actioningCourse === courseToDelete.id_curso}
              >
                Cancelar
              </button>
              
              <button
                onClick={handleDeleteCourse}
                disabled={actioningCourse === courseToDelete.id_curso}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actioningCourse === courseToDelete.id_curso ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}