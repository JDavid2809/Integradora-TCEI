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
}

export default function StudentActivityCard({ activity, courseId, onSubmitSuccess }: StudentActivityCardProps) {
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  
  const typeConfig = ActivityTypeConfig[activity.activity_type]
  
  // Colores para tipos de actividad
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', gradient: 'from-blue-50 to-blue-100' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700', gradient: 'from-purple-50 to-purple-100' },
    green: { bg: 'bg-green-100', text: 'text-green-600', badge: 'bg-green-100 text-green-700', gradient: 'from-green-50 to-green-100' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700', gradient: 'from-orange-50 to-orange-100' },
    red: { bg: 'bg-red-100', text: 'text-red-600', badge: 'bg-red-100 text-red-700', gradient: 'from-red-50 to-red-100' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700', gradient: 'from-indigo-50 to-indigo-100' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-600', badge: 'bg-pink-100 text-pink-700', gradient: 'from-pink-50 to-pink-100' },
  }
  
  const colors = colorClasses[typeConfig.color as keyof typeof colorClasses] || colorClasses.blue

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

  return (
    <>
      <div className="bg-white border-2 border-gray-200 rounded-xl hover:shadow-xl transition-all duration-300 overflow-hidden group">
        
        {/* Header con color del tipo de actividad */}
        <div className={`bg-gradient-to-r ${colors.gradient} p-4 border-b-2 border-gray-200`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <FileText className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{activity.title}</h3>
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${colors.badge}`}>
                  {typeConfig.label}
                </span>
              </div>
            </div>
            
            {/* Status Badge */}
            {hasSubmission && (
              <div className="flex-shrink-0">
                {isGraded ? (
                  isPassed ? (
                    <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      Aprobado
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold">
                      <XCircle className="w-4 h-4" />
                      Reprobado
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    Pendiente
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Description */}
          {activity.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {activity.description}
            </p>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Due Date */}
            <div className="flex items-center gap-2">
              <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
              <div>
                <div className="text-xs text-gray-500">Fecha límite</div>
                <div className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                  {dueDate 
                    ? dueDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                    : 'Sin límite'
                  }
                </div>
              </div>
            </div>

            {/* Points */}
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Puntos</div>
                <div className="text-sm font-semibold text-gray-700">
                  {isGraded && submission?.score !== null 
                    ? `${submission.score}/${activity.total_points}`
                    : activity.total_points
                  }
                </div>
              </div>
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

          {/* Action Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={!canSubmit}
            className={`w-full py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              canSubmit
                ? hasSubmission
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 hover:shadow-lg'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 hover:shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
            {hasSubmission ? 'Reenviar' : 'Entregar'}
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
