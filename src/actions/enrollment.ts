'use server'

import { prisma } from '@/lib/prisma'
import { generateCertificate } from './certificates'

/**
 * Actualiza el estado de una inscripción y genera certificado si se completa
 */
export async function updateEnrollmentStatus(
  inscripcionId: number,
  newStatus: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'SUSPENDED' | 'TRANSFERRED'
) {
  try {
    // Actualizar el estado
    const inscripcion = await prisma.inscripcion.update({
      where: { id: inscripcionId },
      data: { status: newStatus },
      include: {
        course: true,
        student: true
      }
    })

    // Si el estado cambia a COMPLETED, generar certificado automáticamente
    if (newStatus === 'COMPLETED') {
      // Verificar si el curso otorga certificado
      if (inscripcion.course.certificado) {
        const certResult = await generateCertificate({ inscripcionId })
        
        if (certResult.success) {
          console.log(`✅ Certificado generado automáticamente para inscripción ${inscripcionId}`)
          return {
            success: true,
            data: inscripcion,
            certificate: certResult.data
          }
        } else {
          console.error(`❌ Error al generar certificado: ${certResult.error}`)
        }
      }
    }

    return {
      success: true,
      data: inscripcion
    }
  } catch (error) {
    console.error('Error al actualizar inscripción:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Marca un curso como completado (calcula si cumple requisitos)
 */
export async function completeCourse(inscripcionId: number) {
  try {
    // Aquí puedes agregar lógica adicional para verificar:
    // - Asistencia mínima
    // - Actividades completadas
    // - Exámenes aprobados
    // etc.

    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id: inscripcionId },
      include: {
        attendance: true,
        submissions: {
          where: {
            status: 'GRADED'
          }
        }
      }
    })

    if (!inscripcion) {
      return { success: false, error: 'Inscripción no encontrada' }
    }

    // Ejemplo de validación: verificar que tenga asistencias registradas
    // Puedes personalizar estas reglas según tus necesidades
    const hasAttendance = inscripcion.attendance.length > 0
    const hasSubmissions = inscripcion.submissions.length > 0

    if (!hasAttendance && !hasSubmissions) {
      return {
        success: false,
        error: 'El estudiante no tiene actividad registrada en el curso'
      }
    }

    // Actualizar a completado y generar certificado
    return await updateEnrollmentStatus(inscripcionId, 'COMPLETED')
  } catch (error) {
    console.error('Error al completar curso:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Verifica si un estudiante puede obtener certificado
 * Ahora también verifica que todas las actividades estén calificadas y aprobadas
 */
export async function canGetCertificate(inscripcionId: number) {
  try {
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id: inscripcionId },
      include: {
        course: {
          include: {
            activities: {
              where: {
                is_published: true
              }
            }
          }
        },
        certificado: true,
        submissions: {
          include: {
            activity: true
          }
        }
      }
    })

    if (!inscripcion) {
      return { success: false, canGet: false, reason: 'Inscripción no encontrada' }
    }

    // Ya tiene certificado
    if (inscripcion.certificado) {
      return {
        success: true,
        canGet: false,
        reason: 'Ya tiene un certificado emitido',
        hasExisting: true,
        certificateUrl: `/certificate/${inscripcion.certificado.token_uuid}`
      }
    }

    // El curso no otorga certificado
    if (!inscripcion.course.certificado) {
      return {
        success: true,
        canGet: false,
        reason: 'Este curso no otorga certificado'
      }
    }

    // Verificar actividades
    const publishedActivities = inscripcion.course.activities
    const totalActivities = publishedActivities.length

    // Si no hay actividades, el curso se puede completar
    if (totalActivities === 0) {
      // Si ya está completado, puede obtener certificado
      if (inscripcion.status === 'COMPLETED') {
        return {
          success: true,
          canGet: true,
          reason: 'Puede obtener el certificado',
          progress: {
            total: 0,
            submitted: 0,
            graded: 0,
            passed: 0,
            percentage: 100
          }
        }
      }
      return {
        success: true,
        canGet: false,
        reason: `El curso no está completado (estado: ${inscripcion.status})`,
        progress: {
          total: 0,
          submitted: 0,
          graded: 0,
          passed: 0,
          percentage: 0
        }
      }
    }

    // Obtener el mejor intento de cada actividad
    const submissionsByActivity = new Map<number, typeof inscripcion.submissions[0]>()
    
    for (const submission of inscripcion.submissions) {
      const existing = submissionsByActivity.get(submission.activity_id)
      // Guardar la entrega con mejor calificación o la más reciente calificada
      if (!existing || 
          (submission.status === 'GRADED' && existing.status !== 'GRADED') ||
          (submission.status === 'GRADED' && existing.status === 'GRADED' && 
           (submission.score || 0) > (existing.score || 0))) {
        submissionsByActivity.set(submission.activity_id, submission)
      }
    }

    // Calcular estadísticas
    let submitted = 0
    let graded = 0
    let passed = 0

    for (const activity of publishedActivities) {
      const submission = submissionsByActivity.get(activity.id)
      
      if (submission) {
        submitted++
        
        if (submission.status === 'GRADED') {
          graded++
          
          // Verificar si aprobó (score >= min_passing_score o >= 60% si no hay mínimo)
          const minScore = activity.min_passing_score || Math.floor(activity.total_points * 0.6)
          if (submission.score !== null && submission.score >= minScore) {
            passed++
          }
        }
      }
    }

    const percentage = totalActivities > 0 ? Math.round((passed / totalActivities) * 100) : 0

    // Si todas las actividades están aprobadas
    const allPassed = passed === totalActivities && totalActivities > 0

    if (allPassed) {
      return {
        success: true,
        canGet: true,
        reason: '¡Felicidades! Has aprobado todas las actividades',
        progress: {
          total: totalActivities,
          submitted,
          graded,
          passed,
          percentage
        }
      }
    }

    // Construir mensaje descriptivo
    let reason = ''
    if (graded < totalActivities) {
      const pendingGrade = totalActivities - graded
      reason = `Faltan ${pendingGrade} ${pendingGrade === 1 ? 'actividad' : 'actividades'} por calificar`
    } else if (passed < totalActivities) {
      const notPassed = totalActivities - passed
      reason = `No has aprobado ${notPassed} ${notPassed === 1 ? 'actividad' : 'actividades'}`
    } else if (submitted < totalActivities) {
      const notSubmitted = totalActivities - submitted
      reason = `Faltan ${notSubmitted} ${notSubmitted === 1 ? 'entrega' : 'entregas'} por enviar`
    }

    return {
      success: true,
      canGet: false,
      reason,
      progress: {
        total: totalActivities,
        submitted,
        graded,
        passed,
        percentage
      }
    }
  } catch (error) {
    console.error('Error al verificar elegibilidad:', error)
    return {
      success: false,
      canGet: false,
      reason: 'Error al verificar'
    }
  }
}
