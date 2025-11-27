'use client'

import { useState } from 'react'
import { X, Send, AlertCircle, CheckCircle2, Clock, FileText, Download, ExternalLink, File, Image as ImageIcon, Paperclip } from 'lucide-react'
import { StudentActivityWithSubmission } from '@/types/student-activity'
import { submitStudentActivity } from '@/actions/student/activityActions'
import FileUpload from './FileUpload'

interface SubmitActivityModalProps {
  activity: StudentActivityWithSubmission
  courseId: number
  onClose: () => void
  onSuccess: () => void
}

export default function SubmitActivityModal({ 
  activity, 
  courseId,
  onClose, 
  onSuccess 
}: SubmitActivityModalProps) {
  const [submissionText, setSubmissionText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Calcular intentos restantes
  const attemptNumber = (activity.submission?.attempt_number || 0) + 1
  const maxAttempts = activity.max_attempts || Infinity
  const attemptsRemaining = maxAttempts === Infinity ? Infinity : maxAttempts - attemptNumber + 1

  // Verificar si es entrega tardía
  const now = new Date()
  const isLate = activity.due_date ? now > activity.due_date : false

  const handleSubmit = async () => {
    if (!submissionText.trim() && files.length === 0) {
      setError('Por favor escribe un comentario o adjunta al menos un archivo')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // Crear FormData para enviar archivos
      const formData = new FormData()
      formData.append('activityId', activity.id.toString())
      formData.append('courseId', courseId.toString())
      formData.append('submissionText', submissionText.trim())
      
      // Agregar archivos al FormData
      files.forEach(file => {
        formData.append('files', file)
      })

      const result = await submitStudentActivity(formData)

      if (result.success) {
        setSuccess(result.message)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err)
      setError('Error al enviar la entrega. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-xl max-w-3xl w-full my-8 shadow-2xl">
          
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Entregar Actividad</h2>
                <p className="text-blue-100 text-sm">{activity.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-red-500 hover:scale-110 rounded-lg transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Activity Info */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-2 border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Puntos</div>
                  <div className="font-bold text-blue-600 text-lg">{activity.total_points}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Intento</div>
                  <div className="font-bold text-purple-600 text-lg">
                    {attemptNumber} / {maxAttempts === Infinity ? '∞' : maxAttempts}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Fecha límite</div>
                  <div className="font-semibold text-gray-700 text-sm">
                    {activity.due_date 
                      ? new Date(activity.due_date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Sin límite'
                    }
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Estado</div>
                  <div className={`font-semibold text-sm ${isLate ? 'text-red-600' : 'text-green-600'}`}>
                    {isLate ? 'Tardía' : 'A tiempo'}
                  </div>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {isLate && activity.allow_late && activity.late_penalty && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-yellow-800 mb-1">Entrega tardía</div>
                  <div className="text-sm text-yellow-700">
                    Se aplicará una penalización del {activity.late_penalty}% sobre tu calificación final.
                  </div>
                </div>
              </div>
            )}

            {attemptsRemaining <= 2 && attemptsRemaining !== Infinity && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-orange-800 mb-1">Intentos limitados</div>
                  <div className="text-sm text-orange-700">
                    Te quedan {attemptsRemaining} {attemptsRemaining === 1 ? 'intento' : 'intentos'}. 
                    Asegúrate de revisar tu trabajo antes de enviar.
                  </div>
                </div>
              </div>
            )}

            {/* Material del profesor (archivos adjuntos) */}
            {activity.attachments && activity.attachments.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200">
                <div className="flex items-center gap-2 font-bold text-blue-800 mb-3">
                  <Paperclip className="w-5 h-5" />
                  Material de apoyo ({activity.attachments.length} {activity.attachments.length === 1 ? 'archivo' : 'archivos'})
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Revisa estos archivos proporcionados por el profesor para completar la actividad.
                </p>
                <div className="grid gap-2">
                  {activity.attachments.map((file) => {
                    const isImage = file.file_type?.startsWith('image/')
                    const isPdf = file.file_type === 'application/pdf'
                    const formatFileSize = (bytes: number): string => {
                      if (!bytes || bytes === 0) return '0 KB'
                      const k = 1024
                      const sizes = ['Bytes', 'KB', 'MB']
                      const i = Math.floor(Math.log(bytes) / Math.log(k))
                      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
                    }
                    
                    return (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 bg-white border-2 border-blue-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all group"
                      >
                        {/* Preview para imágenes o ícono */}
                        {isImage ? (
                          <div className="w-14 h-14 relative rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                            <img
                              src={file.file_url}
                              alt={file.file_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            {isPdf ? (
                              <FileText className="w-7 h-7 text-red-600" />
                            ) : (
                              <File className="w-7 h-7 text-blue-600" />
                            )}
                          </div>
                        )}

                        {/* Info del archivo */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.file_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium uppercase">
                              {file.file_name.split('.').pop()}
                            </span>
                            {file.file_size && (
                              <span>{formatFileSize(file.file_size)}</span>
                            )}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-1">
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver archivo"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                          <a
                            href={file.file_url}
                            download={file.file_name}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Descargar"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Previous Submission Info */}
            {activity.submission && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="font-bold text-blue-800 mb-2">Entrega anterior</div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>Intento #{activity.submission.attempt_number}</div>
                  <div>Enviada: {new Date(activity.submission.submitted_at).toLocaleString('es-ES')}</div>
                  {activity.submission.score !== null && (
                    <div className="font-semibold text-blue-900">
                      Calificación: {activity.submission.score}/{activity.total_points}
                    </div>
                  )}
                  {activity.submission.feedback && (
                    <div className="mt-2 p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-xs text-blue-600 mb-1">Retroalimentación:</div>
                      <div className="text-gray-700">{activity.submission.feedback}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submission Form */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200">
              <label className="flex items-center gap-2 font-bold text-gray-800 mb-3">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                Comentario de entrega
              </label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Describe tu trabajo, explica tu proceso, o deja un comentario para el profesor..."
                disabled={isSubmitting}
                rows={6}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none text-gray-700"
              />
              <div className="text-xs text-gray-500 mt-2">
                {submissionText.length} caracteres
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <label className="flex items-center gap-2 font-bold text-gray-800 mb-3">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Archivos adjuntos
              </label>
              <FileUpload
                onFilesChange={setFiles}
                maxFiles={5}
                maxSizeMB={10}
                disabled={isSubmitting}
              />
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 text-red-800 px-5 py-4 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="font-medium">{error}</div>
              </div>
            )}

            {success && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 text-green-800 px-5 py-4 rounded-xl flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="font-medium">{success}</div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t-2 border-gray-200 px-6 py-4 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 hover:scale-105 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!submissionText.trim() && files.length === 0)}
              className="px-8 py-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-bold rounded-lg hover:scale-105 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Entrega
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
