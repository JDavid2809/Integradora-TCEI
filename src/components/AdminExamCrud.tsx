'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Target,
  BarChart3
} from 'lucide-react'

// --- Declaraciones de tipos ---
interface Exam {
  id_examen: number;
  nombre: string;
  b_activo: boolean;
  id_nivel: number | null;
  nivel?: {
    id_nivel: number;
    nombre: string;
  };
  _count?: {
    pregunta: number;
    resultado_examen: number;
  };
}
interface Level {
  id_nivel: number;
  nombre: string;
  b_activo: boolean;
}

interface Answer {
  id_respuesta: number;
  descripcion: string;
  es_correcta: boolean;
  ruta_file_media: string | null;
}

interface Question {
  id_pregunta: number;
  descripcion: string;
  ruta_file_media: string | null;
  respuesta: Answer[];
}

interface ExamFormData {
  nombre: string;
  id_nivel: number | null;
  b_activo: boolean;
}

interface QuestionAnswerFormData {
  descripcion: string;
  es_correcta: boolean;
  ruta_file_media: string;
}

interface QuestionFormData {
  descripcion: string;
  ruta_file_media: string;
  respuestas: QuestionAnswerFormData[];
}


export default function AdminExamCrud() {
  const [exams, setExams] = useState<Exam[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showQuestionsModal, setShowQuestionsModal] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<ExamFormData>({
    nombre: '',
    id_nivel: null,
    b_activo: true
  })

  const [questionFormData, setQuestionFormData] = useState<QuestionFormData>({
    descripcion: '',
    ruta_file_media: '',
    respuestas: [
      { descripcion: '', es_correcta: false, ruta_file_media: '' },
      { descripcion: '', es_correcta: false, ruta_file_media: '' },
      { descripcion: '', es_correcta: false, ruta_file_media: '' },
      { descripcion: '', es_correcta: false, ruta_file_media: '' },
    ],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(levelFilter !== 'ALL' && { nivel: levelFilter }),
        ...(statusFilter !== 'ALL' && { activo: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/exams?${params}`)
      const data = await response.json()

      if (response.ok) {
        setExams(data.exams)
        setTotalPages(Math.ceil(data.total / 10))
      } else {
        console.error('Error fetching exams:', data.error)
      }
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, levelFilter, statusFilter, searchTerm])

  useEffect(() => {
    fetchExams()
    fetchLevels()
  }, [fetchExams])

  const fetchLevels = async () => {
    try {
      const response = await fetch('/api/admin/system/levels')
      const data = await response.json()
      if (response.ok) {
        setLevels(data.levels)
      }
    } catch (error) {
      console.error('Error fetching levels:', error)
    }
  }

  const fetchQuestions = async (examId: number) => {
    try {
      const response = await fetch(`/api/admin/exams/${examId}/questions`)
      const data = await response.json()
      if (response.ok) {
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const handleCreateExam = () => {
    setEditingExam(null)
    setFormData({
      nombre: '',
      id_nivel: null,
      b_activo: true
    })
    setErrors({})
    setShowModal(true)
  }

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam)
    setFormData({
      nombre: exam.nombre,
      id_nivel: exam.id_nivel,
      b_activo: exam.b_activo
    })
    setErrors({})
    setShowModal(true)
  }

  const handleViewQuestions = (exam: Exam) => {
    setSelectedExam(exam)
    fetchQuestions(exam.id_examen)
    setShowQuestionsModal(true)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre) newErrors.nombre = 'Nombre del examen es requerido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateQuestionForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!questionFormData.descripcion) newErrors.descripcion = 'Descripción de la pregunta es requerida'
    
    const validAnswers = questionFormData.respuestas.filter(r => r.descripcion.trim() !== '')
    if (validAnswers.length < 2) {
      newErrors.respuestas = 'Debe tener al menos 2 respuestas';
    }
  const correctAnswers = validAnswers.filter((r: QuestionAnswerFormData) => r.es_correcta);
    if (correctAnswers.length === 0) {
      newErrors.correcta = 'Debe marcar al menos una respuesta como correcta';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const url = editingExam ? `/api/admin/exams/${editingExam.id_examen}` : '/api/admin/exams'
      const method = editingExam ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage(editingExam ? 'Examen actualizado exitosamente' : 'Examen creado exitosamente')
        setShowModal(false)
        fetchExams()
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrors({ general: data.error || 'Error al guardar examen' })
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión: ' + error })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitQuestion = async () => {
    if (!validateQuestionForm() || !selectedExam) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/exams/${selectedExam.id_examen}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionFormData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage('Pregunta agregada exitosamente')
        fetchQuestions(selectedExam.id_examen)
        setQuestionFormData({
          descripcion: '',
          ruta_file_media: '',
          respuestas: [
            { descripcion: '', es_correcta: true, ruta_file_media: '' },
            { descripcion: '', es_correcta: false, ruta_file_media: '' },
            { descripcion: '', es_correcta: false, ruta_file_media: '' },
            { descripcion: '', es_correcta: false, ruta_file_media: '' }
          ]
        })
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrors({ general: data.error || 'Error al agregar pregunta' })
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión: ' + error })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteExam = async (examId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este examen?')) return

    try {
      const response = await fetch(`/api/admin/exams/${examId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccessMessage('Examen eliminado exitosamente')
        fetchExams()
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar examen')
      }
    } catch (error) {
      alert('Error de conexión: ' + error)
    }
  }

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta pregunta?') || !selectedExam) return

    try {
      const response = await fetch(`/api/admin/exams/${selectedExam.id_examen}/questions/${questionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccessMessage('Pregunta eliminada exitosamente')
        fetchQuestions(selectedExam.id_examen)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        alert('Error al eliminar pregunta')
      }
    } catch (error) {
      alert('Error de conexión: ' + error)
    }
  }

  const updateAnswer = (index: number, field: keyof typeof questionFormData.respuestas[0], value: string | boolean) => {
    const newRespuestas = [...questionFormData.respuestas]
    newRespuestas[index] = { ...newRespuestas[index], [field]: value }
    
    // Si se marca una respuesta como correcta, desmarcar las demás (para single choice)
    if (field === 'es_correcta' && value === true) {
      newRespuestas.forEach((resp, i) => {
        if (i !== index) resp.es_correcta = false
      })
    }
    
    setQuestionFormData({ ...questionFormData, respuestas: newRespuestas })
  }

  // --- Place all other handlers, helpers, and state here ---
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Add stubs for missing functions if not already present
  const fetchExams = async () => {};
  const fetchQuestions = async (id: number) => {};
  const validateForm = () => true;
  // Handlers faltantes para evitar errores de compilación
  const handleViewQuestions = (exam: Exam) => {};
  const handleEditExam = (exam: Exam) => {};
  // validateQuestionForm ya está definida arriba

  // --- End helpers ---

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-[#00246a]" />
          <h1 className="text-2xl font-bold text-[#00246a]">Gestión de Exámenes</h1>
        </div>
        {/* Botón de crear examen removido para Admin: solo lectura/edición/eliminación */}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Modal de edición solo para exámenes existentes (no creación) */}
      {showModal && editingExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00246a]">
                Editar Examen
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Examen *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Examen de Inglés A1"
                />
                {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel
                </label>
                <select
                  value={formData.id_nivel || ''}
                  onChange={(e) => setFormData({ ...formData, id_nivel: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                >
                  <option value="">Sin nivel específico</option>
                  {levels.map(level => (
                    <option key={level.id_nivel} value={level.id_nivel}>
                      {level.nombre}
                    </option>
                  ))}
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
                  {isSubmitting ? 'Guardando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de exámenes */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-[#00246a] mb-2">
                Exámenes
              </h2>
              <p className="text-sm text-gray-500">
                Administra los exámenes disponibles, edita su contenido o elimina aquellos que ya no sean necesarios.
              </p>
            </div>
            {/* Botón de crear examen removido para Admin: solo lectura/edición/eliminación */}
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex-1 min-w-0 mb-3 sm:mb-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar Exámenes
              </label>
              <div className="flex rounded-md shadow-sm">
                <div className="relative flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:ring-2 focus:ring-[#00246a] focus:border-transparent sm:text-sm"
                  placeholder="Buscar por nombre de examen"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-0 sm:flex-nowrap">
              <div className="min-w-[120px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por Nivel
                </label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#00246a] focus:border-transparent sm:text-sm"
                >
                  <option value="ALL">Todos los niveles</option>
                  {levels.map(level => (
                    <option key={level.id_nivel} value={level.id_nivel}>
                      {level.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-[120px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#00246a] focus:border-transparent sm:text-sm"
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de datos */}
          {loading ? (
            <div className="py-4 text-center">
              <p className="text-sm text-gray-500">Cargando exámenes...</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre del Examen
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nivel
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exams.filter(exam => {
                    const matchesSearch = exam.nombre.toLowerCase().includes(searchTerm.toLowerCase())
                    const matchesLevel = levelFilter === 'ALL' || (exam.id_nivel && exam.id_nivel.toString() === levelFilter)
                    const matchesStatus = statusFilter === 'ALL' || exam.b_activo.toString() === statusFilter
                    return matchesSearch && matchesLevel && matchesStatus
                  }).map(exam => (
                    <tr key={exam.id_examen}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {exam.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exam.nivel ? exam.nivel.nombre : 'Sin nivel específico'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          exam.b_activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {exam.b_activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewQuestions(exam)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Ver preguntas"
                          >
                            <HelpCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditExam(exam)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id_examen)}
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
          {!loading && totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Página <span className="font-medium">{currentPage}</span> de{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00246a]">
                {editingExam ? 'Editar Examen' : 'Crear Nuevo Examen'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Examen *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Examen de Inglés A1"
                />
                {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel
                </label>
                <select
                  value={formData.id_nivel || ''}
                  onChange={(e) => setFormData({ ...formData, id_nivel: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                >
                  <option value="">Sin nivel específico</option>
                  {levels.map(level => (
                    <option key={level.id_nivel} value={level.id_nivel}>
                      {level.nombre}
                    </option>
                  ))}
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
                  {isSubmitting ? 'Guardando...' : (editingExam ? 'Actualizar' : 'Crear Examen')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Questions Modal */}
      {showQuestionsModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00246a]">
                Preguntas - {selectedExam.nombre}
              </h2>
              <button
                onClick={() => setShowQuestionsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Add Question Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Agregar Nueva Pregunta</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pregunta *
                  </label>
                  <textarea
                    value={questionFormData.descripcion}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, descripcion: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                      errors.descripcion ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={3}
                    placeholder="Escribe la pregunta aquí..."
                  />
                  {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Respuestas
                  </label>
                  {errors.respuestas && <p className="mb-2 text-sm text-red-600">{errors.respuestas}</p>}
                  {errors.correcta && <p className="mb-2 text-sm text-red-600">{errors.correcta}</p>}
                  
                  <div className="space-y-2">
                    {questionFormData.respuestas.map((respuesta: QuestionAnswerFormData, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={respuesta.es_correcta}
                          onChange={(e) => updateAnswer(index, 'es_correcta', e.target.checked)}
                          className="text-[#00246a] focus:ring-[#00246a]"
                        />
                        <input
                          type="text"
                          value={respuesta.descripcion}
                          onChange={(e) => updateAnswer(index, 'descripcion', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                          placeholder={`Opción ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitQuestion}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {isSubmitting ? 'Agregando...' : 'Agregar Pregunta'}
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Preguntas del Examen ({questions.length})
              </h3>
              
              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay preguntas en este examen</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.id_pregunta} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">
                          Pregunta {index + 1}
                        </h4>
                        <button
                          onClick={() => handleDeleteQuestion(question.id_pregunta)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Eliminar pregunta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{question.descripcion}</p>
                      
                      <div className="space-y-1">
                        {question.respuesta.map((answer) => (
                          <div key={answer.id_respuesta} className={`flex items-center gap-2 p-2 rounded ${
                            answer.es_correcta ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              answer.es_correcta ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span className="text-sm">{answer.descripcion}</span>
                            {answer.es_correcta && (
                              <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
