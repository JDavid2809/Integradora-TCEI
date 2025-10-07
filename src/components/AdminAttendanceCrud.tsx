'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Calendar, Users, Search, Filter, Edit, Trash2, Plus, Save, X, AlertTriangle, BookOpen } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { Pagination } from './admin/common/Pagination'
import { FeedbackAlert } from './admin/common/FeedbackAlert'
import { api } from '@/lib/apiClient'

interface AttendanceRecord {
  id: number
  estudiante: {
    id: number
    nombre: string
    email: string
  }
  curso: string
  nivel: string
  profesor: string
  asistencia: number | null
  fecha: string | null
  calificacion: number | null
  tipo: string | null
  comentario: string | null
}

interface Student {
  id_estudiante: number
  nombre: string
  email: string
}

interface Course {
  id_curso: number
  nombre: string
}

interface AttendanceFormData {
  id_estudiante: number | null
  id_imparte: number | null
  asistencia: number | null
  fecha: string
  calificacion: number | null
  tipo: string | null
  comentario: string
}

export default function AdminAttendanceCrud() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState<string>('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 400)

  const [formData, setFormData] = useState<AttendanceFormData>({
    id_estudiante: null,
    id_imparte: null,
    asistencia: null,
    fecha: new Date().toISOString().split('T')[0],
    calificacion: null,
    tipo: null,
    comentario: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchRecords()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, courseFilter, startDate, endDate, debouncedSearch])

  useEffect(() => {
    fetchStudents()
    fetchCourses()
  }, [])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(courseFilter !== 'ALL' && { courseId: courseFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(debouncedSearch && { search: debouncedSearch })
      })

      const data = await api<{ attendance: AttendanceRecord[]; total: number; totalPages: number }>(
        `/api/admin/attendance?${params}`,
        { signal: controller.signal }
      )
      setRecords(data.attendance || [])
      setTotalPages(data.totalPages || 1)
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return
      console.error('Error al cargar asistencias:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const data = await api<{ users: any[] }>('/api/admin/users?role=ESTUDIANTE&limit=1000')
      setStudents(data.users.map((user: any) => ({
        id_estudiante: user.detalles?.id_estudiante,
        nombre: `${user.nombre} ${user.apellido}`,
        email: user.email
      })).filter((s: any) => s.id_estudiante))
    } catch (error) {
      console.error('Error al cargar estudiantes:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const data = await api<{ courses: Course[] }>('/api/admin/courses?limit=100')
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Error al cargar cursos:', error)
    }
  }

  const handleCreateRecord = () => {
    setEditingRecord(null)
    setFormData({
      id_estudiante: null,
      id_imparte: null,
      asistencia: null,
      fecha: new Date().toISOString().split('T')[0],
      calificacion: null,
      tipo: null,
      comentario: ''
    })
    setErrors({})
    setShowModal(true)
  }

  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecord(record)
    setFormData({
      id_estudiante: record.estudiante.id,
      id_imparte: null, // TODO: necesitamos id_imparte del registro
      asistencia: record.asistencia,
      fecha: record.fecha ? new Date(record.fecha).toISOString().split('T')[0] : '',
      calificacion: record.calificacion,
      tipo: record.tipo,
      comentario: record.comentario || ''
    })
    setErrors({})
    setShowModal(true)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.id_estudiante) newErrors.id_estudiante = 'Estudiante es requerido'
    if (!formData.id_imparte) newErrors.id_imparte = 'Clase es requerida'
    if (!formData.fecha) newErrors.fecha = 'Fecha es requerida'
    
    if (formData.asistencia !== null && (formData.asistencia < 0 || formData.asistencia > 100)) {
      newErrors.asistencia = 'La asistencia debe estar entre 0 y 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const url = editingRecord ? `/api/admin/attendance/${editingRecord.id}` : '/api/admin/attendance'
      const method = editingRecord ? 'PUT' : 'POST'

      await api(url, {
        method,
        body: JSON.stringify(formData)
      })
      setSuccessMessage(editingRecord ? 'Asistencia actualizada exitosamente' : 'Asistencia registrada exitosamente')
      setShowModal(false)
      fetchRecords()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al guardar asistencia'
      setErrors({ general: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRecord = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) return

    try {
      await api(`/api/admin/attendance/${id}`, { method: 'DELETE' })
      setSuccessMessage('Registro eliminado exitosamente')
      fetchRecords()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar registro'
      alert(message)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
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
          <Calendar className="w-8 h-8 text-[#00246a]" />
          <h1 className="text-2xl font-bold text-[#00246a]">Gestión de Asistencias</h1>
        </div>
        <button
          onClick={handleCreateRecord}
          className="flex items-center gap-2 bg-[#00246a] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Registrar Asistencia
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <FeedbackAlert type="success">{successMessage}</FeedbackAlert>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            >
              <option key="ALL" value="ALL">Todos los cursos</option>
              {courses.map((course, idx) => (
                <option key={course.id_curso ?? `course-${idx}`} value={course.id_curso}>{course.nombre}</option>
              ))}
            </select>
          </div>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            placeholder="Fecha inicio"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            placeholder="Fecha fin"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00246a] mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando registros...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asistencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record, idx) => (
                  <tr key={record.id ?? `record-${idx}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.estudiante.nombre}</div>
                        <div className="text-sm text-gray-500">{record.estudiante.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.curso}</div>
                      <div className="text-sm text-gray-500">{record.nivel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.asistencia && record.asistencia >= 80 
                          ? 'bg-green-100 text-green-800' 
                          : record.asistencia && record.asistencia >= 50
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.asistencia !== null ? `${record.asistencia}%` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.calificacion !== null ? record.calificacion.toFixed(1) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00246a]">
                {editingRecord ? 'Editar Asistencia' : 'Registrar Asistencia'}
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
                    Estudiante *
                  </label>
                  <select
                    value={formData.id_estudiante || ''}
                    onChange={(e) => setFormData({ ...formData, id_estudiante: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                      errors.id_estudiante ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={!!editingRecord}
                  >
                    <option key="empty" value="">Seleccionar estudiante</option>
                    {students.map((student, idx) => (
                      <option key={student.id_estudiante ?? `student-${idx}`} value={student.id_estudiante}>
                        {student.nombre} - {student.email}
                      </option>
                    ))}
                  </select>
                  {errors.id_estudiante && <p className="mt-1 text-sm text-red-600">{errors.id_estudiante}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                      errors.fecha ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.fecha && <p className="mt-1 text-sm text-red-600">{errors.fecha}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asistencia (%)
                  </label>
                  <input
                    type="number"
                    value={formData.asistencia ?? ''}
                    onChange={(e) => setFormData({ ...formData, asistencia: e.target.value ? parseFloat(e.target.value) : null })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                      errors.asistencia ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0-100"
                  />
                  {errors.asistencia && <p className="mt-1 text-sm text-red-600">{errors.asistencia}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calificación
                  </label>
                  <input
                    type="number"
                    value={formData.calificacion ?? ''}
                    onChange={(e) => setFormData({ ...formData, calificacion: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comentario
                  </label>
                  <textarea
                    value={formData.comentario}
                    onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                    rows={3}
                    placeholder="Observaciones adicionales..."
                  />
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
                  {isSubmitting ? 'Guardando...' : (editingRecord ? 'Actualizar' : 'Registrar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
