'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export interface StudentDashboardStats {
  activeCourses: number
  completedCourses: number
  totalActivities: number
  completedActivities: number
  certificates: number
  averageGrade: number | null
}

export interface RecentActivity {
  id: string
  type: 'submission' | 'grade' | 'enrollment' | 'certificate'
  action: string
  course: string
  time: Date
  icon: 'submission' | 'grade' | 'enrollment' | 'certificate'
}

export interface NextClass {
  courseId: number
  courseName: string
  day: string
  time: string
  classroom: string | null
  teacherName: string
}

/**
 * Obtener estadísticas del dashboard del estudiante
 */
export async function getStudentDashboardStats(): Promise<StudentDashboardStats> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.extra?.id_estudiante) {
      throw new Error('Debes iniciar sesión como estudiante')
    }

    const studentId = session.user.extra.id_estudiante

    // Obtener inscripciones
    const [activeEnrollments, completedEnrollments] = await Promise.all([
      prisma.inscripcion.count({
        where: {
          student_id: studentId,
          status: 'ACTIVE'
        }
      }),
      prisma.inscripcion.count({
        where: {
          student_id: studentId,
          status: 'COMPLETED'
        }
      })
    ])

    // Obtener actividades
    const enrollments = await prisma.inscripcion.findMany({
      where: {
        student_id: studentId,
        status: { in: ['ACTIVE', 'COMPLETED'] }
      },
      select: { id: true }
    })

    const enrollmentIds = enrollments.map(e => e.id)

    const [totalSubmissions, completedSubmissions] = await Promise.all([
      prisma.activity_submission.count({
        where: {
          student_id: studentId,
          enrollment_id: { in: enrollmentIds }
        }
      }),
      prisma.activity_submission.count({
        where: {
          student_id: studentId,
          enrollment_id: { in: enrollmentIds },
          status: 'GRADED'
        }
      })
    ])

    // Obtener certificados
    const certificates = await prisma.certificado.count({
      where: {
        estudiante_id: studentId,
        es_valido: true
      }
    })

    // Calcular promedio de calificaciones
    const gradedSubmissions = await prisma.activity_submission.findMany({
      where: {
        student_id: studentId,
        enrollment_id: { in: enrollmentIds },
        status: 'GRADED',
        score: { not: null }
      },
      include: {
        activity: {
          select: {
            total_points: true
          }
        }
      }
    })

    let averageGrade: number | null = null
    if (gradedSubmissions.length > 0) {
      const percentages = gradedSubmissions.map(sub => 
        (sub.score! / sub.activity.total_points) * 100
      )
      averageGrade = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
    }

    return {
      activeCourses: activeEnrollments,
      completedCourses: completedEnrollments,
      totalActivities: totalSubmissions,
      completedActivities: completedSubmissions,
      certificates,
      averageGrade
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

/**
 * Obtener actividades recientes del estudiante
 */
export async function getRecentActivities(): Promise<RecentActivity[]> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.extra?.id_estudiante) {
      throw new Error('Debes iniciar sesión como estudiante')
    }

    const studentId = session.user.extra.id_estudiante

    // Obtener últimas entregas
    const recentSubmissions = await prisma.activity_submission.findMany({
      where: {
        student_id: studentId
      },
      include: {
        activity: {
          include: {
            course: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        submitted_at: 'desc'
      },
      take: 5
    })

    // Obtener inscripciones recientes
    const recentEnrollments = await prisma.inscripcion.findMany({
      where: {
        student_id: studentId
      },
      include: {
        course: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: {
        enrolled_at: 'desc'
      },
      take: 3
    })

    // Obtener certificados recientes
    const recentCertificates = await prisma.certificado.findMany({
      where: {
        estudiante_id: studentId
      },
      include: {
        curso: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: {
        fecha_emision: 'desc'
      },
      take: 2
    })

    // Combinar todas las actividades
    const activities: RecentActivity[] = []

    // Agregar entregas
    recentSubmissions.forEach(sub => {
      if (sub.status === 'GRADED') {
        activities.push({
          id: `grade-${sub.id}`,
          type: 'grade',
          action: `Actividad calificada: ${sub.score}/${sub.activity.total_points}`,
          course: sub.activity.course.nombre,
          time: sub.graded_at || sub.submitted_at,
          icon: 'grade'
        })
      } else if (sub.status === 'SUBMITTED') {
        activities.push({
          id: `submission-${sub.id}`,
          type: 'submission',
          action: 'Entregaste una actividad',
          course: sub.activity.course.nombre,
          time: sub.submitted_at,
          icon: 'submission'
        })
      }
    })

    // Agregar inscripciones
    recentEnrollments.forEach(enroll => {
      activities.push({
        id: `enrollment-${enroll.id}`,
        type: 'enrollment',
        action: 'Te inscribiste al curso',
        course: enroll.course.nombre,
        time: enroll.enrolled_at,
        icon: 'enrollment'
      })
    })

    // Agregar certificados
    recentCertificates.forEach(cert => {
      activities.push({
        id: `certificate-${cert.id}`,
        type: 'certificate',
        action: 'Obtuviste un certificado',
        course: cert.curso.nombre,
        time: cert.fecha_emision,
        icon: 'certificate'
      })
    })

    // Ordenar por fecha y tomar los últimos 6
    activities.sort((a, b) => b.time.getTime() - a.time.getTime())
    
    return activities.slice(0, 6)
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    throw error
  }
}

/**
 * Obtener próximas clases del estudiante
 */
export async function getNextClasses(): Promise<NextClass[]> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.extra?.id_estudiante) {
      throw new Error('Debes iniciar sesión como estudiante')
    }

    const studentId = session.user.extra.id_estudiante

    // Obtener inscripciones activas con horarios
    const enrollments = await prisma.inscripcion.findMany({
      where: {
        student_id: studentId,
        status: 'ACTIVE'
      },
      include: {
        course: {
          include: {
            class_schedules: {
              where: {
                is_active: true
              },
              include: {
                teacher: {
                  include: {
                    usuario: true
                  }
                }
              },
              take: 1
            }
          }
        }
      }
    })

    const nextClasses: NextClass[] = []

    const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    const daysInSpanish: { [key: string]: string } = {
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes',
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    }

    enrollments.forEach(enrollment => {
      if (enrollment.course.class_schedules.length > 0) {
        const schedule = enrollment.course.class_schedules[0]
        nextClasses.push({
          courseId: enrollment.course.id_curso,
          courseName: enrollment.course.nombre,
          day: daysInSpanish[schedule.day_of_week] || schedule.day_of_week,
          time: schedule.start_time,
          classroom: schedule.classroom,
          teacherName: `${schedule.teacher.usuario.nombre} ${schedule.teacher.usuario.apellido}`
        })
      }
    })

    return nextClasses.slice(0, 3)
  } catch (error) {
    console.error('Error fetching next classes:', error)
    throw error
  }
}

/**
 * Obtener última actividad pendiente del estudiante
 */
export async function getNextPendingActivity() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.extra?.id_estudiante) {
      return null
    }

    const studentId = session.user.extra.id_estudiante

    // Obtener inscripciones activas
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

    if (enrollments.length === 0) return null

    const enrollmentIds = enrollments.map(e => e.id)
    const courseIds = enrollments.map(e => e.course_id)

    // Buscar actividades sin entregar
    const pendingActivity = await prisma.course_activity.findFirst({
      where: {
        course_id: { in: courseIds },
        is_published: true,
        submissions: {
          none: {
            student_id: studentId,
            enrollment_id: { in: enrollmentIds }
          }
        }
      },
      include: {
        course: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: {
        due_date: 'asc'
      }
    })

    if (!pendingActivity) return null

    return {
      id: pendingActivity.id,
      title: pendingActivity.title,
      courseName: pendingActivity.course.nombre,
      courseId: pendingActivity.course_id,
      dueDate: pendingActivity.due_date
    }
  } catch (error) {
    console.error('Error fetching next pending activity:', error)
    return null
  }
}
