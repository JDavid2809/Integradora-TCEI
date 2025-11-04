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
 */
export async function canGetCertificate(inscripcionId: number) {
  try {
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id: inscripcionId },
      include: {
        course: true,
        certificado: true
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
        hasExisting: true
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

    // No está completado
    if (inscripcion.status !== 'COMPLETED') {
      return {
        success: true,
        canGet: false,
        reason: `El curso no está completado (estado: ${inscripcion.status})`
      }
    }

    return {
      success: true,
      canGet: true,
      reason: 'Puede obtener el certificado'
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
