'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Exam {
  id: number
  nombre: string
  nivel: string
  activo: boolean
  total_preguntas: number
  resultados_registrados: number
  promedio_calificaciones: number
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

interface ExamFormData {
  nombre: string
  id_nivel: string
  preguntas: Question[]
}

interface Level {
  id: number
  nombre: string
}

export default function AdminExamsPage() {
  const { data: session } = useSession()
  const [exams, setExams] = useState<Exam[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [formData, setFormData] = useState<ExamFormData>({
    nombre: '',
    id_nivel: '',
    preguntas: []
  })

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    descripcion: '',
    ruta_file_media: '',
    respuestas: [
      { descripcion: '', es_correcta: false },
      { descripcion: '', es_correcta: false },
      { descripcion: '', es_correcta: false },
      { descripcion: '', es_correcta: false }
    ]
  })

  useEffect(() => {
    fetchExams()
    fetchLevels()
  }, [])

  const fetchExams = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/exams')
      if (response.ok) {
        const data = await response.json()
        setExams(data.exams)
      }
    } catch (error) {
      console.error('Error al cargar exámenes:', error)
    } finally {
      setLoading(false)
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

  const addQuestion = () => {
    // Validar que la pregunta actual esté completa
    if (!currentQuestion.descripcion.trim()) {
      alert('La descripción de la pregunta es requerida')
      return
    }

    const filledAnswers = currentQuestion.respuestas.filter(ans => ans.descripcion.trim())
    if (filledAnswers.length < 2) {
      alert('Se requieren al menos 2 respuestas')
      return
    }

    const hasCorrectAnswer = currentQuestion.respuestas.some(ans => ans.es_correcta)
    if (!hasCorrectAnswer) {
      alert('Debe marcar al menos una respuesta como correcta')
      return
    }

    setFormData({
      ...formData,
      preguntas: [...formData.preguntas, { ...currentQuestion, respuestas: filledAnswers }]
    })

    // Reset current question
    setCurrentQuestion({
      descripcion: '',
      ruta_file_media: '',
      respuestas: [
        { descripcion: '', es_correcta: false },
        { descripcion: '', es_correcta: false },
        { descripcion: '', es_correcta: false },
        { descripcion: '', es_correcta: false }
      ]
    })
  }

  const removeQuestion = (index: number) => {
    const newQuestions = formData.preguntas.filter((_, i) => i !== index)
    setFormData({ ...formData, preguntas: newQuestions })
  }

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.preguntas.length === 0) {
      alert('Debe agregar al menos una pregunta')
      return
    }

    try {
      const response = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Examen creado exitosamente')
        setShowCreateForm(false)
        setFormData({
          nombre: '',
          id_nivel: '',
          preguntas: []
        })
        fetchExams()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al crear examen:', error)
      alert('Error al crear examen')
    }
  }

  const handleDeleteExam = async (examId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este examen?')) return

    try {
      const response = await fetch(`/api/admin/exams/${examId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Examen eliminado exitosamente')
        fetchExams()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al eliminar examen:', error)
      alert('Error al eliminar examen')
    }
  }

  if (!session || session.user?.rol !== 'ADMIN') {
    return <div>No autorizado</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#00246a]">Gestión de Exámenes</h1>
        <button
          onClick={() => {
            setShowCreateForm(true)
            setFormData({
              nombre: '',
              id_nivel: '',
              preguntas: []
            })
          }}
          className="bg-[#00246a] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Crear Examen
        </button>
      </div>

      {/* Lista de exámenes */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00246a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando exámenes...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
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
                    Resultados
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
                {exams.map(exam => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {exam.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {exam.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.nivel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.total_preguntas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {exam.resultados_registrados} tomados
                      </div>
                      <div className="text-gray-500">
                        Promedio: {exam.promedio_calificaciones.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        exam.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {exam.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
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

      {/* Modal de crear examen */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00246a]">
                Crear Nuevo Examen
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-6">
              {/* Información básica del examen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Examen *
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
                    Nivel
                  </label>
                  <select
                    value={formData.id_nivel}
                    onChange={(e) => setFormData({ ...formData, id_nivel: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  >
                    <option value="">Seleccionar nivel</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sección de preguntas agregadas */}
              {formData.preguntas.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Preguntas del Examen ({formData.preguntas.length})
                  </h3>
                  <div className="space-y-3">
                    {formData.preguntas.map((pregunta, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {index + 1}. {pregunta.descripcion}
                            </h4>
                            <div className="mt-2 space-y-1">
                              {pregunta.respuestas.map((respuesta, rIndex) => (
                                <div key={rIndex} className={`text-sm ${respuesta.es_correcta ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                  {respuesta.es_correcta ? '✓' : '○'} {respuesta.descripcion}
                                </div>
                              ))}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="text-red-600 hover:text-red-800 ml-4"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulario para agregar nueva pregunta */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Agregar Nueva Pregunta
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pregunta *
                    </label>
                    <textarea
                      value={currentQuestion.descripcion}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, descripcion: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                      rows={3}
                      placeholder="Escriba la pregunta aquí..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Respuestas (marque la(s) correcta(s))
                    </label>
                    {currentQuestion.respuestas.map((respuesta, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={respuesta.es_correcta}
                          onChange={(e) => {
                            const newRespuestas = [...currentQuestion.respuestas]
                            newRespuestas[index].es_correcta = e.target.checked
                            setCurrentQuestion({ ...currentQuestion, respuestas: newRespuestas })
                          }}
                          className="h-4 w-4 text-[#00246a] focus:ring-[#00246a] border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={respuesta.descripcion}
                          onChange={(e) => {
                            const newRespuestas = [...currentQuestion.respuestas]
                            newRespuestas[index].descripcion = e.target.value
                            setCurrentQuestion({ ...currentQuestion, respuestas: newRespuestas })
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                          placeholder={`Opción ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addQuestion}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Agregar Pregunta
                  </button>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
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
                  disabled={formData.preguntas.length === 0}
                >
                  Crear Examen ({formData.preguntas.length} preguntas)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
