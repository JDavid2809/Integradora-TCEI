"use server"

import { prisma } from "@/lib/prisma"

export async function getCourses() {
  try {
    const cursos = await prisma.curso.findMany({
      where: {
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
                  }
                }
              }
            },
            nivel: true,
          }
        },
        inscripciones: {
          where: {
            status: "ACTIVE" // Solo inscripciones activas
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
                status: "ACTIVE" // Solo contar inscripciones activas
              }
            }
          }
        }
      },
      orderBy: {
        inicio: 'desc'
      }
    })

    return cursos
  } catch (error) {
    console.error('Error fetching courses:', error)
    throw new Error('Error al obtener los cursos')
  }
}

export async function getCourseById(id: number) {
  try {
    const curso = await prisma.curso.findUnique({
      where: {
        id_curso: id,
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
                  }
                }
              }
            },
            nivel: true,
          }
        },
        inscripciones: {
          where: {
            status: "ACTIVE" // Solo inscripciones activas
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
                status: "ACTIVE" // Solo contar inscripciones activas
              }
            }
          }
        }
      }
    })

    return curso
  } catch (error) {
    console.error('Error fetching course:', error)
    throw new Error('Error al obtener el curso')
  }
}
