"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { CourseSearchParams, PaginatedCourses } from "@/types/courses"
import { createSlug } from '@/lib/slugUtils'
import { redirect } from 'next/navigation'

// Caché para evitar JSON.parse repetitivos
const lessonCountCache = new Map<string, number>()

// Función para contar lecciones desde el contenido del curso
function countLessonsFromContent(courseContent: string | null, courseId?: number): number {
  if (!courseContent) return 0
  
  // Usar caché si hay courseId
  const cacheKey = courseId ? `course-${courseId}-lessons` : courseContent.substring(0, 50)
  if (lessonCountCache.has(cacheKey)) {
    return lessonCountCache.get(cacheKey)!
  }
  
  try {
    const content = JSON.parse(courseContent)
    let count = 0
    if (Array.isArray(content)) {
      count = content.reduce((total, module) => {
        if (module.lessons && Array.isArray(module.lessons)) {
          return total + module.lessons.length
        }
        // Si no hay estructura de lessons, contar el módulo como 1 lección
        return total + 1
      }, 0)
    }
    lessonCountCache.set(cacheKey, count)
    return count
  } catch {
    // Si no es JSON válido, retornar 0
    return 0
  }
}

// Interfaz para los filtros de búsqueda de cursos
interface CourseWhereClause {
  b_activo: boolean
  nombre?: {
    contains: string
    mode: 'insensitive'
  }
  modalidad?: 'PRESENCIAL' | 'ONLINE'
  imparte?: {
    some: {
      nivel: {
        nombre: string
      }
    }
  }
}

// Obtener cursos con paginación y filtros
export async function getPaginatedCourses(params: CourseSearchParams = {}): Promise<PaginatedCourses> {
  try {
    const { 
      search = '', 
      level = 'all', 
      modalidad = 'all', 
      page = 1, 
      limit = 6 
    } = params

    // Construir filtros dinámicos
    const whereClause: Partial<CourseWhereClause> & { b_activo: boolean } = {
      b_activo: true,
    }

    // Filtro por búsqueda (nombre del curso)
    if (search) {
      whereClause.nombre = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // Filtro por modalidad
    if (modalidad !== 'all' && (modalidad === 'PRESENCIAL' || modalidad === 'ONLINE')) {
      whereClause.modalidad = modalidad
    }

    // Filtro por nivel (a través de la relación con imparte -> nivel)
    if (level !== 'all') {
      whereClause.imparte = {
        some: {
          nivel: {
            nombre: level
          }
        }
      }
    }

    // Calcular offset para paginación
    const offset = (page - 1) * limit

    // Obtener total de registros para calcular páginas
    const totalCount = await prisma.curso.count({
      where: whereClause
    })

    // Obtener cursos paginados
    const cursos = await prisma.curso.findMany({
      where: whereClause,
      select: {
        id_curso: true,
        nombre: true,
        descripcion: true,
        resumen: true,
        modalidad: true,
        inicio: true,
        fin: true,
        precio: true,
        imagen_url: true,
        video_url: true,
        b_activo: true,
        course_content: true,
        imparte: {
          include: {
            profesor: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true,
                  }
                }
              }
            },
            nivel: true,
          }
        },
        _count: {
          select: {
            inscripciones: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      },
      orderBy: {
        inicio: 'desc'
      },
      skip: offset,
      take: limit
    })

    // Agregar lecciones calculadas a cada curso
    const cursosConLecciones = cursos.map(curso => ({
      ...curso,
      precio: curso.precio ? Number(curso.precio) : null,
      total_lecciones_calculadas: countLessonsFromContent(curso.course_content, curso.id_curso)
    }))

    // Calcular información de paginación
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      cursos: cursosConLecciones,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  } catch (error) {
    console.error('Error fetching paginated courses:', error)
    throw new Error('Error al obtener los cursos paginados')
  }
}

// Obtener un curso específico por ID
export async function getCourseById(courseId: number) {
  try {
    const curso = await prisma.curso.findUnique({
      where: {
        id_curso: courseId,
        b_activo: true,
      },
      include: {
        imparte: {
          include: {
            profesor: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true,
                    email: true,
                  }
                }
              }
            },
            nivel: true,
          }
        },
        horario: {
          include: {
            estudiante: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true,
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            horario: true, // Número de estudiantes inscritos
          }
        }
      }
    })

    if (!curso) {
      throw new Error('Curso no encontrado')
    }

    return curso
  } catch (error) {
    console.error('Error fetching course by ID:', error)
    throw new Error('Error al obtener el curso')
  }
}

// Obtener todos los cursos disponibles (para compatibilidad)
// ⚠️ DEPRECADO: Usar getPaginatedCourses o getCoursesForSelect
export async function getAllCourses() {
  try {
    const result = await getPaginatedCourses({ limit: 100 }) // Limitado para rendimiento
    return result.cursos
  } catch (error) {
    console.error('Error fetching courses:', error)
    throw new Error('Error al obtener los cursos')
  }
}

