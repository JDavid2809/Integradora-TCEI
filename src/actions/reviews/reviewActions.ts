'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Schema de validación para reseñas
const reviewSchema = z.object({
  courseId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(500).trim()
})

const updateReviewSchema = z.object({
  reviewId: z.number().int().positive(),
  courseId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(500).trim()
})

const deleteReviewSchema = z.object({
  reviewId: z.number().int().positive(),
  courseId: z.number().int().positive()
})

// Obtener reseñas de un curso
export async function getCourseReviews(courseId: number) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        course_id: courseId,
        is_active: true
      },
      include: {
        student: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return {
      success: true,
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at.toISOString(),
        updated_at: review.updated_at?.toISOString(),
        student_id: review.student_id,
        student: {
          usuario: {
            id: review.student.usuario.id,
            nombre: review.student.usuario.nombre,
            apellido: review.student.usuario.apellido
          }
        }
      }))
    }
  } catch (error) {
    console.error('Error al obtener reseñas:', error)
    return {
      success: false,
      error: 'Error al cargar las reseñas'
    }
  }
}

// Crear una nueva reseña
export async function createReview(data: { courseId: number, rating: number, comment: string }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.extra?.id_estudiante) {
      return {
        success: false,
        error: 'Debes estar autenticado como estudiante para dejar una reseña'
      }
    }

    // Validar datos
    const validatedData = reviewSchema.parse(data)

    // Verificar que el estudiante esté inscrito en el curso
    const enrollment = await prisma.inscripcion.findFirst({
      where: {
        student_id: session.user.extra.id_estudiante,
        course_id: validatedData.courseId,
        status: 'ACTIVE'
      }
    })

    if (!enrollment) {
      return {
        success: false,
        error: 'Debes estar inscrito en el curso para dejar una reseña'
      }
    }

    // Verificar si el estudiante ya tiene una reseña para este curso
    const existingReview = await prisma.review.findUnique({
      where: {
        course_id_student_id: {
          course_id: validatedData.courseId,
          student_id: session.user.extra.id_estudiante
        }
      }
    })

    if (existingReview) {
      return {
        success: false,
        error: 'Ya tienes una reseña para este curso. Puedes editarla o eliminarla si deseas cambiarla.'
      }
    }

    // Crear la reseña
    const review = await prisma.review.create({
      data: {
        course_id: validatedData.courseId,
        student_id: session.user.extra.id_estudiante,
        rating: validatedData.rating,
        comment: validatedData.comment
      },
      include: {
        student: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true
              }
            }
          }
        }
      }
    })

    // Revalidar la página del curso
    revalidatePath(`/Courses`)
    
    return {
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at.toISOString(),
        updated_at: review.updated_at?.toISOString(),
        student_id: review.student_id,
        student: {
          usuario: {
            id: review.student.usuario.id,
            nombre: review.student.usuario.nombre,
            apellido: review.student.usuario.apellido
          }
        }
      }
    }
  } catch (error) {
    console.error('Error al crear reseña:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Datos de reseña inválidos'
      }
    }
    
    return {
      success: false,
      error: 'Error al guardar la reseña'
    }
  }
}

