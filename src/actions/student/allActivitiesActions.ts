'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export interface StudentActivityWithCourse {
  id: number
  title: string
  description: string | null
  instructions: string | null
  activity_type: 'ASSIGNMENT' | 'QUIZ' | 'PROJECT' | 'EXAM' | 'READING' | 'VIDEO' | 'PRACTICE' | 'DISCUSSION'
  due_date: Date | null
  total_points: number
  min_passing_score: number | null
  allow_late: boolean
  late_penalty: number | null
  max_attempts: number | null
  is_published: boolean
  created_at: Date
  course: {
    id: number
    nombre: string
    nivel_ingles: string | null
    modalidad: 'PRESENCIAL' | 'ONLINE'
  }
  submission?: {
    id: number
    submission_text: string | null
    submitted_at: Date
    is_late: boolean
    attempt_number: number
    status: 'SUBMITTED' | 'GRADED' | 'RETURNED' | 'DRAFT' | 'LATE' | 'MISSING'
    score: number | null
    feedback: string | null
    graded_at: Date | null
  } | null
}

/**
 * Obtener todas las actividades del estudiante de todos sus cursos activos
 */
export async function getAllStudentActivities(): Promise<StudentActivityWithCourse[]> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.extra?.id_estudiante) {
      throw new Error('Debes iniciar sesión como estudiante')
    }

    const studentId = session.user.extra.id_estudiante

    // Obtener todas las inscripciones activas del estudiante
    const enrollments = await prisma.inscripcion.findMany({
      where: {
        student_id: studentId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        course_id: true
      }
    })

    if (enrollments.length === 0) {
      return []
    }

    const courseIds = enrollments.map(e => e.course_id)

    // Obtener todas las actividades publicadas de esos cursos
    const activities = await prisma.course_activity.findMany({
      where: {
        course_id: { in: courseIds },
        is_published: true
      },
      include: {
        course: {
          select: {
            id_curso: true,
            nombre: true,
            nivel_ingles: true,
            modalidad: true
          }
        },
        submissions: {
          where: {
            student_id: studentId
          },
          orderBy: {
            submitted_at: 'desc'
          },
          take: 1, // Solo la última entrega
          select: {
            id: true,
            submission_text: true,
            submitted_at: true,
            is_late: true,
            attempt_number: true,
            status: true,
            score: true,
            feedback: true,
            graded_at: true
          }
        }
      },
      orderBy: [
        { due_date: 'asc' },
        { created_at: 'desc' }
      ]
    })

    // Transformar y retornar
    return activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      instructions: activity.instructions,
      activity_type: activity.activity_type as any,
      due_date: activity.due_date,
      total_points: activity.total_points,
      min_passing_score: activity.min_passing_score,
      allow_late: activity.allow_late,
      late_penalty: activity.late_penalty,
      max_attempts: activity.max_attempts,
      is_published: activity.is_published,
      created_at: activity.created_at,
      course: {
        id: activity.course.id_curso,
        nombre: activity.course.nombre,
        nivel_ingles: activity.course.nivel_ingles,
        modalidad: activity.course.modalidad as 'PRESENCIAL' | 'ONLINE'
      },
      submission: activity.submissions[0] || null
    }))
  } catch (error) {
    console.error('Error fetching all student activities:', error)
    throw error
  }
}

export async function getStudentActivitiesStats() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.extra?.id_estudiante) {
      throw new Error('Debes iniciar sesión como estudiante')
    }

    const studentId = session.user.extra.id_estudiante

    const activities = await getAllStudentActivities()
    
    const now = new Date()

    // Calcular estadísticas
    const stats = {
      total: activities.length,
      pending: activities.filter(a => !a.submission).length,
      submitted: activities.filter(a => a.submission && a.submission.status === 'SUBMITTED').length,
      graded: activities.filter(a => a.submission && a.submission.status === 'GRADED').length,
      overdue: activities.filter(a => !a.submission && a.due_date && a.due_date < now).length,
      totalPoints: activities.reduce((sum, a) => {
        return sum + (a.submission?.score || 0)
      }, 0),
      maxPoints: activities.reduce((sum, a) => {
        return sum + (a.submission?.status === 'GRADED' ? a.total_points : 0)
      }, 0)
    }

    return stats
  } catch (error) {
    console.error('Error fetching student activities stats:', error)
    throw error
  }
}
