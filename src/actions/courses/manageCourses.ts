"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { CourseSearchParams, PaginatedCourses } from "@/types/courses"
import { createSlug } from '@/lib/slugUtils'

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
        }
      },
      orderBy: {
        inicio: 'desc'
      },
      skip: offset,
      take: limit
    })

    // Calcular información de paginación
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      cursos,
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
export async function getAllCourses() {
  try {
    const result = await getPaginatedCourses({ limit: 1000 }) // Obtener todos
    return result.cursos
  } catch (error) {
    console.error('Error fetching courses:', error)
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
            }
          }
        }
      }
    })

    return cursosInscritos.map(inscripcion => inscripcion.course)
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

    const curso = await prisma.curso.create({
      data: {
        nombre: data.nombre,
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

    const curso = await prisma.curso.update({
      where: { id_curso: id },
      data: data
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
    // Obtener todos los cursos activos para comparar con el slug
    const cursos = await prisma.curso.findMany({
      where: {
        b_activo: true
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
        inscripciones: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            student: {
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
            inscripciones: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    })

    // Buscar el curso cuyo nombre coincida con el slug
    const curso = cursos.find(c => createSlug(c.nombre) === slug)

    if (!curso) {
      throw new Error('Curso no encontrado')
    }

    return curso
  } catch (error) {
    console.error('Error fetching course by slug:', error)
    throw new Error('Error al obtener el curso')
  }
}