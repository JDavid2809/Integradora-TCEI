'use client'

import { useState } from 'react'
import { FileText, Calendar, Award, Clock, CheckCircle2, XCircle, AlertCircle, Send } from 'lucide-react'
import { StudentActivityWithSubmission } from '@/types/student-activity'
import { ActivityTypeConfig } from '@/types/course-activity'
import SubmitActivityModal from './SubmitActivityModal'

interface StudentActivityCardProps {
  activity: StudentActivityWithSubmission
  courseId: number
  onSubmitSuccess: () => void
  viewMode: 'grid' | 'list'
}

export default function StudentActivityCard({ activity, courseId, onSubmitSuccess, viewMode }: StudentActivityCardProps) {
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  
  const typeConfig = ActivityTypeConfig[activity.activity_type]
  
  // Colores sólidos para tipos de actividad (siguiendo el patrón del profesor)
  const getActivityColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-sky-400'
      case 'purple': return 'bg-purple-400'
      case 'green': return 'bg-emerald-400'
      case 'orange': return 'bg-orange-400'
      case 'red': return 'bg-rose-400'
      case 'yellow': return 'bg-amber-400'
      case 'indigo': return 'bg-indigo-400'
      case 'pink': return 'bg-pink-400'
      default: return 'bg-sky-400'
    }
  }

  const activityColor = getActivityColor(typeConfig.color)

  // Estado de la entrega
  const submission = activity.submission
  const hasSubmission = !!submission
  const isGraded = submission?.status === 'GRADED'
  const isPassed = isGraded && submission.score !== null && activity.min_passing_score !== null 
    ? submission.score >= activity.min_passing_score 
    : null

  // Fecha límite
  const now = new Date()
  const dueDate = activity.due_date ? new Date(activity.due_date) : null
  const isOverdue = dueDate ? now > dueDate : false
  const canSubmit = !isOverdue || activity.allow_late

  // Días restantes
  const daysRemaining = dueDate 
    ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Vista de tarjetas (Grid)
  if (viewMode === 'grid') {
    return (
      <>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
          
          {/* Header con color del tipo de actividad */}
          <div className={`h-24 relative ${activityColor}`}>
            {/* Pattern decorativo */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`grid-student-${activity.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-student-${activity.id})`} />
            </svg>

            {/* Badge flotante con icono */}
            <div className="absolute -bottom-6 left-6">
              <div className="w-12 h-12 bg-white rounded-full shadow-lg border-4 border-white">
                <div className={`w-full h-full rounded-full ${activityColor} flex items-center justify-center`}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Status Badge en la esquina superior derecha */}
            {hasSubmission && (
              <div className="absolute top-3 right-3">
                {isGraded ? (
                  isPassed ? (
                    <div className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aprobado
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                      <XCircle className="w-3.5 h-3.5" />
                      Reprobado
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                    <Clock className="w-3.5 h-3.5" />
                    Pendiente
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 pt-8 space-y-4">
            
            {/* Título y badge de tipo */}
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{activity.title}</h3>
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700`}>
                {typeConfig.label}
              </span>
            </div>

            {/* Description */}
            {activity.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {activity.description}
              </p>
            )}

            {/* Estado y fecha */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Calendar className="w-3.5 h-3.5" />
                {dueDate 
                  ? dueDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'Sin límite'
                }
              </span>
              
              {!hasSubmission && !isOverdue && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pendiente
                </span>
              )}
            </div>

            {/* Mini-cards de estadísticas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <Award className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-600">
                  {isGraded && submission?.score !== null 
                    ? submission.score
                    : activity.total_points
                  }
                </p>
                <p className="text-xs text-blue-700">
                  {isGraded ? 'Obtenidos' : 'Puntos'}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-purple-600">
                  {hasSubmission ? submission.attempt_number : 0}
                </p>
                <p className="text-xs text-purple-700">Intentos</p>
              </div>

              <div className="bg-green-50 rounded-lg p-3 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-600">
                  {activity.max_attempts || '∞'}
                </p>
                <p className="text-xs text-green-700">Máximo</p>
              </div>
            </div>

            {/* Warning messages */}
            {!hasSubmission && isOverdue && !activity.allow_late && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-red-700">
                  <span className="font-bold">Fecha expirada.</span> No se aceptan entregas tardías.
                </div>
              </div>
            )}

            {!hasSubmission && daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-700">
                  <span className="font-bold">¡Próximo a vencer!</span> Te quedan {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}.
                </div>
              </div>
            )}

            {/* Submission info */}
            {hasSubmission && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Tu entrega</span>
                  <span className="text-xs text-gray-500">
                    Intento #{submission.attempt_number}
                  </span>
                </div>
                
                {submission.submission_text && (
                  <p className="text-sm text-gray-700 line-clamp-2 italic">
                    "{submission.submission_text}"
                  </p>
                )}

                <div className="text-xs text-gray-500">
                  Enviado: {new Date(submission.submitted_at).toLocaleString('es-ES')}
                </div>

                {isGraded && submission.feedback && (
                  <div className="pt-2 border-t border-gray-300">
                    <div className="text-xs font-medium text-gray-600 mb-1">Retroalimentación:</div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {submission.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer con botón de acción */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={!canSubmit}
              className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                canSubmit
                  ? hasSubmission
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
              {hasSubmission ? 'Reenviar Actividad' : 'Entregar Actividad'}
            </button>
          </div>
        </div>

        {/* Submit Modal */}
        {showSubmitModal && (
          <SubmitActivityModal
            activity={activity}
            courseId={courseId}
            onClose={() => setShowSubmitModal(false)}
            onSuccess={() => {
              setShowSubmitModal(false)
              onSubmitSuccess()
            }}
          />
        )}
      </>
    )
  }

  // Vista de lista (List)
  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* Barra lateral coloreada */}
          <div className={`w-full lg:w-2 ${activityColor}`} />

          {/* Contenido principal */}
          <div className="flex-1 p-4 lg:p-5">
            <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Icono y contenido */}
              <div className="flex gap-4 flex-1 min-w-0">
                {/* Icono */}
                <div className={`w-12 h-12 lg:w-14 lg:h-14 ${activityColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <FileText className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>

                {/* Título, badge, descripción */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-base lg:text-lg line-clamp-1 flex-1 min-w-0">
                      {activity.title}
                    </h3>
                    <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700 flex-shrink-0">
                      {typeConfig.label}
                    </span>
                  </div>

                  {activity.description && (
                    <p className="text-sm text-gray-600 line-clamp-1 mb-3">
                      {activity.description}
                    </p>
                  )}

                  {/* Estado y estadísticas inline */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {/* Estado de entrega */}
                    {hasSubmission ? (
                      isGraded ? (
                        isPassed ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aprobado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            Reprobado
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          Pendiente
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Sin entregar
                      </span>
                    )}

                    {/* Fecha límite */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold ${
                      isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {dueDate 
                        ? dueDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                        : 'Sin límite'
                      }
                    </span>

                    {/* Puntos */}
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold">
                      <Award className="w-3.5 h-3.5" />
                      {isGraded && submission?.score !== null 
                        ? `${submission.score}/${activity.total_points}`
                        : `${activity.total_points} pts`
                      }
                    </span>

                    {/* Intentos */}
                    <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      Intento {hasSubmission ? submission.attempt_number : 0}/{activity.max_attempts || '∞'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="flex items-center lg:items-start">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  disabled={!canSubmit}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                    canSubmit
                      ? hasSubmission
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {hasSubmission ? 'Reenviar' : 'Entregar'}
                </button>
              </div>
            </div>

            {/* Alertas debajo */}
            {!hasSubmission && isOverdue && !activity.allow_late && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-red-700">
                  <span className="font-bold">Fecha expirada.</span> No se aceptan entregas tardías.
                </div>
              </div>
            )}

            {!hasSubmission && daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0 && (
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-700">
                  <span className="font-bold">¡Próximo a vencer!</span> Te quedan {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <SubmitActivityModal
          activity={activity}
          courseId={courseId}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            setShowSubmitModal(false)
            onSubmitSuccess()
          }}
        />
      )}
    </>
  )
}
