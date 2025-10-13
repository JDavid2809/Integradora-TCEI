'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '../../../hooks/useDebounce'
import api from '../../../lib/api'
import FeedbackAlert from '../../FeedbackAlert'
import Pagination from '../../Pagination'
import { 
  FileText, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Plus,
  Eye,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Target,
  BarChart3
} from 'lucide-react'

interface Exam {
  id: number
  nombre: string
  nivel: string
  activo: boolean
  total_preguntas: number
  resultados_registrados: number
  promedio_calificaciones: number
  id_nivel: number
}

interface Question {
  descripcion: string
  ruta_file_media?: string
  respuestas: Answer[]
}

interface Answer {
  descripcion: string
  ruta_file_media?: string
  es_correcta: boolean
}

interface Level {
  id: number
  nombre: string
}

interface ExamFormData {
  nombre: string
  id_nivel: number
  preguntas: Question[]
  activo: boolean
}

export default function AdminExamsCrud() {
  const [exams, setExams] = useState<Exam[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showQuestionsModal, setShowQuestionsModal] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [viewingExam, setViewingExam] = useState<Exam | null>(null)
  const [examQuestions, setExamQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPageState] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setCurrentPage = (page: number) => {
    const safePage = typeof page === 'number' && !isNaN(page) && page > 0 ? page : 1
    setCurrentPageState(safePage)
  }

  const debouncedSearch = useDebounce(searchTerm, 400)

  const [formData, setFormData] = useState<ExamFormData>({
    nombre: '',
    id_nivel: 0,
    preguntas: [],
    activo: true
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
        ...(debouncedSearch && { search: debouncedSearch })
      })

      const data = await api<{ exams: Exam[]; total: number }>(`/api/admin/exams?${params}`)
      setExams(data.exams || [])
      const total = typeof data.total === 'number' && !isNaN(data.total) ? data.total : 0
      setTotalPages(Math.max(1, Math.ceil(total / 10)))
    } catch (error: any) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, levelFilter, statusFilter, debouncedSearch])

  const fetchLevels = async () => {
    try {
      const data = await api<Level[]>('/api/admin/system/levels')
      console.log('Levels API response:', data) // Debug log
      
      // Validar que data sea un array
      if (Array.isArray(data)) {
        setLevels(data)
      } else {
        console.error('Levels API did not return an array:', data)
        setLevels([])
      }
    } catch (error) {
      console.error('Error fetching levels:', error)
      setLevels([]) // Asegurar que siempre sea un array
    }
  }

  const fetchExamQuestions = async (examId: number) => {
    try {
      const data = await api<Question[]>(`/api/admin/exams/${examId}/questions`)
      setExamQuestions(data || [])
    } catch (error) {
      console.error('Error fetching exam questions:', error)
    }
  }

  useEffect(() => {
    fetchExams()
    fetchLevels()
  }, [fetchExams])

  const handleCreateExam = () => {
    setEditingExam(null)
    setFormData({
      nombre: '',
      id_nivel: 0,
      preguntas: [],
      activo: true
    })
    setErrors({})
    setShowModal(true)
  }

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam)
    setFormData({
      nombre: exam.nombre,
      id_nivel: exam.id_nivel,
      preguntas: [],
      activo: exam.activo
    })
    setErrors({})
    setShowModal(true)
  }

  const handleViewQuestions = async (exam: Exam) => {
    setViewingExam(exam)
    await fetchExamQuestions(exam.id)
    setShowQuestionsModal(true)
  }

  const addQuestion = () => {
    setFormData({
      ...formData,
      preguntas: [
        ...formData.preguntas,
        {
          descripcion: '',
          respuestas: [
            { descripcion: '', es_correcta: true },
            { descripcion: '', es_correcta: false },
            { descripcion: '', es_correcta: false },
            { descripcion: '', es_correcta: false }
          ]
        }
      ]
    })
  }

  const removeQuestion = (questionIndex: number) => {
    setFormData({
      ...formData,
      preguntas: formData.preguntas.filter((_, index) => index !== questionIndex)
    })
  }

  const updateQuestion = (questionIndex: number, field: string, value: string) => {
    const updatedQuestions = [...formData.preguntas]
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value
    }
    setFormData({ ...formData, preguntas: updatedQuestions })
  }

  const updateAnswer = (questionIndex: number, answerIndex: number, field: string, value: string | boolean) => {
    const updatedQuestions = [...formData.preguntas]
    updatedQuestions[questionIndex].respuestas[answerIndex] = {
      ...updatedQuestions[questionIndex].respuestas[answerIndex],
      [field]: value
    }

    // Si se marca como correcta, desmarcar las otras
    if (field === 'es_correcta' && value === true) {
      updatedQuestions[questionIndex].respuestas.forEach((answer, index) => {
        if (index !== answerIndex) {
          answer.es_correcta = false
        }
      })
    }

    setFormData({ ...formData, preguntas: updatedQuestions })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre) newErrors.nombre = 'Nombre del examen es requerido'
    if (formData.id_nivel === 0) newErrors.id_nivel = 'Debe seleccionar un nivel'
    if (formData.preguntas.length === 0) newErrors.preguntas = 'Debe agregar al menos una pregunta'

    // Validar preguntas
    formData.preguntas.forEach((pregunta, index) => {
      if (!pregunta.descripcion) {
        newErrors[`pregunta_${index}`] = `La pregunta ${index + 1} necesita descripción`
      }
      
      const hasCorrectAnswer = pregunta.respuestas.some(answer => answer.es_correcta)
      if (!hasCorrectAnswer) {
        newErrors[`pregunta_${index}_respuesta`] = `La pregunta ${index + 1} debe tener una respuesta correcta`
      }

      pregunta.respuestas.forEach((respuesta, answerIndex) => {
        if (!respuesta.descripcion) {
          newErrors[`pregunta_${index}_respuesta_${answerIndex}`] = `Respuesta ${answerIndex + 1} de la pregunta ${index + 1} necesita descripción`
        }
      })
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const url = editingExam ? `/api/admin/exams/${editingExam.id}` : '/api/admin/exams'
      const method = editingExam ? 'PUT' : 'POST'

      await api(url, {
        method,
        body: JSON.stringify(formData)
      })
      
      setSuccessMessage(editingExam ? 'Examen actualizado exitosamente' : 'Examen creado exitosamente')
      setShowModal(false)
      fetchExams()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al guardar examen'
      setErrors({ general: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteExam = async (examId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este examen?')) return

    try {
      await api(`/api/admin/exams/${examId}`, { method: 'DELETE' })
      setSuccessMessage('Examen eliminado exitosamente')
      fetchExams()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar examen'
      alert(message)
    }
  }

  const getLevelName = (levelId: number) => {
    const level = levels.find(l => l.id === levelId)
    return level ? level.nombre : 'N/A'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-[#00246a]" />
          <h1 className="text-2xl font-bold text-[#00246a]">Gestión de Exámenes</h1>
        </div>
        <button
          onClick={handleCreateExam}
          className="flex items-center gap-2 bg-[#00246a] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Examen
        </button>
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
              placeholder="Buscar por nombre de examen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            >
              <option value="ALL">Todos los niveles</option>
              {Array.isArray(levels) && levels.map(level => (
                <option key={level.id} value={level.id}>{level.nombre}</option>
              ))}
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

      {/* Exams Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00246a] mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando exámenes...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Examen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preguntas
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
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {exam.nombre}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getLevelName(exam.id_nivel)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                        {exam.total_preguntas || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-gray-400" />
                          {exam.resultados_registrados || 0} realizados
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                          {exam.promedio_calificaciones?.toFixed(1) || '0.0'} promedio
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        exam.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {exam.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewQuestions(exam)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Ver Preguntas"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditExam(exam)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
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
          <Pagination 
            page={isNaN(currentPage) ? 1 : currentPage} 
            totalPages={isNaN(totalPages) ? 1 : totalPages} 
            onChange={setCurrentPage} 
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
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

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Ej: Examen Final A1"
                  />
                  {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel *
                  </label>
                  <select
                    value={formData.id_nivel}
                    onChange={(e) => setFormData({ ...formData, id_nivel: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                      errors.id_nivel ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value={0}>Seleccionar nivel</option>
                    {Array.isArray(levels) && levels.map(level => (
                      <option key={level.id} value={level.id}>{level.nombre}</option>
                    ))}
                  </select>
                  {errors.id_nivel && <p className="mt-1 text-sm text-red-600">{errors.id_nivel}</p>}
                </div>
              </div>

              {/* Questions Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Preguntas</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Pregunta
                  </button>
                </div>

                {errors.preguntas && <p className="mb-4 text-sm text-red-600">{errors.preguntas}</p>}

                <div className="space-y-6">
                  {formData.preguntas.map((pregunta, questionIndex) => (
                    <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">Pregunta {questionIndex + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeQuestion(questionIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pregunta *
                          </label>
                          <textarea
                            value={pregunta.descripcion}
                            onChange={(e) => updateQuestion(questionIndex, 'descripcion', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                              errors[`pregunta_${questionIndex}`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            rows={2}
                            placeholder="Escriba la pregunta..."
                          />
                          {errors[`pregunta_${questionIndex}`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`pregunta_${questionIndex}`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Respuestas *
                          </label>
                          {errors[`pregunta_${questionIndex}_respuesta`] && (
                            <p className="mb-2 text-sm text-red-600">{errors[`pregunta_${questionIndex}_respuesta`]}</p>
                          )}
                          <div className="space-y-2">
                            {pregunta.respuestas.map((respuesta, answerIndex) => (
                              <div key={answerIndex} className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name={`correct_${questionIndex}`}
                                  checked={respuesta.es_correcta}
                                  onChange={() => updateAnswer(questionIndex, answerIndex, 'es_correcta', true)}
                                  className="text-green-600"
                                />
                                <input
                                  type="text"
                                  value={respuesta.descripcion}
                                  onChange={(e) => updateAnswer(questionIndex, answerIndex, 'descripcion', e.target.value)}
                                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                                    errors[`pregunta_${questionIndex}_respuesta_${answerIndex}`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  placeholder={`Respuesta ${answerIndex + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                  Examen activo
                </label>
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
                  {isSubmitting ? 'Guardando...' : (editingExam ? 'Actualizar' : 'Crear Examen')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Questions View Modal */}
      {showQuestionsModal && viewingExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00246a]">
                Preguntas: {viewingExam.nombre}
              </h2>
              <button
                onClick={() => setShowQuestionsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {examQuestions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Pregunta {index + 1}
                  </h3>
                  <p className="text-gray-700 mb-4">{question.descripcion}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-600">Respuestas:</h4>
                    {question.respuestas.map((answer, answerIndex) => (
                      <div
                        key={answerIndex}
                        className={`p-2 rounded ${
                          answer.es_correcta ? 'bg-green-100 text-green-800' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {answer.es_correcta && <CheckCircle className="w-4 h-4" />}
                          {answer.descripcion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}