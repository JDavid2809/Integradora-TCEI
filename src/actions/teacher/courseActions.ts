'use server'

import { prisma } from '@/lib/prisma'
import { 
  CourseCreationData, 
  CourseActionResult, 
  CourseListResult,
  TeacherCourseStats,
  TeacherCourseListItem,
  CourseWithDetails
} from '@/types/course-creation'
import { revalidatePath } from 'next/cache'

// ========================================
// HELPER FUNCTIONS
// ========================================

function validateCourseData(data: CourseCreationData): string[] {
  const errors: string[] = []
  
  if (!data.basicInfo.nombre?.trim()) {
    errors.push('El nombre del curso es requerido')
  }
  
  if (!data.basicInfo.descripcion?.trim()) {
    errors.push('La descripción del curso es requerida')
  }
  
  if (!data.basicInfo.resumen?.trim()) {
    errors.push('El resumen del curso es requerido')
  }
  
  if (!data.basicInfo.inicio) {
    errors.push('La fecha de inicio es requerida')
  }
  
  if (!data.basicInfo.fin) {
    errors.push('La fecha de fin es requerida')
  }
  
  if (data.basicInfo.inicio && data.basicInfo.fin) {
    const startDate = new Date(data.basicInfo.inicio)
    const endDate = new Date(data.basicInfo.fin)
    
    if (startDate >= endDate) {
      errors.push('La fecha de fin debe ser posterior a la fecha de inicio')
    }
  }
  
  if (data.details.whatYouLearn.length === 0) {
    errors.push('Debe agregar al menos un elemento a "Lo que aprenderás"')
  }
  
  if (data.details.requirements.length === 0) {
    errors.push('Debe agregar al menos un requisito')
  }
  
  return errors
}

function calculateCourseStatus(curso: {
  b_activo: boolean | null;
  inicio: Date | null;
  fin: Date | null;
}): 'draft' | 'active' | 'completed' | 'suspended' {
  if (!curso.b_activo) return 'suspended'
  if (!curso.inicio || !curso.fin) return 'draft'
  
  const now = new Date()
  const start = new Date(curso.inicio)
  const end = new Date(curso.fin)
  
  if (now < start) return 'draft'
  if (now > end) return 'completed'
  return 'active'
}

// ========================================
// CREATE COURSE
// ========================================

export async function createCourse(
  data: CourseCreationData,
  teacherId: number
): Promise<CourseActionResult> {
  try {
    // Validar datos
    const validationErrors = validateCourseData(data)
    if (validationErrors.length > 0) {
      return {
        success: false,
        message: 'Errores de validación',
        errors: { general: validationErrors }
      }
    }

    // Verificar que el profesor existe
    const teacher = await prisma.profesor.findUnique({
      where: { id_profesor: teacherId }
    })

    if (!teacher) {
      return {
        success: false,
        message: 'Profesor no encontrado'
      }
    }

    // Crear el curso
    const course = await prisma.curso.create({
      data: {
        nombre: data.basicInfo.nombre.trim(),
        slug: data.basicInfo.nombre.trim().toLowerCase()
          .replace(/[áàäâ]/g, 'a')
          .replace(/[éèëê]/g, 'e')
          .replace(/[íìïî]/g, 'i')
          .replace(/[óòöô]/g, 'o')
          .replace(/[úùüû]/g, 'u')
          .replace(/ñ/g, 'n')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/[\s-]+/g, '-')
          .replace(/^-+|-+$/g, ''),
        descripcion: data.basicInfo.descripcion.trim(),
        resumen: data.basicInfo.resumen.trim(),
        modalidad: data.basicInfo.modalidad,
        inicio: new Date(data.basicInfo.inicio),
        fin: new Date(data.basicInfo.fin),
        precio: data.basicInfo.precio || null,
        nivel_ingles: data.basicInfo.nivel_ingles || null,
        imagen_url: data.basicInfo.imagen_url || null,
        video_url: data.basicInfo.video_url || null,
        what_you_learn: JSON.stringify(data.details.whatYouLearn),
        features: JSON.stringify(data.details.features),
        requirements: JSON.stringify(data.details.requirements),
        target_audience: JSON.stringify(data.details.targetAudience),
        course_content: JSON.stringify(data.details.courseContent),
        created_by: teacherId,
        b_activo: true
      },
      include: {
        creator: {
          include: {
            usuario: true
          }
        },
        _count: {
          select: {
            inscripciones: true,
            imparte: true
          }
        }
      }
    })

    revalidatePath('/Teachers')
    
    return {
      success: true,
      message: 'Curso creado exitosamente',
      data: {
        ...course,
        precio: course.precio ? Number(course.precio) : null
      }
    }
  } catch (error) {
    console.error('Error creating course:', error)
    return {
      success: false,
      message: 'Error interno del servidor al crear el curso'
    }
  }
}

