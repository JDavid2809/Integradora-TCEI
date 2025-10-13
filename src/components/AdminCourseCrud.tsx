'use client''use client'



import React, { useState, useEffect, useRef } from 'react'import React, { useState, useEffect, useRef } from 'react'

import { import { 

  BookOpen,   BookOpen, 

  Plus,   Plus, 

  Edit,   Edit, 

  Trash2,   Trash2, 

  Search,   Search, 

  Filter,  Filter,

  Calendar,  Calendar,

  Save,  Save,

  Clock,  Clock,

  Users,  Users,

  MapPin,  MapPin,

  Globe,  Globe

  X,} from 'lucide-react'

  AlertTriangleimport { useDebounce } from '@/hooks/useDebounce'

} from 'lucide-react'import { Pagination } from './admin/common/Pagination'

import { useDebounce } from '@/hooks/useDebounce'import { FeedbackAlert } from './admin/common/FeedbackAlert'

import { Pagination } from './admin/common/Pagination'import { Modal } from './admin/common/Modal'

import { FeedbackAlert } from './admin/common/FeedbackAlert'import { api } from '@/lib/apiClient'

import { Modal } from './admin/common/Modal'

import { api } from '@/lib/apiClient'interface Course {

  id_curso: number | null | undefined

interface Course {  nombre: string

  id_curso: number | null | undefined  modalidad: 'PRESENCIAL' | 'ONLINE'

  nombre: string  inicio: string | null

  modalidad: 'PRESENCIAL' | 'ONLINE'  fin: string | null

  inicio: string | null  b_activo: boolean | null | undefined

  fin: string | null  precio?: number

  b_activo: boolean | null | undefined  total_lecciones?: number

  precio?: number  _count?: {

  total_lecciones?: number    horario: number

  _count?: {    imparte: number

    horario: number  }

    imparte: number}

  }

}interface Level {

  id_nivel: number

interface Level {  nombre: string

  id_nivel: number  b_activo: boolean

  nombre: string}

  b_activo: boolean

}interface Teacher {

  id_profesor: number

interface Teacher {  nombre: string

  id_profesor: number  paterno: string

  nombre: string  materno: string

  paterno: string  usuario: {

  materno: string    email: string

  usuario: {  }

    email: string}

  }

}interface CourseFormData {

  nombre: string

interface CourseFormData {  modalidad: 'PRESENCIAL' | 'ONLINE'

  nombre: string  inicio: string

  modalidad: 'PRESENCIAL' | 'ONLINE'  fin: string

  inicio: string  b_activo: boolean

  fin: string  precio?: number

  b_activo: boolean  total_lecciones?: number

  precio?: number}

  total_lecciones?: number

}export default function AdminCourseCrud() {

  const [courses, setCourses] = useState<Course[]>([])

export default function AdminCourseCrud() {  const [, setLevels] = useState<Level[]>([])

  const [courses, setCourses] = useState<Course[]>([])  const [, setTeachers] = useState<Teacher[]>([])

  const [, setLevels] = useState<Level[]>([])  const [loading, setLoading] = useState(true)

  const [, setTeachers] = useState<Teacher[]>([])  const [showModal, setShowModal] = useState(false)

  const [loading, setLoading] = useState(true)  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  const [showModal, setShowModal] = useState(false)  const [searchTerm, setSearchTerm] = useState('')

  const [editingCourse, setEditingCourse] = useState<Course | null>(null)  const [modalityFilter, setModalityFilter] = useState<string>('ALL')

  const [searchTerm, setSearchTerm] = useState('')  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const [modalityFilter, setModalityFilter] = useState<string>('ALL')  const [currentPage, setCurrentPage] = useState(1)

  const [statusFilter, setStatusFilter] = useState<string>('ALL')  const [totalPages, setTotalPages] = useState(1)

  const [currentPage, setCurrentPage] = useState(1)  const [isSubmitting, setIsSubmitting] = useState(false)

  const [totalPages, setTotalPages] = useState(1)  const abortRef = useRef<AbortController | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const abortRef = useRef<AbortController | null>(null)  const debouncedSearch = useDebounce(searchTerm, 400)



  const debouncedSearch = useDebounce(searchTerm, 400)  const [formData, setFormData] = useState<CourseFormData>({

    nombre: '',

  const [formData, setFormData] = useState<CourseFormData>({    modalidad: 'PRESENCIAL',

    nombre: '',    inicio: '',

    modalidad: 'PRESENCIAL',    fin: '',

    inicio: '',    b_activo: true,

    fin: '',    precio: undefined,

    b_activo: true,    total_lecciones: undefined

    precio: undefined,  })

    total_lecciones: undefined

  })  const [errors, setErrors] = useState<Record<string, string>>({})

  const [successMessage, setSuccessMessage] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [successMessage, setSuccessMessage] = useState('')  useEffect(() => {

    fetchCourses()

  useEffect(() => {  // eslint-disable-next-line react-hooks/exhaustive-deps

    fetchCourses()  }, [currentPage, modalityFilter, statusFilter, debouncedSearch])

  // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [currentPage, modalityFilter, statusFilter, debouncedSearch])  useEffect(() => { 

    fetchLevels()

  useEffect(() => {     fetchTeachers()

    fetchLevels()  }, [])

    fetchTeachers()

  }, [])  const fetchCourses = async () => {

    try {

  const fetchCourses = async () => {      setLoading(true)

    try {      // Cancelar request previo

      setLoading(true)      if (abortRef.current) abortRef.current.abort()

      // Cancelar request previo      const controller = new AbortController()

      if (abortRef.current) abortRef.current.abort()      abortRef.current = controller

      const controller = new AbortController()

      abortRef.current = controller      const params = new URLSearchParams({

        page: (currentPage || 1).toString(),

      const params = new URLSearchParams({        limit: '10',

        page: (currentPage || 1).toString(),        ...(modalityFilter !== 'ALL' && { modalidad: modalityFilter }),

        limit: '10',        ...(statusFilter !== 'ALL' && { activo: statusFilter }),

        ...(modalityFilter !== 'ALL' && { modalidad: modalityFilter }),        ...(debouncedSearch && { search: debouncedSearch })

        ...(statusFilter !== 'ALL' && { activo: statusFilter }),      })

        ...(debouncedSearch && { search: debouncedSearch })

      })      const data = await api<{ courses: Course[]; total: number }>(`/api/admin/courses?${params}`, { signal: controller.signal })

      setCourses(data.courses)

      const data = await api<{ courses: Course[]; total: number }>(`/api/admin/courses?${params}`, { signal: controller.signal })      setTotalPages(Math.ceil(data.total / 10))

      setCourses(data.courses)    } catch (error: any) {

      setTotalPages(Math.ceil(data.total / 10))      if (error?.name === 'AbortError') return

    } catch (error: any) {      console.error('Error fetching courses:', error)

      if (error?.name === 'AbortError') return    } finally {

      console.error('Error fetching courses:', error)      setLoading(false)

    } finally {    }

      setLoading(false)  }

    }

  }  const fetchLevels = async () => {

    try {

  const fetchLevels = async () => {      const data = await api<{ levels: Level[] }>('/api/admin/system/levels')

    try {      setLevels(data.levels)

      const data = await api<{ levels: Level[] }>('/api/admin/system/levels')    } catch (error) {

      setLevels(data.levels)      console.error('Error fetching levels:', error)

    } catch (error) {    }

      console.error('Error fetching levels:', error)  }

    }

  }  const fetchTeachers = async () => {

    try {

  const fetchTeachers = async () => {      const response = await fetch('/api/admin/users?role=PROFESOR&limit=100')

    try {      const data = await response.json()

      const response = await fetch('/api/admin/users?role=PROFESOR&limit=100')      if (response.ok) {

      const data = await response.json()        setTeachers(data.users.map((user: {

      if (response.ok) {          detalles: { id_profesor: number };

        setTeachers(data.users.map((user: {          nombre: string;

          detalles: { id_profesor: number };          apellido: string;

          nombre: string;          email: string;

          apellido: string;        }) => ({

          email: string;          id_profesor: user.detalles?.id_profesor,

        }) => ({          nombre: user.nombre,

          id_profesor: user.detalles?.id_profesor,          paterno: user.apellido,

          nombre: user.nombre,          materno: '',

          paterno: user.apellido,          usuario: { email: user.email }

          materno: '',        })).filter((teacher: Record<string, unknown>) => teacher.id_profesor))

          usuario: { email: user.email }      }

        })).filter((teacher: Record<string, unknown>) => teacher.id_profesor))    } catch (error) {

      }      console.error('Error fetching teachers:', error)

    } catch (error) {    }

      console.error('Error fetching teachers:', error)  }

    }

  }  const handleCreateCourse = () => {

    setEditingCourse(null)

  const handleCreateCourse = () => {    setFormData({

    setEditingCourse(null)      nombre: '',

    setFormData({      modalidad: 'PRESENCIAL',

      nombre: '',      inicio: '',

      modalidad: 'PRESENCIAL',      fin: '',

      inicio: '',      b_activo: true,

      fin: '',      precio: undefined,

      b_activo: true,      total_lecciones: undefined

      precio: undefined,    })

      total_lecciones: undefined    setErrors({})

    })    setShowModal(true)

    setErrors({})  }

    setShowModal(true)

  }  const handleEditCourse = (course: Course) => {

    setEditingCourse(course)

  const handleEditCourse = (course: Course) => {    setFormData({

    setEditingCourse(course)      nombre: course.nombre || '',

    setFormData({      modalidad: course.modalidad || 'PRESENCIAL',

      nombre: course.nombre || '',      inicio: course.inicio ? new Date(course.inicio).toISOString().split('T')[0] : '',

      modalidad: course.modalidad || 'PRESENCIAL',      fin: course.fin ? new Date(course.fin).toISOString().split('T')[0] : '',

      inicio: course.inicio ? new Date(course.inicio).toISOString().split('T')[0] : '',      b_activo: course.b_activo ?? true,

      fin: course.fin ? new Date(course.fin).toISOString().split('T')[0] : '',      precio: course.precio || undefined,

      b_activo: course.b_activo ?? true,      total_lecciones: course.total_lecciones || undefined

      precio: course.precio || undefined,    })

      total_lecciones: course.total_lecciones || undefined    setErrors({})

    })    setShowModal(true)

    setErrors({})  }

    setShowModal(true)

  }  const validateForm = (): boolean => {

    const newErrors: Record<string, string> = {}

  const validateForm = (): boolean => {

    const newErrors: Record<string, string> = {}    if (!formData.nombre) newErrors.nombre = 'Nombre del curso es requerido'

    if (!formData.inicio) newErrors.inicio = 'Fecha de inicio es requerida'

    if (!formData.nombre) newErrors.nombre = 'Nombre del curso es requerido'    if (!formData.fin) newErrors.fin = 'Fecha de fin es requerida'

    if (!formData.inicio) newErrors.inicio = 'Fecha de inicio es requerida'    

    if (!formData.fin) newErrors.fin = 'Fecha de fin es requerida'    if (formData.inicio && formData.fin && new Date(formData.inicio) >= new Date(formData.fin)) {

          newErrors.fin = 'La fecha de fin debe ser posterior a la fecha de inicio'

    if (formData.inicio && formData.fin && new Date(formData.inicio) >= new Date(formData.fin)) {    }

      newErrors.fin = 'La fecha de fin debe ser posterior a la fecha de inicio'

    }    setErrors(newErrors)

    return Object.keys(newErrors).length === 0

    setErrors(newErrors)  }

    return Object.keys(newErrors).length === 0

  }  const handleSubmit = async () => {

    if (!validateForm()) return

  const handleSubmit = async () => {

    if (!validateForm()) return    setIsSubmitting(true)

    try {

    setIsSubmitting(true)<<<<<<< HEAD

    try {      await saveCourseApi(formData, editingCourse?.id_curso || undefined)

      const url = editingCourse ? `/api/admin/courses/${editingCourse.id_curso}` : '/api/admin/courses'=======

      const method = editingCourse ? 'PUT' : 'POST'      const url = editingCourse ? `/api/admin/courses/${editingCourse.id_curso}` : '/api/admin/courses'

      const method = editingCourse ? 'PUT' : 'POST'

      await api(url, {

        method,      await api(url, {

        body: JSON.stringify(formData)        method,

      })        body: JSON.stringify(formData)

      setSuccessMessage(editingCourse ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente')      })

      setShowModal(false)>>>>>>> 4ee400923b484a8335a601117a474b41838caf51

      fetchCourses()      setSuccessMessage(editingCourse ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente')

      setTimeout(() => setSuccessMessage(''), 3000)      setShowModal(false)

    } catch (error: any) {      fetchCourses()

      setErrors({ general: error?.message || 'Error al guardar curso' })      setTimeout(() => setSuccessMessage(''), 3000)

    } finally {    } catch (error: any) {

      setIsSubmitting(false)      setErrors({ general: error?.message || 'Error al guardar curso' })

    }    } finally {

  }      setIsSubmitting(false)

    }

  const handleDeleteCourse = async (courseId: number) => {  }

    if (!confirm('¿Estás seguro de que quieres eliminar este curso?')) return

  const handleDeleteCourse = async (courseId: number) => {

    try {    if (!confirm('¿Estás seguro de que quieres eliminar este curso?')) return

      await api(`/api/admin/courses/${courseId}`, { method: 'DELETE' })

      setSuccessMessage('Curso eliminado exitosamente')    try {

      fetchCourses()      await api(`/api/admin/courses/${courseId}`, { method: 'DELETE' })

      setTimeout(() => setSuccessMessage(''), 3000)      setSuccessMessage('Curso eliminado exitosamente')

    } catch (error: any) {      fetchCourses()

      alert(error?.message || 'Error al eliminar curso')      setTimeout(() => setSuccessMessage(''), 3000)

    }    } catch (error: any) {

  }      alert(error?.message || 'Error al eliminar curso')

    }

  const getModalityIcon = (modalidad: string) => {  }

    return modalidad === 'ONLINE' ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />

  }  const getModalityIcon = (modalidad: string) => {

    return modalidad === 'ONLINE' ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />

  const getModalityColor = (modalidad: string) => {  }

    return modalidad === 'ONLINE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'

  }  const getModalityColor = (modalidad: string) => {

    return modalidad === 'ONLINE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'

  const formatDate = (dateString: string | null) => {  }

    if (!dateString) return 'No definida'

    return new Date(dateString).toLocaleDateString('es-ES', {  const formatDate = (dateString: string | null) => {

      year: 'numeric',    if (!dateString) return 'No definida'

      month: 'short',    return new Date(dateString).toLocaleDateString('es-ES', {

      day: 'numeric'      year: 'numeric',

    })      month: 'short',

  }      day: 'numeric'

    })

  return (  }

    <div className="p-6 space-y-6">

      {/* Header */}  return (

      <div className="flex justify-between items-center">    <div className="p-6 space-y-6">

        <div className="flex items-center gap-3">      {/* Header */}

          <BookOpen className="w-8 h-8 text-[#00246a]" />      <div className="flex justify-between items-center">

          <h1 className="text-2xl font-bold text-[#00246a]">Gestión de Cursos</h1>        <div className="flex items-center gap-3">

        </div>          <BookOpen className="w-8 h-8 text-[#00246a]" />

        <button          <h1 className="text-2xl font-bold text-[#00246a]">Gestión de Cursos</h1>

          onClick={handleCreateCourse}        </div>

          className="flex items-center gap-2 bg-[#00246a] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"        {/* Botón de crear curso removido para Admin: solo lectura/edición/eliminación */}

        >      </div>

          <Plus className="w-4 h-4" />

          Crear Curso      {/* Success Message */}

        </button>      {successMessage && (

      </div>        <FeedbackAlert type="success">{successMessage}</FeedbackAlert>

      )}

      {/* Success Message */}

      {successMessage && (      {/* Filters */}

        <FeedbackAlert type="success">{successMessage}</FeedbackAlert>      <div className="bg-white p-4 rounded-lg shadow-md">

      )}        <div className="flex gap-4 items-center flex-wrap">

          <div className="flex-1 min-w-64 relative">

      {/* Filters */}            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

      <div className="bg-white p-4 rounded-lg shadow-md">            <input

        <div className="flex gap-4 items-center flex-wrap">              type="text"

          <div className="flex-1 min-w-64 relative">              placeholder="Buscar por nombre del curso..."

            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />              value={searchTerm}

            <input              onChange={(e) => setSearchTerm(e.target.value)}

              type="text"              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"

              placeholder="Buscar por nombre del curso..."            />

              value={searchTerm}          </div>

              onChange={(e) => setSearchTerm(e.target.value)}          <div className="flex items-center gap-2">

              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"            <Filter className="w-5 h-5 text-gray-400" />

            />            <select

          </div>              value={modalityFilter}

          <div className="flex items-center gap-2">              onChange={(e) => setModalityFilter(e.target.value)}

            <Filter className="w-5 h-5 text-gray-400" />              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"

            <select            >

              value={modalityFilter}              <option value="ALL">Todas las modalidades</option>

              onChange={(e) => setModalityFilter(e.target.value)}              <option value="PRESENCIAL">Presencial</option>

              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"              <option value="ONLINE">Online</option>

            >            </select>

              <option value="ALL">Todas las modalidades</option>          </div>

              <option value="PRESENCIAL">Presencial</option>          <div className="flex items-center gap-2">

              <option value="ONLINE">Online</option>            <select

            </select>              value={statusFilter}

          </div>              onChange={(e) => setStatusFilter(e.target.value)}

          <div className="flex items-center gap-2">              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"

            <select            >

              value={statusFilter}              <option value="ALL">Todos los estados</option>

              onChange={(e) => setStatusFilter(e.target.value)}              <option value="true">Activos</option>

              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"              <option value="false">Inactivos</option>

            >            </select>

              <option value="ALL">Todos los estados</option>          </div>

              <option value="true">Activos</option>        </div>

              <option value="false">Inactivos</option>      </div>

            </select>

          </div>      {/* Courses Table */}

        </div>      <div className="bg-white rounded-lg shadow-md overflow-hidden">

      </div>        {loading ? (

          <div className="p-8 text-center">

      {/* Courses Table */}            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00246a] mx-auto"></div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">            <p className="mt-2 text-gray-600">Cargando cursos...</p>

        {loading ? (          </div>

          <div className="p-8 text-center">        ) : (

            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00246a] mx-auto"></div>          <div className="overflow-x-auto">

            <p className="mt-2 text-gray-600">Cargando cursos...</p>            <table className="w-full">

          </div>              <thead className="bg-gray-50">

        ) : (                <tr>

          <div className="overflow-x-auto">                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

            <table className="w-full">                    Curso

              <thead className="bg-gray-50">                  </th>

                <tr>                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                    Modalidad

                    Curso                  </th>

                  </th>                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                    Duración

                    Modalidad                  </th>

                  </th>                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                    Estadísticas

                    Duración                  </th>

                  </th>                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                    Estado

                    Estadísticas                  </th>

                  </th>                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                    Acciones

                    Estado                  </th>

                  </th>                </tr>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">              </thead>

                    Acciones              <tbody className="bg-white divide-y divide-gray-200">

                  </th><<<<<<< HEAD

                </tr>                {(courses || []).filter(Boolean).map((course, index) => (

              </thead>                  <tr key={`course-${course?.id_curso || index}-${index}`} className="hover:bg-gray-50">

              <tbody className="bg-white divide-y divide-gray-200">=======

                {courses.map((course, idx) => (                {courses.map((course, idx) => (

                  <tr key={course.id_curso ?? `course-${idx}`} className="hover:bg-gray-50">                  <tr key={course.id_curso ?? `course-${idx}`} className="hover:bg-gray-50">

                    <td className="px-6 py-4 whitespace-nowrap">>>>>>>> 4ee400923b484a8335a601117a474b41838caf51

                      <div className="text-sm font-medium text-gray-900">                    <td className="px-6 py-4 whitespace-nowrap">

                        {course?.nombre || 'Sin nombre'}                      <div className="text-sm font-medium text-gray-900">

                      </div>                        {course?.nombre || 'Sin nombre'}

                    </td>                      </div>

                    <td className="px-6 py-4 whitespace-nowrap">                    </td>

                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getModalityColor(course?.modalidad || 'PRESENCIAL')}`}>                    <td className="px-6 py-4 whitespace-nowrap">

                        {getModalityIcon(course?.modalidad || 'PRESENCIAL')}                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getModalityColor(course?.modalidad || 'PRESENCIAL')}`}>

                        {course?.modalidad || 'PRESENCIAL'}                        {getModalityIcon(course?.modalidad || 'PRESENCIAL')}

                      </span>                        {course?.modalidad || 'PRESENCIAL'}

                    </td>                      </span>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">                    </td>

                      <div className="space-y-1">                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                        <div className="flex items-center gap-1">                      <div className="space-y-1">

                          <Calendar className="w-4 h-4 text-gray-400" />                        <div className="flex items-center gap-1">

                          <span className="text-xs">Inicio: {formatDate(course?.inicio)}</span>                          <Calendar className="w-4 h-4 text-gray-400" />

                        </div>                          <span className="text-xs">Inicio: {formatDate(course?.inicio)}</span>

                        <div className="flex items-center gap-1">                        </div>

                          <Clock className="w-4 h-4 text-gray-400" />                        <div className="flex items-center gap-1">

                          <span className="text-xs">Fin: {formatDate(course?.fin)}</span>                          <Clock className="w-4 h-4 text-gray-400" />

                        </div>                          <span className="text-xs">Fin: {formatDate(course?.fin)}</span>

                      </div>                        </div>

                    </td>                      </div>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">                    </td>

                      <div className="space-y-1">                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">

                        <div className="flex items-center gap-1">                      <div className="space-y-1">

                          <Users className="w-4 h-4 text-gray-400" />                        <div className="flex items-center gap-1">

                          <span className="text-xs">{course._count?.horario || 0} estudiantes</span>                          <Users className="w-4 h-4 text-gray-400" />

                        </div><<<<<<< HEAD

                        <div className="flex items-center gap-1">                          <span className="text-xs">{course?._count?.inscripciones || 0} estudiantes</span>

                          <BookOpen className="w-4 h-4 text-gray-400" />=======

                          <span className="text-xs">{course?._count?.imparte || 0} clases</span>                          <span className="text-xs">{course._count?.horario || 0} estudiantes</span>

                        </div>>>>>>>> 4ee400923b484a8335a601117a474b41838caf51

                      </div>                        </div>

                    </td>                        <div className="flex items-center gap-1">

                    <td className="px-6 py-4 whitespace-nowrap">                          <BookOpen className="w-4 h-4 text-gray-400" />

                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${                          <span className="text-xs">{course?._count?.imparte || 0} clases</span>

                        (course?.b_activo ?? true) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'                        </div>

                      }`}>                      </div>

                        {(course?.b_activo ?? true) ? 'Activo' : 'Inactivo'}                    </td>

                      </span>                    <td className="px-6 py-4 whitespace-nowrap">

                    </td>                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">                        (course?.b_activo ?? true) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'

                      <div className="flex items-center gap-2">                      }`}>

                        <button                        {(course?.b_activo ?? true) ? 'Activo' : 'Inactivo'}

                          onClick={() => course && handleEditCourse(course)}                      </span>

                          className="text-blue-600 hover:text-blue-900 p-1 rounded"                    </td>

                          title="Editar"                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">

                        >                      <div className="flex items-center gap-2">

                          <Edit className="w-4 h-4" />                        <button

                        </button>                          onClick={() => course && handleEditCourse(course)}

                        <button                          className="text-blue-600 hover:text-blue-900 p-1 rounded"

                          onClick={() => course?.id_curso && handleDeleteCourse(course.id_curso)}                          title="Editar"

                          className="text-red-600 hover:text-red-900 p-1 rounded"                        >

                          title="Eliminar"                          <Edit className="w-4 h-4" />

                        >                        </button>

                          <Trash2 className="w-4 h-4" />                        <button

                        </button>                          onClick={() => course?.id_curso && handleDeleteCourse(course.id_curso)}

                      </div>                          className="text-red-600 hover:text-red-900 p-1 rounded"

                    </td>                          title="Eliminar"

                  </tr>                        >

                ))}                          <Trash2 className="w-4 h-4" />

              </tbody>                        </button>

            </table>                      </div>

          </div>                    </td>

        )}                  </tr>

                ))}

        {/* Pagination */}              </tbody>

        {!loading && (            </table>

          <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />          </div>

        )}        )}

      </div>

        {/* Pagination */}

      {/* Modal */}        {!loading && (

      {showModal && (          <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />

        <div className="fixed inset-0 bg-black/45 bg-opacity-50 flex items-center justify-center z-50">        )}

          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">      </div>

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-xl font-bold text-[#00246a]">      {/* Modal */}

                {editingCourse ? 'Editar Curso' : 'Crear Nuevo Curso'}      {showModal && (

              </h2>        <div className="fixed inset-0 bg-black/45 bg-opacity-50 flex items-center justify-center z-50">

              <button          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                onClick={() => setShowModal(false)}            <div className="flex justify-between items-center mb-4">

                className="text-gray-400 hover:text-gray-600"              <h2 className="text-xl font-bold text-[#00246a]">

              >                {editingCourse ? 'Editar Curso' : 'Crear Nuevo Curso'}

                <X className="w-6 h-6" />              </h2>

              </button>              <button

            </div>                onClick={() => setShowModal(false)}

                className="text-gray-400 hover:text-gray-600"

            {errors.general && (              >

              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">                <X className="w-6 h-6" />

                <AlertTriangle className="w-5 h-5" />              </button>

                {errors.general}            </div>

              </div>

            )}            {errors.general && (

              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">                <AlertTriangle className="w-5 h-5" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                {errors.general}

                <div className="md:col-span-2">              </div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">            )}

                    Nombre del Curso *

                  </label>            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">

                  <input              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    type="text"                <div className="md:col-span-2">

                    value={formData.nombre}                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}                    Nombre del Curso *

                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${                  </label>

                      errors.nombre ? 'border-red-500' : 'border-gray-300'                  <input

                    }`}                    type="text"

                    placeholder="Ej: Inglés Básico A1"                    value={formData.nombre}

                  />                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}

                  {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${

                </div>                      errors.nombre ? 'border-red-500' : 'border-gray-300'

                    }`}

                <div>                    placeholder="Ej: Inglés Básico A1"

                  <label className="block text-sm font-medium text-gray-700 mb-1">                  />

                    Modalidad *                  {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}

                  </label>                </div>

                  <select

                    value={formData.modalidad}                <div>

                    onChange={(e) => setFormData({ ...formData, modalidad: e.target.value as 'PRESENCIAL' | 'ONLINE' })}                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"                    Modalidad *

                  >                  </label>

                    <option value="PRESENCIAL">Presencial</option>                  <select

                    <option value="ONLINE">Online</option>                    value={formData.modalidad}

                  </select>                    onChange={(e) => setFormData({ ...formData, modalidad: e.target.value as 'PRESENCIAL' | 'ONLINE' })}

                </div>                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"

                  >

                <div>                    <option value="PRESENCIAL">Presencial</option>

                  <label className="block text-sm font-medium text-gray-700 mb-1">                    <option value="ONLINE">Online</option>

                    Estado                  </select>

                  </label>                </div>

                  <select

                    value={(formData.b_activo ?? true).toString()}                <div>

                    onChange={(e) => setFormData({ ...formData, b_activo: e.target.value === 'true' })}                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"                    Estado

                  >                  </label>

                    <option value="true">Activo</option>                  <select

                    <option value="false">Inactivo</option>                    value={(formData.b_activo ?? true).toString()}

                  </select>                    onChange={(e) => setFormData({ ...formData, b_activo: e.target.value === 'true' })}

                </div>                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"

                  >

                <div>                    <option value="true">Activo</option>

                  <label className="block text-sm font-medium text-gray-700 mb-1">                    <option value="false">Inactivo</option>

                    Fecha de Inicio *                  </select>

                  </label>                </div>

                  <input

                    type="date"                <div>

                    value={formData.inicio}                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}                    Fecha de Inicio *

                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${                  </label>

                      errors.inicio ? 'border-red-500' : 'border-gray-300'                  <input

                    }`}                    type="date"

                  />                    value={formData.inicio}

                  {errors.inicio && <p className="mt-1 text-sm text-red-600">{errors.inicio}</p>}                    onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}

                </div>                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${

                      errors.inicio ? 'border-red-500' : 'border-gray-300'

                <div>                    }`}

                  <label className="block text-sm font-medium text-gray-700 mb-1">                  />

                    Fecha de Fin *                  {errors.inicio && <p className="mt-1 text-sm text-red-600">{errors.inicio}</p>}

                  </label>                </div>

                  <input

                    type="date"                <div>

                    value={formData.fin}                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    onChange={(e) => setFormData({ ...formData, fin: e.target.value })}                    Fecha de Fin *

                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${                  </label>

                      errors.fin ? 'border-red-500' : 'border-gray-300'                  <input

                    }`}                    type="date"

                  />                    value={formData.fin}

                  {errors.fin && <p className="mt-1 text-sm text-red-600">{errors.fin}</p>}                    onChange={(e) => setFormData({ ...formData, fin: e.target.value })}

                </div>                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${

                      errors.fin ? 'border-red-500' : 'border-gray-300'

                <div>                    }`}

                  <label className="block text-sm font-medium text-gray-700 mb-1">                  />

                    Precio (opcional)                  {errors.fin && <p className="mt-1 text-sm text-red-600">{errors.fin}</p>}

                  </label>                </div>

                  <input              </div>

                    type="number"

                    min="0"              {/* Action Buttons */}

                    step="0.01"              <div className="flex justify-end gap-3 pt-4 border-t">

                    value={formData.precio || ''}                <button

                    onChange={(e) => setFormData({ ...formData, precio: e.target.value ? parseFloat(e.target.value) : undefined })}                  type="button"

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"                  onClick={() => setShowModal(false)}

                    placeholder="0.00"                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"

                  />                >

                </div>                  Cancelar

                </button>

                <div>                <button

                  <label className="block text-sm font-medium text-gray-700 mb-1">                  type="submit"

                    Total de Lecciones (opcional)                  disabled={isSubmitting}

                  </label>                  className="flex items-center gap-2 px-4 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"

                  <input                >

                    type="number"                  {isSubmitting ? (

                    min="1"                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>

                    value={formData.total_lecciones || ''}                  ) : (

                    onChange={(e) => setFormData({ ...formData, total_lecciones: e.target.value ? parseInt(e.target.value) : undefined })}                    <Save className="w-4 h-4" />

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"                  )}

                    placeholder="1"                  {isSubmitting ? 'Guardando...' : (editingCourse ? 'Actualizar' : 'Crear Curso')}

                  />                </button>

                </div>              </div>

              </div>            </form>

          </div>

              {/* Action Buttons */}        </div>

              <div className="flex justify-end gap-3 pt-4 border-t">      )}

                <button    </div>

                  type="button"  )

                  onClick={() => setShowModal(false)}}

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