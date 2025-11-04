'use server'

import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

interface GenerateCertificateParams {
  inscripcionId: number
}

interface CertificateData {
  token: string
  url: string
  codigo: string
}

/**
 * Genera un certificado para un estudiante al completar un curso
 */
export async function generateCertificate(
  params: GenerateCertificateParams
): Promise<{ success: boolean; data?: CertificateData; error?: string }> {
  try {
    const { inscripcionId } = params

    // Verificar que la inscripción existe y está completada
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id: inscripcionId },
      include: {
        student: {
          include: {
            usuario: true
          }
        },
        course: {
          include: {
            creator: true
          }
        }
      }
    })

    if (!inscripcion) {
      return { success: false, error: 'Inscripción no encontrada' }
    }

    // Verificar que el curso esté completado
    if (inscripcion.status !== 'COMPLETED') {
      return { success: false, error: 'El curso no ha sido completado' }
    }

    // Verificar que el curso otorga certificado
    if (!inscripcion.course.certificado) {
      return { success: false, error: 'Este curso no otorga certificado' }
    }

    // Verificar si ya existe un certificado para esta inscripción
    const certificadoExistente = await prisma.certificado.findUnique({
      where: { inscripcion_id: inscripcionId }
    })

    if (certificadoExistente) {
      // Si ya existe, devolver la información del certificado existente
      return {
        success: true,
        data: {
          token: certificadoExistente.token_uuid,
          url: certificadoExistente.url_verificacion,
          codigo: certificadoExistente.codigo_verificacion
        }
      }
    }

    // Generar código de verificación corto (8 caracteres alfanuméricos)
    const codigoVerificacion = randomBytes(4).toString('hex').toUpperCase()

    // Crear el certificado
    const certificado = await prisma.certificado.create({
      data: {
        estudiante_id: inscripcion.student_id,
        curso_id: inscripcion.course_id,
        inscripcion_id: inscripcionId,
        nombre_estudiante: `${inscripcion.student.nombre} ${inscripcion.student.paterno || ''} ${inscripcion.student.materno || ''}`.trim(),
        nombre_curso: inscripcion.course.nombre,
        nombre_instructor: inscripcion.course.creator
          ? `${inscripcion.course.creator.nombre} ${inscripcion.course.creator.paterno || ''}`.trim()
          : 'Instructor no disponible',
        duracion_horas: inscripcion.course.duracion_horas,
        nivel_ingles: inscripcion.course.nivel_ingles,
        fecha_inicio: inscripcion.enrolled_at,
        fecha_finalizacion: new Date(),
        codigo_verificacion: codigoVerificacion,
        url_verificacion: '' // Se actualizará después
      }
    })

    // Actualizar con la URL completa
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const urlVerificacion = `${baseUrl}/certificate/${certificado.token_uuid}`

    await prisma.certificado.update({
      where: { id: certificado.id },
      data: { url_verificacion: urlVerificacion }
    })

    return {
      success: true,
      data: {
        token: certificado.token_uuid,
        url: urlVerificacion,
        codigo: codigoVerificacion
      }
    }
  } catch (error) {
    console.error('Error al generar certificado:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al generar certificado'
    }
  }
}

/**
 * Obtiene los datos de un certificado por su token
 */
export async function getCertificateByToken(token: string) {
  try {
    const certificado = await prisma.certificado.findUnique({
      where: { token_uuid: token },
      include: {
        estudiante: {
          include: {
            usuario: true
          }
        },
        curso: true
      }
    })

    if (!certificado) {
      return { success: false, error: 'Certificado no encontrado' }
    }

    if (!certificado.es_valido) {
      return {
        success: false,
        error: 'Este certificado ha sido revocado',
        revocationReason: certificado.motivo_revocacion
      }
    }

    // Incrementar contador de vistas
    await prisma.certificado.update({
      where: { id: certificado.id },
      data: {
        veces_visto: { increment: 1 },
        ultima_visualizacion: new Date()
      }
    })

    return {
      success: true,
      data: certificado
    }
  } catch (error) {
    console.error('Error al obtener certificado:', error)
    return {
      success: false,
      error: 'Error al cargar el certificado'
    }
  }
}

/**
 * Verifica un certificado por su código de verificación
 */
export async function verifyCertificateByCode(codigo: string) {
  try {
    const certificado = await prisma.certificado.findUnique({
      where: { codigo_verificacion: codigo.toUpperCase() },
      include: {
        estudiante: true,
        curso: true
      }
    })

    if (!certificado) {
      return { success: false, error: 'Código de verificación no válido' }
    }

    return {
      success: true,
      data: {
        valido: certificado.es_valido,
        estudiante: certificado.nombre_estudiante,
        curso: certificado.nombre_curso,
        fecha_emision: certificado.fecha_emision,
        url: certificado.url_verificacion
      }
    }
  } catch (error) {
    console.error('Error al verificar certificado:', error)
    return {
      success: false,
      error: 'Error al verificar el certificado'
    }
  }
}

/**
 * Obtiene todos los certificados de un estudiante
 */
export async function getStudentCertificates(estudianteId: number) {
  try {
    const certificados = await prisma.certificado.findMany({
      where: {
        estudiante_id: estudianteId,
        es_valido: true
      },
      include: {
        curso: true
      },
      orderBy: {
        fecha_emision: 'desc'
      }
    })

    return {
      success: true,
      data: certificados
    }
  } catch (error) {
    console.error('Error al obtener certificados:', error)
    return {
      success: false,
      error: 'Error al cargar los certificados'
    }
  }
}

/**
 * Revoca un certificado (solo para administradores)
 */
export async function revokeCertificate(certificadoId: number, motivo: string) {
  try {
    await prisma.certificado.update({
      where: { id: certificadoId },
      data: {
        es_valido: false,
        fecha_revocacion: new Date(),
        motivo_revocacion: motivo
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error al revocar certificado:', error)
    return {
      success: false,
      error: 'Error al revocar el certificado'
    }
  }
}