// Actualizar una reseña (solo el autor puede editarla)
export async function updateReview(data: { reviewId: number, courseId: number, rating: number, comment: string }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.extra?.id_estudiante) {
      return {
        success: false,
        error: 'Debes estar autenticado como estudiante para editar una reseña'
      }
    }

    // Validar datos
    const validatedData = updateReviewSchema.parse(data)

    // Verificar que la reseña existe, está activa y pertenece al estudiante
    const review = await prisma.review.findFirst({
      where: {
        id: validatedData.reviewId,
        course_id: validatedData.courseId,
        student_id: session.user.extra.id_estudiante
      },
      include: {
        student: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true
              }
            }
          }
        }
      }
    })

    if (!review) {
      return {
        success: false,
        error: 'Reseña no encontrada o fue eliminada. No puedes editar una reseña que no existe o no te pertenece.'
      }
    }

    // Verificar que el estudiante esté inscrito en el curso (por seguridad)
    const enrollment = await prisma.inscripcion.findFirst({
      where: {
        student_id: session.user.extra.id_estudiante,
        course_id: validatedData.courseId,
        status: 'ACTIVE'
      }
    })

    if (!enrollment) {
      return {
        success: false,
        error: 'Debes estar inscrito en el curso para editar reseñas'
      }
    }

    // Actualizar la reseña
    const updatedReview = await prisma.review.update({
      where: {
        id: validatedData.reviewId
      },
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment,
        updated_at: new Date()
      },
      include: {
        student: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true
              }
            }
          }
        }
      }
    })

    // Revalidar la página del curso
    revalidatePath(`/Courses`)
    
    return {
      success: true,
      review: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        created_at: updatedReview.created_at.toISOString(),
        updated_at: updatedReview.updated_at?.toISOString(),
        student_id: updatedReview.student_id,
        student: {
          usuario: {
            id: updatedReview.student.usuario.id,
            nombre: updatedReview.student.usuario.nombre,
            apellido: updatedReview.student.usuario.apellido
          }
        }
      }
    }
  } catch (error) {
    console.error('Error al actualizar reseña:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Datos de reseña inválidos'
      }
    }
    
    return {
      success: false,
      error: 'Error al actualizar la reseña'
    }
  }
}

// Eliminar una reseña (estudiante autor, profesor del curso, o administrador)
export async function deleteReview(data: { reviewId: number, courseId: number }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return {
        success: false,
        error: 'Debes estar autenticado para eliminar reseñas'
      }
    }

    // Validar datos
    const validatedData = deleteReviewSchema.parse(data)

    // Verificar que la reseña existe
    const review = await prisma.review.findFirst({
      where: {
        id: validatedData.reviewId,
        course_id: validatedData.courseId,
        is_active: true
      }
    })

    if (!review) {
      return {
        success: false,
        error: 'Reseña no encontrada'
      }
    }

    let canDelete = false
    let deleteReason = ''

    // Verificar permisos:
    // 1. Si es el estudiante autor de la reseña
    if (session.user.extra?.id_estudiante && review.student_id === session.user.extra.id_estudiante) {
      canDelete = true
      deleteReason = 'autor'
    }
    // 2. Si es el profesor del curso
    else if (session.user.extra?.id_profesor) {
      const course = await prisma.curso.findFirst({
        where: {
          id_curso: validatedData.courseId,
          created_by: session.user.extra.id_profesor
        }
      })
      if (course) {
        canDelete = true
        deleteReason = 'profesor'
      }
    }
    // 3. Si es administrador
    else if (session.user.extra?.id_admin) {
      canDelete = true
      deleteReason = 'administrador'
    }

    if (!canDelete) {
      return {
        success: false,
        error: 'No tienes permisos para eliminar esta reseña'
      }
    }

    // Hard delete: eliminar físicamente el registro para permitir nuevas reseñas
    await prisma.review.delete({
      where: {
        id: validatedData.reviewId
      }
    })

    // Revalidar la página del curso
    revalidatePath(`/Courses`)
    
    return {
      success: true,
      message: `Reseña eliminada correctamente por ${deleteReason}`
    }
  } catch (error) {
    console.error('Error al eliminar reseña:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Datos inválidos'
      }
    }
    
    return {
      success: false,
      error: 'Error al eliminar la reseña'
    }
  }
}

// Obtener estadísticas de reseñas para un curso
export async function getCourseReviewStats(courseId: number) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        course_id: courseId,
        is_active: true
      },
      select: {
        rating: true
      }
    })

    if (reviews.length === 0) {
      return {
        success: true,
        stats: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          }
        }
      }
    }

    const totalReviews = reviews.length
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews

    // Distribución de calificaciones
    const ratingDistribution = reviews.reduce((acc, review) => {
      acc[review.rating as keyof typeof acc] = (acc[review.rating as keyof typeof acc] || 0) + 1
      return acc
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })

    return {
      success: true,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
        ratingDistribution
      }
    }
  } catch (error) {
    console.error('Error al obtener estadísticas de reseñas:', error)
    return {
      success: false,
      error: 'Error al cargar las estadísticas'
    }
  }
}