"use server"

import { enrollStudentInCourse, isUserEnrolledInCourse } from './manageCourses'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { revalidatePath } from 'next/cache'

export async function handleCourseEnrollment(courseId: number) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return {
        success: false,
        error: 'Debes iniciar sesión para inscribirte en un curso'
      }
    }

    // Verificar si ya está inscrito
    const isAlreadyEnrolled = await isUserEnrolledInCourse(courseId, session.user.id)
    
    if (isAlreadyEnrolled) {
      return {
        success: false,
        error: 'Ya estás inscrito en este curso'
      }
    }

    // Inscribir al estudiante
    const result = await enrollStudentInCourse(courseId, session.user.id)
    
    // Revalidar la página del curso para mostrar los datos actualizados
    revalidatePath(`/Courses/${courseId}`)
    
    return {
      success: true,
      message: '¡Inscripción exitosa! Te contactaremos pronto con más detalles.',
      enrollment: result.enrollment
    }
  } catch (error) {
    console.error('Error in course enrollment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al procesar la inscripción'
    }
  }
}

export async function checkUserEnrollmentStatus(courseId: number) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return {
        isLoggedIn: false,
        isEnrolled: false
      }
    }

    const isEnrolled = await isUserEnrolledInCourse(courseId, session.user.id)
    
    return {
      isLoggedIn: true,
      isEnrolled,
      userId: session.user.id
    }
  } catch (error) {
    console.error('Error checking enrollment status:', error)
    return {
      isLoggedIn: false,
      isEnrolled: false
    }
  }
}