// Obtener cursos para selectores (solo datos mínimos)
export async function getCoursesForSelect() {
  try {
    return await prisma.curso.findMany({
      where: { b_activo: true },
      select: { 
        id_curso: true, 
        nombre: true,
        slug: true,
        modalidad: true
      },
      take: 100,
      orderBy: { nombre: 'asc' }
    })
  } catch (error) {
    console.error('Error fetching courses for select:', error)
    throw new Error('Error al obtener los cursos')
  }
}

// Obtener cursos en los que está inscrito un estudiante específico
export async function getStudentCourses(userId: number) {
  try {
    // Primero obtenemos el estudiante
    const estudiante = await prisma.estudiante.findUnique({
      where: { id_usuario: userId },
    })

    if (!estudiante) {
      return []
    }

    // Luego obtenemos sus cursos inscritos a través de la tabla Inscripcion
    const cursosInscritos = await prisma.inscripcion.findMany({
      where: {
        student_id: estudiante.id_estudiante,
        status: 'ACTIVE'
      },
      include: {
        course: {
          include: {
            imparte: {
              include: {
                profesor: {
                  include: {
                    usuario: {
                      select: {
                        nombre: true,
                        apellido: true,
                      }
                    }
                  }
                },
                nivel: true,
              }
            },
            _count: {
              select: {
                inscripciones: {
                  where: {
                    status: 'ACTIVE'
                  }
                }
              }
            },
            // Incluir actividades publicadas para calcular progreso
            activities: {
              where: {
                is_published: true
              },
              select: {
                id: true,
                total_points: true,
                min_passing_score: true
              }
            }
          }
        }
      }
    })

    // ✅ OPTIMIZADO: Calcular progreso con lógica simplificada y más eficiente
    const coursesWithProgress = await Promise.all(
      cursosInscritos.map(async (inscripcion) => {
        const totalActivities = inscripcion.course.activities.length
        let passedActivities = 0

        if (totalActivities > 0) {
          // Obtener solo la mejor entrega de cada actividad usando agregación
          const passedSubmissions = await prisma.activity_submission.groupBy({
            by: ['activity_id'],
            where: {
              enrollment_id: inscripcion.id,
              status: 'GRADED',
              score: { not: null }
            },
            _max: {
              score: true
            }
          })

          // Contar cuántas actividades fueron aprobadas
          for (const submission of passedSubmissions) {
            const activity = inscripcion.course.activities.find(a => a.id === submission.activity_id)
            if (activity && submission._max.score) {
              const minScore = activity.min_passing_score || Math.floor(activity.total_points * 0.6)
              if (submission._max.score >= minScore) {
                passedActivities++
              }
            }
          }
        }

        const progress = totalActivities > 0 
          ? Math.round((passedActivities / totalActivities) * 100) 
          : 0

        return {
          ...inscripcion.course,
          precio: inscripcion.course.precio ? Number(inscripcion.course.precio) : null,
          activityProgress: {
            total: totalActivities,
            passed: passedActivities,
            percentage: progress
          }
        }
      })
    )

    return coursesWithProgress
  } catch (error) {
    console.error('Error fetching student courses:', error)
    throw new Error('Error al obtener los cursos del estudiante')
  }
}

// Verificar si un usuario está inscrito en un curso
export async function isUserEnrolledInCourse(courseId: number, userId?: string) {
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

    // Verificar si está inscrito
    const enrollment = await prisma.horario.findFirst({
      where: {
        id_estudiante: estudiante.id_estudiante,
        id_curso: courseId,
      }
    })

    return !!enrollment
  } catch (error) {
    console.error('Error checking enrollment:', error)
    return false
  }
}

// Inscribir un estudiante en un curso
export async function enrollStudentInCourse(courseId: number, userId?: string) {
  try {
    const session = await getServerSession(authOptions)
    const targetUserId = userId || session?.user?.id
    
    if (!targetUserId) {
      throw new Error("Usuario no autenticado")
    }

    // Buscar el estudiante
    const estudiante = await prisma.estudiante.findUnique({
      where: { id_usuario: +targetUserId }
    })

    if (!estudiante) {
      throw new Error("Estudiante no encontrado")
    }

    // Verificar si ya está inscrito
    const existingEnrollment = await prisma.horario.findFirst({
      where: {
        id_estudiante: estudiante.id_estudiante,
        id_curso: courseId,
      }
    })

    if (existingEnrollment) {
      throw new Error("Ya estás inscrito en este curso")
    }

    // Crear la inscripción
    const enrollment = await prisma.horario.create({
      data: {
        id_estudiante: estudiante.id_estudiante,
        id_curso: courseId,
        comentario: "Inscripción automática",
      }
    })

    return { success: true, enrollment }
  } catch (error) {
    console.error('Error enrolling in course:', error)
    throw error
  }
}

