"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { revalidatePath } from 'next/cache'

// Definir los enums localmente como constantes (no exportadas)
const EnrollmentStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  DROPPED: 'DROPPED',
  SUSPENDED: 'SUSPENDED',
  TRANSFERRED: 'TRANSFERRED'
} as const

const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED'
} as const

// ================================
// FUNCIONES DE INSCRIPCIÓN MODERNA
// ================================

/**
 * Inscribir un estudiante en un curso usando la nueva estructura de Inscripcion
 */
export async function enrollStudentModern(courseId: number, userId?: string) {
  try {
    console.log('🚀 Iniciando inscripción moderna - courseId:', courseId, 'userId:', userId)
    
    const session = await getServerSession(authOptions)
    const targetUserId = userId || session?.user?.id
    
    if (!targetUserId) {
      throw new Error("Usuario no autenticado")
    }

    // Buscar el estudiante
    const estudiante = await prisma.estudiante.findUnique({
      where: { id_usuario: +targetUserId }
    })

    console.log('🔍 Estudiante encontrado:', estudiante?.nombre)

    if (!estudiante) {
      throw new Error("Estudiante no encontrado")
    }

    // Verificar que el curso existe
    const curso = await prisma.curso.findUnique({
      where: { id_curso: courseId, b_activo: true }
    })

    if (!curso) {
      throw new Error("Curso no encontrado o inactivo")
    }

    console.log('📚 Curso encontrado:', curso.nombre)

    // Verificar si ya está inscrito en la nueva tabla Inscripcion
    const existingInscripcion = await prisma.inscripcion.findUnique({
      where: {
        student_id_course_id: {
          student_id: estudiante.id_estudiante,
          course_id: courseId
        }
      }
    })

    if (existingInscripcion) {
      throw new Error("Ya estás inscrito en este curso")
    }

    console.log('✅ Usuario no está inscrito, procediendo con inscripción...')

    // Crear la inscripción SOLO en la tabla Inscripcion
    const inscripcion = await prisma.inscripcion.create({
      data: {
        student_id: estudiante.id_estudiante,
        course_id: courseId,
        status: EnrollmentStatus.ACTIVE,
        payment_status: PaymentStatus.PENDING,
        enrolled_at: new Date(),
        notes: "Inscripción automática desde el sistema web"
      }
    })

    console.log('🎉 Inscripción creada exitosamente en tabla Inscripcion:', inscripcion.id)

    return { success: true, inscripcion }
  } catch (error) {
    console.error('❌ Error enrolling student:', error)
    throw error
  }
}

/**
 * Verificar si un usuario está inscrito en un curso (nueva tabla Inscripcion)
 */
export async function isUserEnrolledModern(courseId: number, userId?: string): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    const targetUserId = userId || session?.user?.id
    
    if (!targetUserId) {
      return false
    }

    // Buscar el estudiante
    const estudiante = await prisma.estudiante.findUnique({
      where: { id_usuario: +targetUserId }
    })

    if (!estudiante) {
      return false
    }

    // Verificar si está inscrito SOLO en la tabla Inscripcion
    const inscripcion = await prisma.inscripcion.findUnique({
      where: {
        student_id_course_id: {
          student_id: estudiante.id_estudiante,
          course_id: courseId
        }
      }
    })

    if (inscripcion) {
      console.log('✅ Usuario encontrado en tabla Inscripcion:', inscripcion.status)
      return inscripcion.status === EnrollmentStatus.ACTIVE
    }

    console.log('❌ Usuario no encontrado en tabla Inscripcion')
    return false
  } catch (error) {
    console.error('❌ Error checking enrollment:', error)
    return false
  }
}

/**
 * Función de manejo completo de inscripción (simplificada)
 */
export async function handleCourseEnrollmentModern(courseId: number) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return {
        success: false,
        error: 'Debes iniciar sesión para inscribirte en un curso'
      }
    }

    // Verificar si ya está inscrito
    const isAlreadyEnrolled = await isUserEnrolledModern(courseId, session.user.id)
    
    if (isAlreadyEnrolled) {
      return {
        success: false,
        error: 'Ya estás inscrito en este curso'
      }
    }

    // Inscribir al estudiante
    const enrollmentResult = await enrollStudentModern(courseId, session.user.id)
    
    // Revalidar la página del curso para mostrar los datos actualizados
    revalidatePath(`/Courses/${courseId}`)
    
    return {
      success: true,
      message: '¡Inscripción exitosa! Te contactaremos pronto con más detalles.',
      inscripcion: enrollmentResult.inscripcion
    }
  } catch (error) {
    console.error('Error in modern course enrollment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al procesar la inscripción'
    }
  }
}

/**
 * Función de verificación de estado para el frontend
 */
export async function checkUserEnrollmentStatusModern(courseId: number) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return {
        isLoggedIn: false,
        isEnrolled: false
      }
    }

    const isEnrolled = await isUserEnrolledModern(courseId, session.user.id)
    
    return {
      isLoggedIn: true,
      isEnrolled,
      userId: session.user.id
    }
  } catch (error) {
    console.error('Error checking modern enrollment status:', error)
    return {
      isLoggedIn: false,
      isEnrolled: false
    }
  }
}