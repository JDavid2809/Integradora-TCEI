'use client'

import { useState } from 'react'
import { Star, MessageCircle, Trash2, AlertCircle, Calendar, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Review {
  id: number
  rating: number
  comment: string
  created_at: string
  updated_at?: string
  student_id: number
  student: {
    usuario: {
      id: number
      nombre: string
      apellido: string
    }
  }
}

interface ReviewSectionProps {
  reviews: Review[]
  courseId: number
  isEnrolled: boolean
  isOwner: boolean // Si el usuario es el profesor del curso
  isAdmin?: boolean // Si el usuario es administrador
  onAddReview?: (rating: number, comment: string) => Promise<void>
  onUpdateReview?: (reviewId: number, rating: number, comment: string) => Promise<void>
  onDeleteReview?: (reviewId: number) => Promise<void>
}

export default function ReviewSection({ 
  reviews, 
  courseId: _courseId, // No usado pero requerido por la interfaz
  isEnrolled, 
  isOwner,
  isAdmin = false,
  onAddReview,
  onUpdateReview,
  onDeleteReview 
}: ReviewSectionProps) {
  const { data: session } = useSession()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [editingReview, setEditingReview] = useState<number | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')

  // Calcular promedio de calificaciones
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  // Verificar si el usuario ya dejó una reseña (solo considerando las activas)
  const userReview = reviews.find(review => 
    session?.user?.extra?.id_estudiante === review.student_id
  )

  // Verificar si el usuario puede editar/eliminar una reseña específica
  const canUserEditReview = (review: Review) => {
    return session?.user?.extra?.id_estudiante === review.student_id
  }

  // Verificar si el usuario puede eliminar una reseña específica
  const canUserDeleteReview = (review: Review) => {
    return (
      session?.user?.extra?.id_estudiante === review.student_id || // Es el autor
      isOwner || // Es el profesor del curso
      isAdmin // Es administrador
    )
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onAddReview || !newComment.trim()) return

    setIsSubmitting(true)
    try {
      await onAddReview(newRating, newComment.trim())
      setNewComment('')
      setNewRating(5)
      setShowAddForm(false)
    } catch (error) {
      console.error('Error al enviar reseña:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onUpdateReview || !editComment.trim() || editingReview === null) return

    setIsSubmitting(true)
    try {
      await onUpdateReview(editingReview, editRating, editComment.trim())
      setEditingReview(null)
      setEditComment('')
      setEditRating(5)
    } catch (error) {
      console.error('Error al actualizar reseña:', error)
      // Si hay error, cancelar la edición para evitar estados inconsistentes
      setEditingReview(null)
      setEditComment('')
      setEditRating(5)
      alert('Error al actualizar la reseña. Puede que haya sido eliminada.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEditing = (review: Review) => {
    // Verificar que la reseña aún existe en la lista (no fue eliminada)
    const currentReview = reviews.find(r => r.id === review.id)
    if (!currentReview) {
      alert('Esta reseña ya no existe. Puede que haya sido eliminada.')
      return
    }
    
    setEditingReview(review.id)
    setEditRating(review.rating)
    setEditComment(review.comment)
  }

  const cancelEditing = () => {
    setEditingReview(null)
    setEditComment('')
    setEditRating(5)
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!onDeleteReview) return

    try {
      await onDeleteReview(reviewId)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error al eliminar reseña:', error)
    }
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            disabled={!interactive}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#00246a] mb-2">
            Reseñas de estudiantes
          </h2>
          {reviews.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1">
                {renderStars(averageRating)}
                <span className="text-base sm:text-lg font-semibold text-gray-900 ml-2">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm sm:text-base text-gray-600">
                ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
              </span>
            </div>
          )}
        </div>

        {/* Botón para agregar reseña */}
        {isEnrolled && !userReview && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#e30f28] text-white rounded-lg hover:bg-[#c20e24] transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            <MessageCircle className="w-4 h-4" />
            {showAddForm ? 'Cancelar' : 'Escribir reseña'}
          </button>
        )}

        {/* Mensaje si ya tiene una reseña */}
        {isEnrolled && userReview && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Ya escribiste una reseña para este curso
          </div>
        )}
      </div>

      {/* Formulario para agregar reseña */}
      {showAddForm && (
        <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Comparte tu experiencia
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación
            </label>
            {renderStars(newRating, true, setNewRating)}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Cuéntanos sobre tu experiencia con este curso..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e30f28] focus:border-transparent resize-none text-sm sm:text-base"
              rows={4}
              required
              maxLength={500}
            />
            <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
              {newComment.length}/500
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="px-4 py-2 bg-[#e30f28] text-white rounded-lg hover:bg-[#c20e24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isSubmitting ? 'Enviando...' : 'Publicar reseña'}
            </button>
          </div>
        </form>
      )}

      {/* Mensaje si no está inscrito */}
      {!isEnrolled && reviews.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-blue-800 font-medium text-sm sm:text-base">¡Únete al curso!</p>
              <p className="text-blue-700 text-xs sm:text-sm">
                Debes estar inscrito en el curso para dejar reseñas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje explicativo sobre una reseña por curso */}
      {isEnrolled && !userReview && showAddForm && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-yellow-800 font-medium text-sm sm:text-base">Una reseña por curso</p>
              <p className="text-yellow-700 text-xs sm:text-sm">
                Puedes escribir una reseña por curso. Si deseas cambiarla más tarde, podrás editarla. 
                Si tu reseña anterior fue eliminada, puedes escribir una nueva.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de reseñas */}
      {reviews.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4 sm:pb-6 last:border-b-0 last:pb-0">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#00246a] rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm shrink-0">
                    {review.student.usuario.nombre[0]}{review.student.usuario.apellido[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                      {review.student.usuario.nombre} {review.student.usuario.apellido}
                      {canUserEditReview(review) && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Tu comentario
                        </span>
                      )}
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1">
                      {editingReview === review.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-600">Calificación:</span>
                          {renderStars(editRating, true, setEditRating)}
                        </div>
                      ) : (
                        renderStars(review.rating)
                      )}
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span className="hidden sm:inline">
                          {new Date(review.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="sm:hidden">
                          {new Date(review.created_at).toLocaleDateString('es-ES', {
                            year: '2-digit',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        {review.updated_at && review.updated_at !== review.created_at && (
                          <span className="text-xs text-gray-400 ml-2">
                            (editado)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {/* Botón de editar para el autor */}
                  {canUserEditReview(review) && editingReview !== review.id && (
                    <button
                      onClick={() => startEditing(review)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Editar reseña"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}

                  {/* Botón de eliminar */}
                  {canUserDeleteReview(review) && (
                    <div className="relative">
                      {deleteConfirm === review.id ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-xs sm:text-sm text-gray-600">¿Eliminar?</span>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="px-1.5 sm:px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-1.5 sm:px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(review.id)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Eliminar reseña"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Contenido del comentario */}
              {editingReview === review.id ? (
                <form onSubmit={handleEditReview} className="ml-0 sm:ml-13 bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comentario
                    </label>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      placeholder="Actualiza tu comentario..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e30f28] focus:border-transparent resize-none text-sm sm:text-base"
                      rows={3}
                      required
                      maxLength={500}
                    />
                    <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
                      {editComment.length}/500
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !editComment.trim()}
                      className="px-3 py-1 bg-[#e30f28] text-white rounded hover:bg-[#c20e24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-700 leading-relaxed ml-0 sm:ml-13 text-sm sm:text-base">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 text-gray-500">
          <MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-base sm:text-lg font-medium mb-2">Aún no hay reseñas</p>
          <p className="text-sm sm:text-base">Sé el primero en compartir tu experiencia con este curso.</p>
          {!isEnrolled && (
            <p className="text-xs sm:text-sm mt-2">
              Debes estar inscrito en el curso para dejar una reseña.
            </p>
          )}
        </div>
      )}
    </div>
  )
}