'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  BookOpen, 
  
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Save,
  Clock,
  Users,
  MapPin,
  Globe,
  AlertTriangle,
  X
} from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { Pagination } from './admin/common/Pagination'
import { FeedbackAlert } from './admin/common/FeedbackAlert'
import { api } from '@/lib/apiClient'

interface Course {
  id_curso: number
  nombre: string
  modalidad: 'PRESENCIAL' | 'ONLINE'
  inicio: string | null
  fin: string | null
  b_activo: boolean
  precio?: number
  total_lecciones?: number
  _count?: {
    horario: number
    imparte: number
  }
}

interface Level {
  id_nivel: number
  nombre: string
  b_activo: boolean
}

interface Teacher {
  id_profesor: number
  nombre: string
  paterno: string
  materno: string
  usuario: {
    email: string
  }
}

interface CourseFormData {
  nombre: string
  modalidad: 'PRESENCIAL' | 'ONLINE'
  inicio: string
  fin: string
  b_activo: boolean
  precio?: number
  total_lecciones?: number
}

export default function AdminCourseCrud() {
  const [courses, setCourses] = useState<Course[]>([])
  const [, setLevels] = useState<Level[]>([])
  const [, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalityFilter, setModalityFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 400)

  const [formData, setFormData] = useState<CourseFormData>({
    nombre: '',
    modalidad: 'PRESENCIAL',
    inicio: '',
    fin: '',
    b_activo: true,
    precio: undefined,
    total_lecciones: undefined
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchCourses()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, modalityFilter, statusFilter, debouncedSearch])

  useEffect(() => { 
    fetchLevels()
    fetchTeachers()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      // Cancelar request previo
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(modalityFilter !== 'ALL' && { modalidad: modalityFilter }),
        ...(statusFilter !== 'ALL' && { activo: statusFilter }),
        ...(debouncedSearch && { search: debouncedSearch })
      })

      const data = await api<{ courses: Course[]; total: number }>(`/api/admin/courses?${params}`, { signal: controller.signal })
      setCourses(data.courses)
      setTotalPages(Math.ceil(data.total / 10))
    } catch (error: any) {
      if (error?.name === 'AbortError') return
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLevels = async () => {
    try {
      const data = await api<{ levels: Level[] }>('/api/admin/system/levels')
      setLevels(data.levels)
    } catch (error) {
      console.error('Error fetching levels:', error)
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/users?role=PROFESOR&limit=100')
      const data = await response.json()
      if (response.ok) {
        setTeachers(data.users.map((user: {
          detalles: { id_profesor: number };
          nombre: string;
          apellido: string;
          email: string;
        }) => ({
          id_profesor: user.detalles?.id_profesor,
          nombre: user.nombre,
          paterno: user.apellido,
          materno: '',
          usuario: { email: user.email }
        })).filter((teacher: Record<string, unknown>) => teacher.id_profesor))
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  const handleCreateCourse = () => {
    setEditingCourse(null)
    setFormData({
      nombre: '',
      modalidad: 'PRESENCIAL',
      inicio: '',
      fin: '',
      b_activo: true,
      precio: undefined,
      total_lecciones: undefined
    })
    setErrors({})
    setShowModal(true)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      nombre: course.nombre,
      modalidad: course.modalidad,
      inicio: course.inicio ? new Date(course.inicio).toISOString().split('T')[0] : '',
      fin: course.fin ? new Date(course.fin).toISOString().split('T')[0] : '',
      b_activo: course.b_activo,
      precio: course.precio || undefined,
      total_lecciones: course.total_lecciones || undefined
    })
    setErrors({})
    setShowModal(true)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre) newErrors.nombre = 'Nombre del curso es requerido'
    if (!formData.inicio) newErrors.inicio = 'Fecha de inicio es requerida'
    if (!formData.fin) newErrors.fin = 'Fecha de fin es requerida'
    
    if (formData.inicio && formData.fin && new Date(formData.inicio) >= new Date(formData.fin)) {
      newErrors.fin = 'La fecha de fin debe ser posterior a la fecha de inicio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const url = editingCourse ? `/api/admin/courses/${editingCourse.id_curso}` : '/api/admin/courses'
      const method = editingCourse ? 'PUT' : 'POST'

      await api(url, {
        method,
        body: JSON.stringify(formData)
      })
      setSuccessMessage(editingCourse ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente')
      setShowModal(false)
      fetchCourses()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      setErrors({ general: error?.message || 'Error al guardar curso' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este curso?')) return

    try {
      await api(`/api/admin/courses/${courseId}`, { method: 'DELETE' })
      setSuccessMessage('Curso eliminado exitosamente')
      fetchCourses()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      alert(error?.message || 'Error al eliminar curso')
    }
  }

  const getModalityIcon = (modalidad: string) => {
    return modalidad === 'ONLINE' ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />
  }

  const getModalityColor = (modalidad: string) => {
    return modalidad === 'ONLINE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No definida'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-[#00246a]" />
          <h1 className="text-2xl font-bold text-[#00246a]">Gestión de Cursos</h1>
        </div>
        {/* Botón de crear curso removido para Admin: solo lectura/edición/eliminación */}
      </div>

      {/* Success Message */}
      {successMessage && (
        <FeedbackAlert type="success">{successMessage}</FeedbackAlert>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre del curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            >
              <option value="ALL">Todas las modalidades</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            >
              <option value="ALL">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00246a] mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando cursos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modalidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estadísticas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course, idx) => (
                  <tr key={course.id_curso ?? `course-${idx}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {course.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getModalityColor(course.modalidad)}`}>
                        {getModalityIcon(course.modalidad)}
                        {course.modalidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-xs">Inicio: {formatDate(course.inicio)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-xs">Fin: {formatDate(course.fin)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-xs">{course._count?.horario || 0} estudiantes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-xs">{course._count?.imparte || 0} clases</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        course.b_activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {course.b_activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id_curso)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/45 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00246a]">
                {editingCourse ? 'Editar Curso' : 'Crear Nuevo Curso'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {errors.general && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {errors.general}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Curso *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                      errors.nombre ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Inglés Básico A1"
                  />
                  {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modalidad *
                  </label>
                  <select
                    value={formData.modalidad}
                    onChange={(e) => setFormData({ ...formData, modalidad: e.target.value as 'PRESENCIAL' | 'ONLINE' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  >
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.b_activo.toString()}
                    onChange={(e) => setFormData({ ...formData, b_activo: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.inicio}
                    onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                      errors.inicio ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.inicio && <p className="mt-1 text-sm text-red-600">{errors.inicio}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    value={formData.fin}
                    onChange={(e) => setFormData({ ...formData, fin: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                      errors.fin ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.fin && <p className="mt-1 text-sm text-red-600">{errors.fin}</p>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Guardando...' : (editingCourse ? 'Actualizar' : 'Crear Curso')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