export async function createCourse(data: {
  nombre: string
  modalidad: 'PRESENCIAL' | 'ONLINE'
  inicio?: Date
  fin?: Date
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.rol !== 'ADMIN') {
      throw new Error("Solo los administradores pueden crear cursos")
    }

    // Generar slug a partir del nombre
    const slug = createSlug(data.nombre)

    const curso = await prisma.curso.create({
      data: {
        nombre: data.nombre,
        slug: slug,
        modalidad: data.modalidad,
        inicio: data.inicio,
        fin: data.fin,
        b_activo: true,
      }
    })

    return curso
  } catch (error) {
    console.error('Error creating course:', error)
    throw error
  }
}

export async function updateCourse(id: number, data: {
  nombre?: string
  modalidad?: 'PRESENCIAL' | 'ONLINE'
  inicio?: Date
  fin?: Date
  b_activo?: boolean
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.rol !== 'ADMIN') {
      throw new Error("Solo los administradores pueden actualizar cursos")
    }

    // Si se actualiza el nombre, regenerar slug
    const updateData: typeof data & { slug?: string } = { ...data }
    if (data.nombre) {
      updateData.slug = createSlug(data.nombre)
    }

    const curso = await prisma.curso.update({
      where: { id_curso: id },
      data: updateData
    })

    return curso
  } catch (error) {
    console.error('Error updating course:', error)
    throw error
  }
}

export async function deleteCourse(id: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.rol !== 'ADMIN') {
      throw new Error("Solo los administradores pueden eliminar cursos")
    }

    // En lugar de eliminar, marcamos como inactivo
    const curso = await prisma.curso.update({
      where: { id_curso: id },
      data: { b_activo: false }
    })

    return curso
  } catch (error) {
    console.error('Error deleting course:', error)
    throw error
  }
}

// Obtener curso por slug (nombre del curso convertido a slug)
export async function getCourseBySlug(slug: string) {
  try {
    // Consultar directamente por el campo slug
    const curso = await prisma.curso.findUnique({
      where: {
        slug: slug,
        b_activo: true
      },
      select: {
        id_curso: true,
        nombre: true,
        descripcion: true,
        resumen: true,
        modalidad: true,
        inicio: true,
        fin: true,
        precio: true,
        nivel_ingles: true,
        imagen_url: true,
        video_url: true,
        what_you_learn: true,
        features: true,
        requirements: true,
        target_audience: true,
        course_content: true,
        created_by: true,
        created_at: true,
        updated_at: true,
        creator: {
          select: {
            id_profesor: true,
            nivel_estudios: true,
            observaciones: true,
            edad: true,
            telefono: true,
            usuario: {
              select: {
                nombre: true,
                apellido: true,
                email: true
              }
            }
          }
        },
        inscripciones: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            student: {
              select: {
                id_estudiante: true,
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true,
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            inscripciones: {
              where: {
                status: 'ACTIVE'
              }
            },
            reviews: {
              where: {
                is_active: true
              }
            }
          }
        },
        reviews: {
          where: {
            is_active: true
          },
          include: {
            student: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true
                  }
                }
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 10 // ✅ OPTIMIZADO: Solo cargar las primeras 10 reviews
        }
      }
    })

    if (!curso) {
      redirect('/Courses')
    }

    // ✅ OPTIMIZADO: Parsear JSON en el servidor para reducir carga del cliente
    const cursoConDatosParsed = {
      ...curso,
      precio: curso.precio ? Number(curso.precio) : null,
      total_lecciones_calculadas: countLessonsFromContent(curso.course_content, curso.id_curso),
      // Parsear campos JSON
      what_you_learn: curso.what_you_learn ? JSON.parse(curso.what_you_learn) : [],
      features: curso.features ? JSON.parse(curso.features) : [],
      requirements: curso.requirements ? JSON.parse(curso.requirements) : [],
      target_audience: curso.target_audience ? JSON.parse(curso.target_audience) : [],
      course_content: curso.course_content ? JSON.parse(curso.course_content) : []
    }

    return cursoConDatosParsed
  } catch (error) {
    console.error('Error fetching course by slug:', error)
    throw new Error('Error al obtener el curso')
  }
}

// ✅ NUEVO: Cargar más reviews con paginación
export async function getCourseReviews(courseId: number, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit
    
    const reviews = await prisma.review.findMany({
      where: { 
        course_id: courseId, 
        is_active: true 
      },
      include: {
        student: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit,
      skip
    })

    const totalReviews = await prisma.review.count({
      where: { 
        course_id: courseId, 
        is_active: true 
      }
    })

    return {
      reviews,
      totalReviews,
      currentPage: page,
      totalPages: Math.ceil(totalReviews / limit),
      hasMore: skip + reviews.length < totalReviews
    }
  } catch (error) {
    console.error('Error fetching course reviews:', error)
    throw new Error('Error al obtener las reseñas del curso')
  }
}