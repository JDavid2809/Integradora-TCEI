'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'
import { 
  StudentCourseDetail, 
  StudentActivityWithSubmission,
  SubmitActivityResult
} from '@/types/student-activity'

// Tipos permitidos para archivos
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 5

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

    // DEBUG: Log para verificar datos de submissions
    activities.forEach(activity => {
      if (activity.submissions[0]) {
        console.log(`[DEBUG] Activity ${activity.id} - Submission:`, {
          id: activity.submissions[0].id,
          status: activity.submissions[0].status,
          score: activity.submissions[0].score,
          feedback: activity.submissions[0].feedback,
          graded_at: activity.submissions[0].graded_at
        })
      }
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

    // Validar archivos
    if (files.length > MAX_FILES) {
      return {
        success: false,
        message: `Máximo ${MAX_FILES} archivos permitidos`
      }
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return {
          success: false,
          message: `Tipo de archivo no permitido: ${file.name}`
        }
      }
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          message: `Archivo demasiado grande: ${file.name} (máximo 10MB)`
        }
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

    // Subir archivos a Cloudinary
    const uploadedFiles: Array<{
      fileName: string
      fileUrl: string
      fileType: string
      fileSize: number
    }> = []

    if (files && files.length > 0) {
      for (const file of files) {
        try {
          // Convertir archivo a buffer
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)

          // Determinar tipo de recurso
          const resourceType = file.type.startsWith('image/') ? 'image' : 'raw'

          // Subir a Cloudinary
          const result = await new Promise<{
            secure_url: string
            public_id: string
            format: string
            bytes: number
          }>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                folder: `tareas/entregas/${courseId}/${activityId}`,
                resource_type: resourceType,
                public_id: `${studentId}-${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}`,
              },
              (error, result) => {
                if (error) reject(error)
                else if (result) resolve(result)
                else reject(new Error('No result from Cloudinary'))
              }
            ).end(buffer)
          })

          uploadedFiles.push({
            fileName: file.name,
            fileUrl: result.secure_url,
            fileType: file.type,
            fileSize: result.bytes
          })
        } catch (uploadError) {
          console.error(`Error subiendo archivo ${file.name}:`, uploadError)
          return {
            success: false,
            message: `Error al subir el archivo: ${file.name}`
          }
        }
      }
    }

    // Crear la entrega con transacción
    const submission = await prisma.$transaction(async (tx) => {
      // Crear la entrega
      const newSubmission = await tx.activity_submission.create({
        data: {
          activity_id: activityId,
          student_id: studentId,
          enrollment_id: enrollment.id,
          submission_text: submissionText || null,
          is_late: isLate,
          attempt_number: submissionCount + 1,
          status: 'SUBMITTED'
        }
      })

      // Guardar archivos en la base de datos
      if (uploadedFiles.length > 0) {
        await tx.submission_file.createMany({
          data: uploadedFiles.map(file => ({
            submission_id: newSubmission.id,
            file_name: file.fileName,
            file_url: file.fileUrl,
            file_type: file.fileType,
            file_size: file.fileSize
          }))
        })
      }

      return newSubmission
    })

    console.log(`Entrega ${submission.id} creada con ${uploadedFiles.length} archivos`)

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
