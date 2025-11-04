'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { 
  StudentCourseDetail, 
  StudentActivityWithSubmission,
  SubmitActivityResult
} from '@/types/student-activity'

/**
 * Obtener detalles del curso para un estudiante
 */
export async function getStudentCourseDetails(courseId: number): Promise<StudentCourseDetail> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.extra?.id_estudiante) {
      throw new Error('Debes iniciar sesión como estudiante')
    }

    const studentId = session.user.extra.id_estudiante

    // Verificar inscripción
    const enrollment = await prisma.inscripcion.findFirst({
      where: {
        course_id: courseId,
        student_id: studentId,
        status: 'ACTIVE'
      }
    })

    if (!enrollment) {
      throw new Error('No estás inscrito en este curso')
    }

    // Obtener detalles del curso
    const course = await prisma.curso.findUnique({
      where: { id_curso: courseId },
      include: {
        creator: {
          include: {
            usuario: true
          }
        },
        imparte: {
          include: {
            profesor: {
              include: {
                usuario: true
              }
            }
          },
          take: 1
        }
      }
    })

    if (!course) {
      throw new Error('Curso no encontrado')
    }

    // Parsear campos JSON
    let whatYouLearn: string[] = []
    let requirements: string[] = []
    let targetAudience: string[] = []
    let courseContent: any[] = []

    try {
      if (course.what_you_learn) {
        const parsed = JSON.parse(course.what_you_learn as string)
        whatYouLearn = Array.isArray(parsed) 
          ? parsed.map(item => typeof item === 'string' ? item : item.text || item)
          : []
      }
    } catch (e) {
      console.error('Error parsing what_you_learn:', e)
    }

    try {
      if (course.requirements) {
        const parsed = JSON.parse(course.requirements as string)
        requirements = Array.isArray(parsed)
          ? parsed.map(item => typeof item === 'string' ? item : item.text || item)
          : []
      }
    } catch (e) {
      console.error('Error parsing requirements:', e)
    }

    try {
      if (course.target_audience) {
        const parsed = JSON.parse(course.target_audience as string)
        targetAudience = Array.isArray(parsed)
          ? parsed.map(item => typeof item === 'string' ? item : item.text || item)
          : []
      }
    } catch (e) {
      console.error('Error parsing target_audience:', e)
    }

    try {
      if (course.course_content) {
        courseContent = JSON.parse(course.course_content as string)
      }
    } catch (e) {
      console.error('Error parsing course_content:', e)
    }

    // Obtener datos del instructor
    const instructor = course.imparte[0]?.profesor || course.creator
    const instructorName = instructor?.usuario.nombre || 'Instructor'
    const instructorLastName = instructor?.usuario.apellido || 'desconocido'

    return {
      id: course.id_curso,
      nombre: course.nombre,
      descripcion: course.descripcion,
      resumen: course.resumen,
      modalidad: course.modalidad as 'PRESENCIAL' | 'ONLINE',
      inicio: course.inicio,
      fin: course.fin,
      inscripcionId: enrollment.id, // Incluir ID de inscripción
      instructor: {
        nombre: instructorName,
        apellido: instructorLastName
      },
      nivel: course.nivel_ingles,
      whatYouLearn,
      requirements,
      targetAudience,
      courseContent
    }
  } catch (error) {
    console.error('Error fetching student course details:', error)
    throw error
  }
}

/**
 * Obtener actividades del curso para el estudiante
 */
export async function getStudentActivities(courseId: number): Promise<StudentActivityWithSubmission[]> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.extra?.id_estudiante) {
      throw new Error('Debes iniciar sesión como estudiante')
    }

    const studentId = session.user.extra.id_estudiante

    // Verificar inscripción
    const enrollment = await prisma.inscripcion.findFirst({
      where: {
        course_id: courseId,
        student_id: studentId,
        status: 'ACTIVE'
      }
    })

    if (!enrollment) {
      throw new Error('No estás inscrito en este curso')
    }

    // Obtener actividades publicadas con sus entregas
    const activities = await prisma.course_activity.findMany({
      where: {
        course_id: courseId,
        is_published: true // Solo mostrar actividades publicadas
      },
      include: {
        attachments: true,
        submissions: {
          where: {
            student_id: studentId
          },
          orderBy: {
            submitted_at: 'desc'
          },
          take: 1, // Solo la última entrega
          include: {
            files: true
          }
        }
      },
      orderBy: [
        { due_date: 'asc' },
        { created_at: 'desc' }
      ]
    })

    return activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      instructions: activity.instructions,
      activity_type: activity.activity_type,
      due_date: activity.due_date,
      total_points: activity.total_points,
      min_passing_score: activity.min_passing_score,
      allow_late: activity.allow_late,
      late_penalty: activity.late_penalty,
      max_attempts: activity.max_attempts,
      is_published: activity.is_published,
      created_at: activity.created_at,
      attachments: activity.attachments,
      submission: activity.submissions[0] || null
    }))
  } catch (error) {
    console.error('Error fetching student activities:', error)
    throw error
  }
}

