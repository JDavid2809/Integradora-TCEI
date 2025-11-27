'use server'

import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'
import {
  CreateActivityInput,
  UpdateActivityInput,
  CreateSubmissionInput,
  GradeSubmissionInput,
  ActivityStats,
  StudentActivityProgress
} from '@/types/course-activity'
import { revalidatePath } from 'next/cache'

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

// ============================================
// ACTIVIDADES - PROFESOR
// ============================================

/**
 * Crear una nueva actividad para un curso
 */
export async function createActivity(data: CreateActivityInput) {
  try {
    // Verificar que el profesor tenga acceso al curso
    const course = await prisma.curso.findFirst({
      where: {
        id_curso: data.course_id,
        created_by: data.created_by
      }
    })

    if (!course) {
      return {
        success: false,
        message: 'No tienes permiso para crear actividades en este curso'
      }
    }

    const activity = await prisma.course_activity.create({
      data: {
        course_id: data.course_id,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        activity_type: data.activity_type,
        due_date: data.due_date,
        total_points: data.total_points || 100,
        min_passing_score: data.min_passing_score,
        allow_late: data.allow_late || false,
        late_penalty: data.late_penalty,
        max_attempts: data.max_attempts || 1,
        is_published: data.is_published || false,
        created_by: data.created_by
      },
      include: {
        attachments: true
      }
    })

    revalidatePath(`/teacher/courses/${data.course_id}`)
    
    return {
      success: true,
      activity,
      message: 'Actividad creada exitosamente'
    }
  } catch (error) {
    console.error('Error creating activity:', error)
    return {
      success: false,
      message: 'Error al crear la actividad'
    }
  }
}

/**
 * Obtener todas las actividades de un curso
 */
export async function getCourseActivities(courseId: number, teacherId: number) {
  try {
    // Verificar acceso
    const course = await prisma.curso.findFirst({
      where: {
        id_curso: courseId,
        created_by: teacherId
      }
    })

    if (!course) {
      throw new Error('No tienes acceso a este curso')
    }

    const activities = await prisma.course_activity.findMany({
      where: {
        course_id: courseId
      },
      include: {
        attachments: true,
        course: {
          select: {
            nombre: true,
            id_curso: true
          }
        },
        _count: {
          select: {
            submissions: true,
            attachments: true
          }
        }
      },
      orderBy: [
        { due_date: 'asc' },
        { created_at: 'desc' }
      ]
    })

    return activities
  } catch (error) {
    console.error('Error fetching activities:', error)
    throw error
  }
}

/**
 * Obtener detalles de una actividad
 */
