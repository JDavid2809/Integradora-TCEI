'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Course {
  id: number
  nombre: string
  modalidad: 'PRESENCIAL' | 'ONLINE'
  inicio: string | null
  fin: string | null
  activo: boolean
  profesores: any[]
  estudiantes_inscritos: number
  total_pagos: number
}

interface CourseFormData {
  nombre: string
  modalidad: 'PRESENCIAL' | 'ONLINE'
  inicio: string
  fin: string
  profesores: number[]
  niveles: number[]
}

interface Professor {
  id: number
  nombre: string
}

interface Level {
  id: number
  nombre: string
}

export default function AdminCoursesPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [professors, setProfessors] = useState<Professor[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [, setEditingCourse] = useState<Course | null>(null)

  const [formData, setFormData] = useState<CourseFormData>({
    nombre: '',
    modalidad: 'PRESENCIAL',
    inicio: '',
    fin: '',
    profesores: [],
    niveles: []
  })

  useEffect(() => {
    fetchCourses()
    fetchProfessors()
    fetchLevels()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfessors = async () => {
    try {
      const response = await fetch('/api/admin/users?role=PROFESOR')
      if (response.ok) {
        const data = await response.json()
        setProfessors(data.users.map((user: any) => ({
          id: user.detalles?.id_profesor || user.id,
          nombre: `${user.nombre} ${user.apellido}`
        })))
      }
    } catch (error) {
      console.error('Error al cargar profesores:', error)
    }
  }

  const fetchLevels = async () => {
    try {
      const response = await fetch('/api/admin/system/levels')
      if (response.ok) {
        const data = await response.json()
        setLevels(data.levels)
      }
    } catch (error) {
      console.error('Error al cargar niveles:', error)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Curso creado exitosamente')
        setShowCreateForm(false)
        setFormData({
          nombre: '',
          modalidad: 'PRESENCIAL',
          inicio: '',
          fin: '',
          profesores: [],
          niveles: []
        })
        fetchCourses()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al crear curso:', error)
      alert('Error al crear curso')
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este curso?')) return

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Curso eliminado exitosamente')
        fetchCourses()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al eliminar curso:', error)
      alert('Error al eliminar curso')
    }
  }

  if (!session || session.user?.rol !== 'ADMIN') {
    return <div>No autorizado</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#00246a]">Gestión de Cursos</h1>
        <button
          onClick={() => {
            setShowCreateForm(true)
            setEditingCourse(null)
            setFormData({
              nombre: '',
              modalidad: 'PRESENCIAL',
              inicio: '',
              fin: '',
              profesores: [],
              niveles: []
            })
          }}
          className="bg-[#00246a] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Crear Curso
        </button>
      </div>

      {/* Lista de cursos */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00246a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cursos...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modalidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiantes
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
                {courses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {course.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {course.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        course.modalidad === 'PRESENCIAL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {course.modalidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {course.inicio ? new Date(course.inicio).toLocaleDateString() : 'Sin fecha'}
                      </div>
                      <div className="text-gray-500">
                        {course.fin ? new Date(course.fin).toLocaleDateString() : 'Sin fecha fin'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.estudiantes_inscritos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        course.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de crear curso */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00246a]">
                Crear Nuevo Curso
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Curso *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modalidad *
                  </label>
                  <select
                    required
                    value={formData.modalidad}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      modalidad: e.target.value as 'PRESENCIAL' | 'ONLINE'
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  >
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.inicio}
                    onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={formData.fin}
                    onChange={(e) => setFormData({ ...formData, fin: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profesores
                  </label>
                  <select
                    multiple
                    value={formData.profesores.map(String)}
                    onChange={(e) => {
                      const selectedValues = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                      setFormData({ ...formData, profesores: selectedValues })
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent h-24"
                  >
                    {professors.map(prof => (
                      <option key={prof.id} value={prof.id}>
                        {prof.nombre}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Mantén Ctrl presionado para seleccionar múltiples</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Niveles
                  </label>
                  <select
                    multiple
                    value={formData.niveles.map(String)}
                    onChange={(e) => {
                      const selectedValues = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                      setFormData({ ...formData, niveles: selectedValues })
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent h-24"
                  >
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.nombre}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Mantén Ctrl presionado para seleccionar múltiples</p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
