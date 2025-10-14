'use client'

import React, { useState } from 'react'
import {
  X,
  Save,
  User,
  Calendar,
  FileText,
  Award,
  MessageSquare,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Send
} from 'lucide-react'
import { ActivitySubmissionWithDetails, SubmissionStatusConfig } from '@/types/course-activity'
import { gradeSubmission } from '@/actions/teacher/activityActions'

interface GradeSubmissionModalProps {
  submission: ActivitySubmissionWithDetails
  teacherId: number
  totalPoints: number
  onClose: () => void
  onSuccess: () => void
}

export default function GradeSubmissionModal({
  submission,
  teacherId,
  totalPoints,
  onClose,
  onSuccess
}: GradeSubmissionModalProps) {
  const [score, setScore] = useState<number>(submission.score || 0)
  const [feedback, setFeedback] = useState<string>(submission.feedback || '')
  const [status, setStatus] = useState<string>(submission.status)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      // Validaciones
      if (score < 0 || score > totalPoints) {
        throw new Error(`La puntuación debe estar entre 0 y ${totalPoints}`)
      }

      const result = await gradeSubmission(
        submission.id,
        {
          score,
          feedback: feedback.trim() || null,
          status: status as any
        },
        teacherId
      )

      if (!result.success) {
        throw new Error(result.message || 'Error al calificar')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const percentage = ((score / totalPoints) * 100).toFixed(0)
  const statusConfig = SubmissionStatusConfig[submission.status]

  return (
    <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-gray-200 my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#00246a] to-blue-700 rounded-t-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Calificar Entrega</h2>
              <p className="text-xs sm:text-sm text-blue-100">
                {submission.student.usuario.nombre} {submission.student.usuario.apellido}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">Calificación guardada exitosamente</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Información del estudiante */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#00246a]" />
              Información del Estudiante
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Nombre</p>
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  {submission.student.usuario.nombre} {submission.student.usuario.apellido}
                </p>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Email</p>
                <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                  {submission.student.usuario.email}
                </p>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Fecha de Envío</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-sm sm:text-base font-medium text-gray-900">
                    {submission.submitted_at ? formatDate(submission.submitted_at) : 'No enviada'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Estado Actual</p>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-700`}
                >
                  {statusConfig.label}
                </span>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Número de Intento</p>
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  Intento #{submission.attempt_number}
                </p>
              </div>

              {submission.graded_at && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Última Calificación</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {formatDate(submission.graded_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contenido de la entrega */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#00246a]" />
              Contenido de la Entrega
            </h3>

            {submission.submission_text ? (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">
                  {submission.submission_text}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                El estudiante no incluyó texto en su entrega
              </p>
            )}

            {/* Archivos adjuntos */}
            {submission.files && submission.files.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Archivos Adjuntos ({submission.files.length})
                </p>
                <div className="space-y-2">
                  {submission.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.file_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Subido: {formatDate(file.uploaded_at)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[#00246a] hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Descargar</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Formulario de calificación */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#00246a]" />
                Calificación
              </h3>

              <div className="space-y-4">
                {/* Puntuación */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Puntuación *
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                      min="0"
                      max={totalPoints}
                      step="0.5"
                      required
                      className="flex-1 px-4 py-3 text-lg sm:text-xl font-bold bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00246a] focus:border-[#00246a] text-gray-900 transition-all duration-200 shadow-sm hover:border-gray-400"
                    />
                    <div className="text-center">
                      <p className="text-sm text-gray-600 font-medium">de</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalPoints}</p>
                    </div>
                  </div>

                  {/* Porcentaje visual */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Porcentaje</span>
                      <span className="text-lg font-bold text-[#00246a]">{percentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          parseInt(percentage) >= 70
                            ? 'bg-green-500'
                            : parseInt(percentage) >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(parseInt(percentage), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Estado de la Entrega *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00246a] focus:border-[#00246a] text-gray-900 text-sm sm:text-base font-medium transition-all duration-200 shadow-sm hover:border-gray-400 appearance-none cursor-pointer"
                  >
                    <option value="GRADED">Calificada</option>
                    <option value="RETURNED">Devuelta (requiere correcciones)</option>
                    <option value="SUBMITTED">Enviada (sin calificar)</option>
                  </select>
                </div>

                {/* Retroalimentación */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    Retroalimentación
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    placeholder="Escribe comentarios para el estudiante..."
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00246a] focus:border-[#00246a] text-gray-900 placeholder-gray-500 resize-none text-sm sm:text-base font-medium transition-all duration-200 shadow-sm hover:border-gray-400"
                  />
                  <p className="mt-2 text-xs text-gray-600 font-medium">
                    Proporciona comentarios constructivos para ayudar al estudiante a mejorar
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200/50">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 border-2 border-gray-300 rounded-xl hover:bg-gray-200 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving || success}
                className="flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-gradient-to-r from-[#00246a] to-blue-700 text-white rounded-xl hover:from-[#001a4f] hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Guardado
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Guardar Calificación
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  )
}