// ========================================
// GET TEACHER COURSES
// ========================================

export async function getTeacherCourses(teacherId: number): Promise<CourseListResult> {
  try {
    // Obtener cursos del profesor
    const courses = await prisma.curso.findMany({
      where: {
        created_by: teacherId
      },
      include: {
        _count: {
          select: {
            inscripciones: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Transformar datos
    const courseList: TeacherCourseListItem[] = courses.map(course => ({
      id_curso: course.id_curso,
      nombre: course.nombre,
      descripcion: course.descripcion,
      modalidad: course.modalidad,
      inicio: course.inicio,
      fin: course.fin,
      b_activo: course.b_activo,
      created_at: course.created_at,
      studentCount: course._count.inscripciones,
      status: calculateCourseStatus(course)
    }))

    // Calcular estadísticas
    const stats: TeacherCourseStats = {
      totalCourses: courses.length,
      activeCourses: courseList.filter(c => c.status === 'active').length,
      totalStudents: courses.reduce((sum, course) => sum + course._count.inscripciones, 0),
      pendingApprovals: courseList.filter(c => c.status === 'draft').length
    }

    return {
      success: true,
      courses: courseList,
      stats
    }
  } catch (error) {
    console.error('Error fetching teacher courses:', error)
    return {
      success: false,
      courses: [],
      stats: {
        totalCourses: 0,
        activeCourses: 0,
        totalStudents: 0,
        pendingApprovals: 0
      },
      message: 'Error al cargar los cursos'
    }
  }
}

// ========================================
// GET COURSE DETAILS
// ========================================

export async function getCourseDetails(courseId: number, teacherId: number): Promise<CourseWithDetails | null> {
  try {
    const course = await prisma.curso.findFirst({
      where: {
        id_curso: courseId,
        created_by: teacherId
      },
      include: {
        creator: {
          include: {
            usuario: true
          }
        },
        inscripciones: {
          where: {
            status: {
              in: ['ACTIVE', 'SUSPENDED']
            }
          },
          include: {
            student: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true
                  }
                }
              }
            },
            payments: {
              orderBy: {
                payment_date: 'desc'
              },
              take: 1
            },
            attendance: {
              orderBy: {
                class_date: 'desc'
              },
              take: 5
            }
          },
          orderBy: {
            enrolled_at: 'desc'
          }
        },
        _count: {
          select: {
            inscripciones: true,
            imparte: true
          }
        }
      }
    })

    if (!course) return null

    // Parse JSON fields
    const courseWithDetails: CourseWithDetails = {
      ...course,
      precio: course.precio ? Number(course.precio) : null,
      whatYouLearnParsed: course.what_you_learn ? JSON.parse(course.what_you_learn) : [],
      featuresParsed: course.features ? JSON.parse(course.features) : [],
      requirementsParsed: course.requirements ? JSON.parse(course.requirements) : [],
      targetAudienceParsed: course.target_audience ? JSON.parse(course.target_audience) : [],
      courseContentParsed: course.course_content ? JSON.parse(course.course_content) : []
    }

    return courseWithDetails
  } catch (error) {
    console.error('Error fetching course details:', error)
    return null
  }
}

// ========================================
// UPDATE COURSE
// ========================================

export async function updateCourse(
  courseId: number,
  data: CourseCreationData,
  teacherId: number
): Promise<CourseActionResult> {
  try {
    // Validar datos
    const validationErrors = validateCourseData(data)
    if (validationErrors.length > 0) {
      return {
        success: false,
        message: 'Errores de validación',
        errors: { general: validationErrors }
      }
    }

    // Verificar que el curso pertenece al profesor
    const existingCourse = await prisma.curso.findFirst({
      where: {
        id_curso: courseId,
        created_by: teacherId
      }
    })

    if (!existingCourse) {
      return {
        success: false,
        message: 'Curso no encontrado o no tienes permisos para editarlo'
      }
    }

    // Actualizar el curso
    const updatedCourse = await prisma.curso.update({
      where: {
        id_curso: courseId
      },
      data: {
        nombre: data.basicInfo.nombre.trim(),
        descripcion: data.basicInfo.descripcion.trim(),
        resumen: data.basicInfo.resumen.trim(),
        modalidad: data.basicInfo.modalidad,
        inicio: new Date(data.basicInfo.inicio),
        fin: new Date(data.basicInfo.fin),
        precio: data.basicInfo.precio || null,
        nivel_ingles: data.basicInfo.nivel_ingles || null,
        imagen_url: data.basicInfo.imagen_url || null,
        video_url: data.basicInfo.video_url || null,
        what_you_learn: JSON.stringify(data.details.whatYouLearn),
        features: JSON.stringify(data.details.features),
        requirements: JSON.stringify(data.details.requirements),
        target_audience: JSON.stringify(data.details.targetAudience),
        course_content: JSON.stringify(data.details.courseContent)
      },
      include: {
        creator: {
          include: {
            usuario: true
          }
        },
        _count: {
          select: {
            inscripciones: true,
            imparte: true
          }
        }
      }
    })

    revalidatePath('/Teachers')
    
    return {
      success: true,
      message: 'Curso actualizado exitosamente',
      data: {
        ...updatedCourse,
        precio: updatedCourse.precio ? Number(updatedCourse.precio) : null
      }
    }
  } catch (error) {
    console.error('Error updating course:', error)
    return {
      success: false,
      message: 'Error interno del servidor al actualizar el curso'
    }
  }
}

// ========================================
// TOGGLE COURSE STATUS
// ========================================

export async function toggleCourseStatus(
  courseId: number,
  teacherId: number
): Promise<CourseActionResult> {
  try {
    // Verificar que el curso pertenece al profesor
    const existingCourse = await prisma.curso.findFirst({
      where: {
        id_curso: courseId,
        created_by: teacherId
      }
    })

    if (!existingCourse) {
      return {
        success: false,
        message: 'Curso no encontrado o no tienes permisos para modificarlo'
      }
    }

    // Cambiar el estado
    const updatedCourse = await prisma.curso.update({
      where: {
        id_curso: courseId
      },
      data: {
        b_activo: !existingCourse.b_activo
      },
      include: {
        creator: {
          include: {
            usuario: true
          }
        },
        _count: {
          select: {
            inscripciones: true,
            imparte: true
          }
        }
      }
    })

    revalidatePath('/Teachers')
    
    return {
      success: true,
      message: `Curso ${updatedCourse.b_activo ? 'activado' : 'desactivado'} exitosamente`,
      data: {
        ...updatedCourse,
        precio: updatedCourse.precio ? Number(updatedCourse.precio) : null
      }
    }
  } catch (error) {
    console.error('Error toggling course status:', error)
    return {
      success: false,
      message: 'Error interno del servidor al cambiar el estado del curso'
    }
  }
}

// ========================================
// DELETE COURSE
// ========================================

export async function deleteCourse(
  courseId: number,
  teacherId: number
): Promise<CourseActionResult> {
  try {
    // Verificar que el curso pertenece al profesor
    const existingCourse = await prisma.curso.findFirst({
      where: {
        id_curso: courseId,
        created_by: teacherId
      },
      include: {
        inscripciones: true,
        imparte: true
      }
    })

    if (!existingCourse) {
      return {
        success: false,
        message: 'Curso no encontrado o no tienes permisos para eliminarlo'
      }
    }

    // Verificar si hay estudiantes inscritos
    if (existingCourse.inscripciones.length > 0) {
      return {
        success: false,
        message: 'No se puede eliminar el curso porque tiene estudiantes inscritos'
      }
    }

    // Verificar si hay relaciones imparte
    if (existingCourse.imparte.length > 0) {
      return {
        success: false,
        message: 'No se puede eliminar el curso porque tiene clases programadas'
      }
    }

    // Eliminar el curso
    await prisma.curso.delete({
      where: {
        id_curso: courseId
      }
    })

    return {
      success: true,
      message: 'Curso eliminado exitosamente'
    }
  } catch (error) {
    console.error('Error deleting course:', error)
    return {
      success: false,
      message: 'Error interno del servidor al eliminar el curso'
    }
  }
}