'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Save,
  Calendar,
  FileText,
  Hash,
  RefreshCw,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react'
import {
  CreateActivityInput,
  UpdateActivityInput,
  CourseActivityWithDetails,
  ActivityTypeConfig
} from '@/types/course-activity'
import {
  createActivity,
  updateActivity,
  getActivityDetails
} from '@/actions/teacher/activityActions'

interface ActivityFormModalProps {
  courseId: number
  teacherId: number
  activityId?: number | null
  onClose: () => void
  onSuccess: () => void
}

export default function ActivityFormModal({
  courseId,
  teacherId,
  activityId,
  onClose,
  onSuccess
}: ActivityFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_type: 'ASSIGNMENT',
    instructions: '',
    due_date: '',
    total_points: 100,
    passing_score: 60,
    max_attempts: 1,
    allow_late_submissions: false,
    is_published: false
  })

  // Cargar datos si es edición
  useEffect(() => {
    if (activityId) {
      loadActivityData()
    }
  }, [activityId])

  const loadActivityData = async () => {
    if (!activityId) return

    try {
      setIsLoading(true)
      const activity = await getActivityDetails(activityId, teacherId)

      setFormData({
        title: activity.title,
        description: activity.description || '',
        activity_type: activity.activity_type,
        instructions: activity.instructions || '',
        due_date: activity.due_date
          ? new Date(activity.due_date).toISOString().slice(0, 16)
          : '',
        total_points: activity.total_points,
        passing_score: activity.min_passing_score || 60,
        max_attempts: activity.max_attempts || 1,
        allow_late_submissions: activity.allow_late,
        is_published: activity.is_published
      })
    } catch (error) {
      console.error('Error loading activity:', error)
      setError('Error al cargar la actividad')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      // Validaciones
      if (!formData.title.trim()) {
        throw new Error('El título es requerido')
      }
      if (formData.total_points < 1) {
        throw new Error('Los puntos deben ser mayor a 0')
      }
      if (formData.passing_score < 0 || formData.passing_score > 100) {
        throw new Error('El puntaje mínimo debe estar entre 0 y 100')
      }
      if (formData.max_attempts < 1) {
        throw new Error('Debe permitir al menos 1 intento')
      }

      if (activityId) {
        // Actualizar
        const updateData: UpdateActivityInput = {
          title: formData.title,
          description: formData.description || null,
          activity_type: formData.activity_type as any,
          instructions: formData.instructions || null,
          due_date: formData.due_date ? new Date(formData.due_date) : null,
          total_points: formData.total_points,
          min_passing_score: formData.passing_score,
          max_attempts: formData.max_attempts,
          allow_late: formData.allow_late_submissions,
          is_published: formData.is_published
        }

        const result = await updateActivity(activityId, updateData, teacherId)
        if (!result.success) {
          throw new Error(result.message || 'Error al actualizar')
        }
      } else {
        // Crear
        const createData: CreateActivityInput = {
          course_id: courseId,
          title: formData.title,
          description: formData.description || null,
          activity_type: formData.activity_type as any,
          instructions: formData.instructions || null,
          due_date: formData.due_date ? new Date(formData.due_date) : null,
          total_points: formData.total_points,
          min_passing_score: formData.passing_score,
          max_attempts: formData.max_attempts,
          allow_late: formData.allow_late_submissions,
          is_published: formData.is_published, // IMPORTANTE: Este campo determina visibilidad
          created_by: teacherId
        }

        const result = await createActivity(createData)
        if (!result.success) {
          throw new Error(result.message || 'Error al crear')
        }
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-[#00246a]" />
          <p className="text-gray-700 font-semibold">Cargando actividad...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-900/60 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border-2 border-blue-100 my-8 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {activityId ? 'Editar Actividad' : 'Nueva Actividad'}
              </h2>
              <p className="text-sm text-blue-50 mt-0.5">
                Complete la información de la actividad
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="group p-2.5 hover:bg-red-500 rounded-xl transition-all duration-200 hover:scale-110"
            disabled={isSaving}
            title="Cerrar"
          >
            <X className="w-6 h-6 text-white group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className={`mx-6 mt-6 p-4 border-2 rounded-xl flex items-start gap-3 shadow-md ${
            formData.is_published
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
              : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              formData.is_published ? 'bg-green-500' : 'bg-yellow-500'
            }`}>
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className={`font-bold text-sm ${formData.is_published ? 'text-green-800' : 'text-yellow-800'}`}>
                ¡Actividad {activityId ? 'actualizada' : 'creada'} exitosamente!
              </p>
              {formData.is_published ? (
                <p className="text-sm text-green-700 mt-1">
                  La actividad está <strong>publicada y visible</strong> para todos los estudiantes del curso.
                </p>
              ) : (
                <div className="text-sm text-yellow-800 mt-1 space-y-1">
                  <p>La actividad se guardó como <strong>borrador</strong>.</p>
                  <p className="text-xs">Los estudiantes NO pueden verla todavía. Publícala desde la lista de actividades cuando esté lista.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl flex items-start gap-3 shadow-md">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-red-800 text-sm">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200 shadow-sm">
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Información Básica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Título */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Título *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Tarea 1: Presente Simple"
                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 text-base font-medium transition-all duration-200 shadow-sm hover:border-blue-300 hover:shadow-md"
                />
              </div>

              {/* Tipo de actividad */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Tipo de Actividad *
                </label>
                <select
                  name="activity_type"
                  value={formData.activity_type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base font-medium transition-all duration-200 shadow-sm hover:border-blue-300 hover:shadow-md appearance-none cursor-pointer"
                >
                  {Object.entries(ActivityTypeConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha límite */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Fecha Límite
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5 pointer-events-none" />
                  <input
                    type="datetime-local"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base font-medium transition-all duration-200 shadow-sm hover:border-blue-300 hover:shadow-md"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                  Descripción Breve
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Descripción corta de la actividad..."
                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 resize-none text-base font-medium transition-all duration-200 shadow-sm hover:border-blue-300 hover:shadow-md"
                />
              </div>

              {/* Instrucciones */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  Instrucciones Detalladas
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Instrucciones completas para la actividad..."
                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 resize-none text-base font-medium transition-all duration-200 shadow-sm hover:border-blue-300 hover:shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Configuración de puntuación */}
          <div className="space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200 shadow-sm">
            <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Hash className="w-5 h-5 text-white" />
              </div>
              Puntuación y Configuración
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Puntos totales */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                  Puntos Totales *
                </label>
                <input
                  type="number"
                  name="total_points"
                  value={formData.total_points}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base font-medium transition-all duration-200 shadow-sm hover:border-purple-300 hover:shadow-md"
                />
              </div>

              {/* Puntaje mínimo */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-2">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                  Puntaje Mínimo (%)
                </label>
                <input
                  type="number"
                  name="passing_score"
                  value={formData.passing_score}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base font-medium transition-all duration-200 shadow-sm hover:border-purple-300 hover:shadow-md"
                />
              </div>

              {/* Intentos máximos */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-gray-800 mb-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Intentos Máximos
                </label>
                <input
                  type="number"
                  name="max_attempts"
                  value={formData.max_attempts}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base font-medium transition-all duration-200 shadow-sm hover:border-purple-300 hover:shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Opciones adicionales */}
          <div className="space-y-4 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200 shadow-sm">
            <h3 className="text-lg font-bold text-green-900 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              Opciones
            </h3>

            <div className="space-y-3">
              {/* Permitir entregas tardías */}
              <label className="flex items-start gap-3 cursor-pointer p-4 bg-white border-2 border-green-200 rounded-xl hover:bg-green-50 hover:border-green-400 hover:shadow-md transition-all duration-200 shadow-sm group">
                <input
                  type="checkbox"
                  name="allow_late_submissions"
                  checked={formData.allow_late_submissions}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 text-green-600 border-2 border-green-300 rounded-md focus:ring-2 focus:ring-green-500 cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-green-900">Permitir Entregas Tardías</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Los estudiantes podrán enviar después de la fecha límite
                  </p>
                </div>
              </label>

              {/* Publicar */}
              <label className={`flex items-start gap-3 cursor-pointer p-4 border-2 rounded-xl transition-all duration-200 shadow-sm group ${
                formData.is_published 
                  ? 'bg-green-50 border-green-300 hover:bg-green-100 hover:border-green-400' 
                  : 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100 hover:border-yellow-400'
              }`}>
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 text-green-600 border-2 border-green-300 rounded-md focus:ring-2 focus:ring-green-500 cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold flex items-center gap-2">
                    {formData.is_published ? (
                      <>
                        <Eye className="w-4 h-4 text-green-600" />
                        <span className="text-green-900">Actividad Publicada</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 text-yellow-600" />
                        <span className="text-yellow-900">Mantener como Borrador</span>
                      </>
                    )}
                  </p>
                  <p className={`text-xs mt-1 font-medium ${
                    formData.is_published ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {formData.is_published
                      ? 'Los estudiantes PUEDEN ver y trabajar en esta actividad'
                      : 'La actividad NO será visible para los estudiantes'}
                  </p>
                </div>
              </label>

              {/* Warning si no está publicada */}
              {!formData.is_published && (
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-700 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-bold text-yellow-900 mb-1">Actividad en modo borrador</p>
                    <p className="text-yellow-800">
                      Esta actividad se guardará pero <strong>NO será visible para los estudiantes</strong> hasta que la publiques. 
                      Marca la casilla "Publicar Actividad" si quieres que esté disponible ahora.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-3.5 text-base font-bold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300 rounded-xl hover:from-gray-200 hover:to-gray-300 hover:border-gray-400 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:scale-105"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving || success}
              className="flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  ¡Guardado!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {activityId ? 'Actualizar' : 'Crear'} Actividad
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  )
}