/**
 * Enviar/actualizar entrega de actividad
 */
export async function submitStudentActivity(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.extra?.id_estudiante) {
      return {
        success: false,
        message: 'Debes iniciar sesión como estudiante'
      }
    }

    const studentId = session.user.extra.id_estudiante

    // Extraer datos del FormData
    const activityId = parseInt(formData.get('activityId') as string)
    const courseId = parseInt(formData.get('courseId') as string)
    const submissionText = formData.get('submissionText') as string
    const files = formData.getAll('files') as File[]

    // Validar que al menos haya texto o archivos
    if (!submissionText?.trim() && files.length === 0) {
      return {
        success: false,
        message: 'Debes proporcionar un comentario o adjuntar archivos'
      }
    }

    // Verificar inscripción
    const enrollment = await prisma.inscripcion.findFirst({
      where: {
        course_id: courseId,
        student_id: studentId,
        status: 'ACTIVE'
      }
    })

    if (!enrollment) {
      return {
        success: false,
        message: 'No estás inscrito en este curso'
      }
    }

    // Verificar actividad
    const activity = await prisma.course_activity.findUnique({
      where: { id: activityId }
    })

    if (!activity || !activity.is_published) {
      return {
        success: false,
        message: 'La actividad no está disponible'
      }
    }

    // Verificar intentos
    const submissionCount = await prisma.activity_submission.count({
      where: {
        activity_id: activityId,
        student_id: studentId,
        enrollment_id: enrollment.id
      }
    })

    if (activity.max_attempts && submissionCount >= activity.max_attempts) {
      return {
        success: false,
        message: `Has alcanzado el máximo de intentos (${activity.max_attempts})`
      }
    }

    // Verificar si es entrega tardía
    const now = new Date()
    const isLate = activity.due_date ? now > activity.due_date : false

    if (isLate && !activity.allow_late) {
      return {
        success: false,
        message: 'La fecha de entrega ha expirado y no se permiten entregas tardías'
      }
    }

    // Crear la entrega
    const submission = await prisma.activity_submission.create({
      data: {
        activity_id: activityId,
        student_id: studentId,
        enrollment_id: enrollment.id,
        submission_text: submissionText || null,
        is_late: isLate,
        attempt_number: submissionCount + 1,
        status: 'SUBMITTED'
      },
      include: {
        files: true
      }
    })

    // TODO: Guardar archivos adjuntos
    // Por ahora, los archivos se envían pero no se guardan en la BD ni en storage
    // En una implementación completa:
    // 1. Subir archivos a cloud storage (S3, Cloudinary, etc.)
    // 2. Guardar referencias en submission_file:
    //    await prisma.submission_file.createMany({
    //      data: fileUrls.map(url => ({
    //        submission_id: submission.id,
    //        file_name: ...,
    //        file_url: url,
    //        file_type: ...,
    //        file_size: ...
    //      }))
    //    })

    if (files && files.length > 0) {
      console.log(`Recibidos ${files.length} archivos para la entrega ${submission.id}`)
      console.log('Archivos:', files.map(f => ({ name: f.name, type: f.type, size: f.size })))
      // Aquí iría la lógica de upload real
    }

    return {
      success: true,
      message: isLate 
        ? 'Entrega enviada (tardía). Puede aplicarse una penalización.'
        : 'Entrega enviada exitosamente'
    }
  } catch (error) {
    console.error('Error submitting activity:', error)
    return {
      success: false,
      message: 'Error al enviar la entrega. Por favor intenta de nuevo.'
    }
  }
}
