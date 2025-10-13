'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function enrollInCourse(courseId: number) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar que el usuario está autenticado
    if (!session?.user) {
      return {
        success: false,
        error: 'Debes estar autenticado'
      }
    }

    // Los profesores no pueden inscribirse en cursos
    if (session.user.extra?.id_profesor) {
      return {
        success: false,
        error: 'Los profesores no pueden inscribirse en cursos'
      }
    }

    // Los administradores no pueden inscribirse en cursos
    if (session.user.extra?.id_admin) {
      return {
        success: false,
        error: 'Los administradores no pueden inscribirse en cursos'
      }
    }

    // Debe ser un estudiante
    if (!session.user.extra?.id_estudiante) {
      return {
        success: false,
        error: 'Debes estar autenticado como estudiante'
      }
    }

    const studentId = session.user.extra.id_estudiante

    // Verificar que el curso existe y obtener información del creador
    const course = await prisma.curso.findUnique({
      where: { id_curso: courseId },
      include: {
        creator: {
          include: {
            usuario: true
          }
        }
      }
    })

    if (!course) {
      return {
        success: false,
        error: 'Curso no encontrado'
      }
    }

    // Verificar que el estudiante no es el creador del curso
    if (course.creator && session.user.extra.id_usuario === course.creator.usuario.id) {
      return {
        success: false,
        error: 'No puedes inscribirte en un curso que tú mismo creaste'
      }
    }

    // Verificar si ya está inscrito (cualquier estado)
    const existing = await prisma.inscripcion.findFirst({
      where: {
        student_id: studentId,
        course_id: courseId
      }
    })

    console.log('🔍 Verificando inscripción existente:', {
      studentId,
      courseId,
      exists: !!existing,
      status: existing?.status
    })

    if (existing) {
      // Si existe pero está DROPPED, reactivar
      if (existing.status === 'DROPPED') {
        const reactivated = await prisma.inscripcion.update({
          where: { id: existing.id },
          data: { 
            status: 'ACTIVE',
            enrolled_at: new Date()
          }
        })
        
        console.log('✅ Inscripción reactivada:', reactivated.id)
        
        revalidatePath('/Courses')
        return {
          success: true,
          message: 'Inscripción reactivada exitosamente',
          alreadyEnrolled: false
        }
      }
      
      // Si ya está activa
      return {
        success: true,
        message: 'Ya estás inscrito en este curso',
        alreadyEnrolled: true
      }
    }

    // Crear inscripción
    const inscription = await prisma.inscripcion.create({
      data: {
        student_id: studentId,
        course_id: courseId,
        status: 'ACTIVE',
        payment_status: 'PENDING'
      }
    })

    console.log('✅ Nueva inscripción creada:', {
      id: inscription.id,
      studentId: inscription.student_id,
      courseId: inscription.course_id
    })

    revalidatePath('/Courses')

    return {
      success: true,
      message: 'Inscripción exitosa',
      inscription: inscription
    }

  } catch (error) {
    console.error('❌ Error en inscripción:', error)
    return {
      success: false,
      error: 'Error al procesar inscripción: ' + (error as Error).message
    }
  }
}