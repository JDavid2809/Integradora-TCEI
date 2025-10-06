"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"

export async function enrollInCourse(courseId: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("Usuario no autenticado")
    }

    // Buscar el estudiante
    const estudiante = await prisma.estudiante.findUnique({
      where: { id_usuario: +session.user.id }
    })

    if (!estudiante) {
      throw new Error("Estudiante no encontrado")
    }

    // Verificar si ya está inscrito en tabla Inscripcion
    const existingEnrollment = await prisma.inscripcion.findUnique({
      where: {
        student_id_course_id: {
          student_id: estudiante.id_estudiante,
          course_id: courseId
        }
      }
    })

    if (existingEnrollment) {
      throw new Error("Ya estás inscrito en este curso")
    }

    // Crear la inscripción en tabla Inscripcion
    const enrollment = await prisma.inscripcion.create({
      data: {
        student_id: estudiante.id_estudiante,
        course_id: courseId,
        status: "ACTIVE",
        payment_status: "PENDING",
        notes: "Inscripción automática",
      }
    })

    return { success: true, enrollment }
  } catch (error) {
    console.error('Error enrolling in course:', error)
    throw error
  }
}

export async function getStudentEnrollments(studentId?: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id && !studentId) {
      throw new Error("Usuario no autenticado")
    }

    let estudianteId = studentId
    if (!estudianteId) {
      const estudiante = await prisma.estudiante.findUnique({
        where: { id_usuario: +session!.user.id }
      })
      estudianteId = estudiante?.id_estudiante
    }

    if (!estudianteId) {
      throw new Error("Estudiante no encontrado")
    }

    // Obtener inscripciones de tabla Inscripcion
    const enrollments = await prisma.inscripcion.findMany({
      where: { 
        student_id: estudianteId,
        status: "ACTIVE" // Solo inscripciones activas
      },
      include: {
        course: {
          include: {
            imparte: {
              include: {
                profesor: {
                  include: {
                    usuario: true
                  }
                },
                nivel: true,
              }
            }
          }
        }
      }
    })

    return enrollments
  } catch (error) {
    console.error('Error getting student enrollments:', error)
    throw error
  }
}