export async function getActivityDetails(activityId: number, teacherId: number) {
  try {
    const activity = await prisma.course_activity.findFirst({
      where: {
        id: activityId,
        created_by: teacherId
      },
      include: {
        attachments: true,
        course: {
          select: {
            nombre: true,
            id_curso: true
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      }
    })

    if (!activity) {
      throw new Error('Actividad no encontrada')
    }

    return activity
  } catch (error) {
    console.error('Error fetching activity details:', error)
    throw error
  }
}

/**
 * Actualizar una actividad
 */
export async function updateActivity(
  activityId: number,
  data: UpdateActivityInput,
  teacherId: number
) {
  try {
    // Verificar propiedad
    const activity = await prisma.course_activity.findFirst({
      where: {
        id: activityId,
        created_by: teacherId
      }
    })

    if (!activity) {
      return {
        success: false,
        message: 'No tienes permiso para editar esta actividad'
      }
    }

    const updated = await prisma.course_activity.update({
      where: { id: activityId },
      data: {
        ...data,
        updated_at: new Date()
      },
      include: {
        attachments: true
      }
    })

    revalidatePath(`/teacher/courses/${activity.course_id}`)
    
    return {
      success: true,
      activity: updated,
      message: 'Actividad actualizada exitosamente'
    }
  } catch (error) {
    console.error('Error updating activity:', error)
    return {
      success: false,
      message: 'Error al actualizar la actividad'
    }
  }
}

/**
 * Eliminar una actividad
 */
export async function deleteActivity(activityId: number, teacherId: number) {
  try {
    const activity = await prisma.course_activity.findFirst({
      where: {
        id: activityId,
        created_by: teacherId
      }
    })

    if (!activity) {
      return {
        success: false,
        message: 'No tienes permiso para eliminar esta actividad'
      }
    }

    await prisma.course_activity.delete({
      where: { id: activityId }
    })

    revalidatePath(`/teacher/courses/${activity.course_id}`)
    
    return {
      success: true,
      message: 'Actividad eliminada exitosamente'
    }
  } catch (error) {
    console.error('Error deleting activity:', error)
    return {
      success: false,
      message: 'Error al eliminar la actividad'
    }
  }
}

/**
 * Publicar/Despublicar una actividad
 */
export async function toggleActivityPublish(activityId: number, teacherId: number) {
  try {
    const activity = await prisma.course_activity.findFirst({
      where: {
        id: activityId,
        created_by: teacherId
      }
    })

    if (!activity) {
      return {
        success: false,
        message: 'No tienes permiso para modificar esta actividad'
      }
    }

    const updated = await prisma.course_activity.update({
      where: { id: activityId },
      data: {
        is_published: !activity.is_published
      }
    })

    revalidatePath(`/teacher/courses/${activity.course_id}`)
    
    return {
      success: true,
      is_published: updated.is_published,
      message: updated.is_published ? 'Actividad publicada' : 'Actividad despublicada'
    }
  } catch (error) {
    console.error('Error toggling activity publish:', error)
    return {
      success: false,
      message: 'Error al cambiar el estado de publicación'
    }
  }
}

// ============================================
// ARCHIVOS ADJUNTOS - PROFESOR
// ============================================

/**
 * Subir archivos adjuntos a una actividad (materiales del profesor)
 */
export async function uploadActivityAttachments(formData: FormData, teacherId: number) {
  try {
    const activityId = parseInt(formData.get('activityId') as string)
    const files = formData.getAll('files') as File[]

    if (!activityId || isNaN(activityId)) {
      return {
        success: false,
        message: 'ID de actividad inválido'
      }
    }

    // Verificar que el profesor tenga acceso a la actividad
    const activity = await prisma.course_activity.findFirst({
      where: {
        id: activityId,
        created_by: teacherId
      }
    })

    if (!activity) {
      return {
        success: false,
        message: 'No tienes permiso para adjuntar archivos a esta actividad'
      }
    }

    if (!files || files.length === 0) {
      return {
        success: false,
        message: 'No se proporcionaron archivos'
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

    // Subir archivos a Cloudinary
    const uploadedFiles: Array<{
      fileName: string
      fileUrl: string
      fileType: string
      fileSize: number
    }> = []

    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const resourceType = file.type.startsWith('image/') ? 'image' : 'raw'

        const result = await new Promise<{
          secure_url: string
          public_id: string
          format: string
          bytes: number
        }>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: `tareas/materiales/${activity.course_id}/${activityId}`,
              resource_type: resourceType,
              public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}`,
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

    // Guardar en la base de datos
    const attachments = await prisma.activity_attachment.createMany({
      data: uploadedFiles.map(file => ({
        activity_id: activityId,
        file_name: file.fileName,
        file_url: file.fileUrl,
        file_type: file.fileType,
        file_size: file.fileSize
      }))
    })

    revalidatePath(`/teacher/courses/${activity.course_id}`)

    return {
      success: true,
      message: `${uploadedFiles.length} archivo(s) subido(s) exitosamente`,
      files: uploadedFiles
    }
  } catch (error) {
    console.error('Error uploading attachments:', error)
    return {
      success: false,
      message: 'Error al subir los archivos'
    }
  }
}

/**
 * Eliminar un archivo adjunto de una actividad
 */
export async function deleteActivityAttachment(attachmentId: number, teacherId: number) {
  try {
    // Verificar que el archivo pertenezca a una actividad del profesor
    const attachment = await prisma.activity_attachment.findFirst({
      where: {
        id: attachmentId,
        activity: {
          created_by: teacherId
        }
      },
      include: {
        activity: {
          select: {
            course_id: true
          }
        }
      }
    })

    if (!attachment) {
      return {
        success: false,
        message: 'No tienes permiso para eliminar este archivo'
      }
    }

    // Intentar eliminar de Cloudinary
    try {
      // Extraer el public_id de la URL
      const urlParts = attachment.file_url.split('/')
      const publicIdWithExtension = urlParts.slice(-4).join('/') // tareas/materiales/courseId/activityId/filename
      const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '')
      
      const resourceType = attachment.file_type.startsWith('image/') ? 'image' : 'raw'
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
    } catch (cloudinaryError) {
      console.warn('Error eliminando de Cloudinary:', cloudinaryError)
      // Continuar aunque falle Cloudinary
    }

    // Eliminar de la base de datos
    await prisma.activity_attachment.delete({
      where: { id: attachmentId }
    })

    revalidatePath(`/teacher/courses/${attachment.activity.course_id}`)

    return {
      success: true,
      message: 'Archivo eliminado exitosamente'
    }
  } catch (error) {
    console.error('Error deleting attachment:', error)
    return {
      success: false,
      message: 'Error al eliminar el archivo'
    }
  }
}

// ============================================
// ENTREGAS - PROFESOR
// ============================================

/**
 * Obtener todas las entregas de una actividad
 */
export async function getActivitySubmissions(activityId: number, teacherId: number) {
  try {
    // Verificar que el profesor tenga acceso
    const activity = await prisma.course_activity.findFirst({
      where: {
        id: activityId,
        created_by: teacherId
      },
      select: {
        id: true,
        title: true,
        total_points: true,
        activity_type: true
      }
    })

    if (!activity) {
      throw new Error('No tienes acceso a esta actividad')
    }

    const submissions = await prisma.activity_submission.findMany({
      where: {
        activity_id: activityId
      },
      include: {
        student: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
                email: true
              }
            }
          }
        },
        files: true,
        grader: {
          select: {
            id_profesor: true,
            nombre: true,
            paterno: true
          }
        },
        activity: {
          select: {
            title: true,
            total_points: true,
            activity_type: true
          }
        }
      },
      orderBy: {
        submitted_at: 'desc'
      }
    })

    return submissions
  } catch (error) {
    console.error('Error fetching submissions:', error)
    throw error
  }
}

/**
 * Calificar una entrega
 */
/**
 * Calificar una entrega de estudiante
 */
export async function gradeSubmission(
  submissionId: number,
  data: GradeSubmissionInput,
  teacherId: number
) {
  try {
    const submission = await prisma.activity_submission.findUnique({
      where: { id: submissionId },
      include: {
        activity: {
          select: {
            created_by: true,
            total_points: true,
            course_id: true
          }
        },
        student: {
          include: {
            usuario: true
          }
        },
        files: true,
        grader: true
      }
    })

    if (!submission) {
      return {
        success: false,
        message: 'Entrega no encontrada'
      }
    }

    // Verificar que el profesor tenga acceso
    if (submission.activity.created_by !== teacherId) {
      return {
        success: false,
        message: 'No tienes permiso para calificar esta entrega'
      }
    }

    // Validar puntaje
    if (data.score < 0 || data.score > submission.activity.total_points) {
      return {
        success: false,
        message: `El puntaje debe estar entre 0 y ${submission.activity.total_points}`
      }
    }

    // Siempre marcar como GRADED cuando se califica (ignorar status enviado)
    const graded = await prisma.activity_submission.update({
      where: { id: submissionId },
      data: {
        score: data.score,
        feedback: data.feedback,
        graded_by: teacherId,
        graded_at: new Date(),
        status: 'GRADED' // Siempre GRADED al calificar
      },
      include: {
        student: {
          include: {
            usuario: true
          }
        },
        files: true,
        grader: true,
        activity: {
          select: {
            title: true,
            total_points: true,
            activity_type: true
          }
        }
      }
    })

    // Revalidar rutas del profesor y estudiante
    revalidatePath(`/teacher/courses/${submission.activity.course_id}`)
    revalidatePath(`/Students/courses/${submission.activity.course_id}`)

    return {
      success: true,
      submission: graded,
      message: 'Entrega calificada exitosamente'
    }
  } catch (error) {
    console.error('Error grading submission:', error)
    return {
      success: false,
      message: 'Error al calificar la entrega'
    }
  }
}

/**
 * Obtener estadísticas de una actividad
 */
export async function getActivityStats(activityId: number, teacherId: number): Promise<ActivityStats | null> {
  try {
    const activity = await prisma.course_activity.findFirst({
      where: {
        id: activityId,
        created_by: teacherId
      },
      include: {
        course: {
          include: {
            inscripciones: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        },
        submissions: {
          where: {
            attempt_number: 1 // Solo primera entrega
          }
        }
      }
    })

    if (!activity) {
      return null
    }

    const total_students = activity.course.inscripciones.length
    const submissions = activity.submissions
    
    const submitted = submissions.filter(s => s.status !== 'DRAFT' && s.status !== 'MISSING').length
    const graded = submissions.filter(s => s.status === 'GRADED').length
    const late = submissions.filter(s => s.is_late).length
    const pending = submitted - graded
    const missing = total_students - submitted

    const gradedScores = submissions.filter(s => s.score !== null).map(s => s.score as number)
    const average_score = gradedScores.length > 0
      ? gradedScores.reduce((a, b) => a + b, 0) / gradedScores.length
      : undefined

    return {
      total_students,
      submitted,
      pending,
      graded,
      late,
      missing,
      average_score
    }
  } catch (error) {
    console.error('Error fetching activity stats:', error)
    return null
  }
}

// ============================================
// ACTIVIDADES - ESTUDIANTE
// ============================================

/**
 * Obtener actividades de un curso para un estudiante
 */
export async function getStudentCourseActivities(courseId: number, studentId: number) {
  try {
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

    const activities = await prisma.course_activity.findMany({
      where: {
        course_id: courseId,
        is_published: true
      },
      include: {
        attachments: true,
        submissions: {
          where: {
            student_id: studentId,
            enrollment_id: enrollment.id
          },
          orderBy: {
            attempt_number: 'desc'
          },
          take: 1
        }
      },
      orderBy: [
        { due_date: 'asc' },
        { created_at: 'desc' }
      ]
    })

    return activities
  } catch (error) {
    console.error('Error fetching student activities:', error)
    throw error
  }
}

/**
 * Crear/actualizar entrega de estudiante
 */
export async function submitActivity(data: CreateSubmissionInput) {
  try {
    // Verificar inscripción y actividad
    const [enrollment, activity] = await Promise.all([
      prisma.inscripcion.findFirst({
        where: {
          id: data.enrollment_id,
          student_id: data.student_id,
          status: 'ACTIVE'
        }
      }),
      prisma.course_activity.findUnique({
        where: { id: data.activity_id }
      })
    ])

    if (!enrollment || !activity) {
      return {
        success: false,
        message: 'No tienes acceso a esta actividad'
      }
    }

    // Verificar intentos
    const existingSubmissions = await prisma.activity_submission.count({
      where: {
        activity_id: data.activity_id,
        student_id: data.student_id
      }
    })

    if (activity.max_attempts && existingSubmissions >= activity.max_attempts) {
      return {
        success: false,
        message: `Has alcanzado el número máximo de intentos (${activity.max_attempts})`
      }
    }

    // Verificar si es tarde
    const now = new Date()
    const isLate = activity.due_date ? now > activity.due_date : false

    if (isLate && !activity.allow_late) {
      return {
        success: false,
        message: 'La fecha de entrega ha expirado'
      }
    }

    const submission = await prisma.activity_submission.create({
      data: {
        activity_id: data.activity_id,
        student_id: data.student_id,
        enrollment_id: data.enrollment_id,
        submission_text: data.submission_text,
        attempt_number: data.attempt_number || existingSubmissions + 1,
        is_late: isLate,
        status: 'SUBMITTED'
      }
    })

    return {
      success: true,
      submission,
      message: 'Entrega enviada exitosamente'
    }
  } catch (error) {
    console.error('Error submitting activity:', error)
    return {
      success: false,
      message: 'Error al enviar la entrega'
    }
  }
}
