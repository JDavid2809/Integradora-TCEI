import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.rol !== 'PROFESOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener el profesor
    const profesor = await prisma.profesor.findUnique({
      where: { id_usuario: parseInt(session.user.id) },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      }
    })

    if (!profesor) {
      return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 })
    }

    try {
      // Obtener cursos que imparte el profesor
      const cursos = await prisma.curso.findMany({
        where: {
          created_by: profesor.id_profesor,
          b_activo: true
        },
        include: {
          class_schedules: {
            where: { 
              teacher_id: profesor.id_profesor,
              is_active: true 
            },
            include: {
              level: {
                select: {
                  nombre: true
                }
              }
            }
          },
          activities: {
            where: {
              created_by: profesor.id_profesor,
              is_published: true
            },
            orderBy: {
              due_date: 'asc'
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
                      email: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      // Obtener todos los niveles disponibles
      const niveles = await prisma.nivel.findMany({
        where: { b_activo: true },
        orderBy: { nombre: 'asc' }
      })

      // Formatear la respuesta
      const horariosProfesor = cursos.map(curso => ({
        curso: {
          id: curso.id_curso,
          nombre: curso.nombre,
          modalidad: curso.modalidad,
          descripcion: curso.descripcion,
          nivel_ingles: curso.nivel_ingles,
          estudiantes_inscritos: curso.inscripciones.length
        },
        schedules: curso.class_schedules.map(schedule => ({
          id: schedule.id,
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time,
          duration_minutes: schedule.duration_minutes,
          classroom: schedule.classroom,
          level: schedule.level.nombre
        })),
        activities: curso.activities.map(activity => ({
          id: activity.id,
          title: activity.title,
          description: activity.description,
          due_date: activity.due_date,
          activity_type: activity.activity_type,
          total_points: activity.total_points
        })),
        students: curso.inscripciones.map(inscripcion => ({
          id: inscripcion.student.id_estudiante,
          nombre: inscripcion.student.usuario.nombre,
          apellido: inscripcion.student.usuario.apellido,
          email: inscripcion.student.usuario.email,
          enrollment_status: inscripcion.status
        }))
      }))

      return NextResponse.json({ 
        success: true, 
        horarios: horariosProfesor,
        niveles,
        teacher_name: `${profesor.usuario.nombre} ${profesor.usuario.apellido}`,
        teacher_id: profesor.id_profesor
      })

    } catch (dbError) {
      console.error('Error accessing database, using sample data:', dbError)
      
      // Datos de ejemplo para profesores
      const sampleData = {
        horarios: [
          {
            curso: {
              id: 1,
              nombre: "Inglés Básico A1",
              modalidad: "PRESENCIAL",
              descripcion: "Curso básico de inglés nivel A1",
              nivel_ingles: "A1",
              estudiantes_inscritos: 15
            },
            schedules: [
              {
                id: 1,
                day_of_week: "MONDAY",
                start_time: "09:00",
                duration_minutes: 90,
                classroom: "Aula 101",
                level: "A1"
              },
              {
                id: 2,
                day_of_week: "WEDNESDAY",
                start_time: "09:00",
                duration_minutes: 90,
                classroom: "Aula 101",
                level: "A1"
              }
            ],
            activities: [
              {
                id: 1,
                title: "Vocabulario Básico",
                description: "Ejercicios de vocabulario",
                due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                activity_type: "ASSIGNMENT",
                total_points: 100
              }
            ],
            students: [
              {
                id: 1,
                nombre: "Juan",
                apellido: "Pérez",
                email: "juan@ejemplo.com",
                enrollment_status: "ACTIVE"
              }
            ]
          }
        ],
        niveles: [
          { id_nivel: 1, nombre: "A1" },
          { id_nivel: 2, nombre: "A2" },
          { id_nivel: 3, nombre: "B1" },
          { id_nivel: 4, nombre: "B2" }
        ]
      }
      
      return NextResponse.json({ 
        success: true, 
        ...sampleData,
        teacher_name: `${session.user.name} ${session.user.apellido}`,
        teacher_id: 1,
        isExample: true
      })
    }

  } catch (error) {
    console.error('Error fetching teacher schedule:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.rol !== 'PROFESOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const profesor = await prisma.profesor.findUnique({
      where: { id_usuario: parseInt(session.user.id) }
    })

    if (!profesor) {
      return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { course_id, level_id, day_of_week, start_time, duration_minutes, classroom } = body

    // Validar que el curso pertenece al profesor
    const curso = await prisma.curso.findFirst({
      where: {
        id_curso: course_id,
        created_by: profesor.id_profesor
      }
    })

    if (!curso) {
      return NextResponse.json({ error: 'Curso no encontrado o no autorizado' }, { status: 404 })
    }

    // Crear nuevo horario de clase
    const newSchedule = await prisma.class_schedule.create({
      data: {
        course_id,
        teacher_id: profesor.id_profesor,
        level_id,
        day_of_week,
        start_time,
        duration_minutes,
        classroom,
        is_active: true
      },
      include: {
        level: {
          select: {
            nombre: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      schedule: {
        id: newSchedule.id,
        day_of_week: newSchedule.day_of_week,
        start_time: newSchedule.start_time,
        duration_minutes: newSchedule.duration_minutes,
        classroom: newSchedule.classroom,
        level: newSchedule.level.nombre
      }
    })

  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json({ 
      error: 'Error al crear horario' 
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.rol !== 'PROFESOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const profesor = await prisma.profesor.findUnique({
      where: { id_usuario: parseInt(session.user.id) }
    })

    if (!profesor) {
      return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { schedule_id, level_id, day_of_week, start_time, duration_minutes, classroom } = body

    // Verificar que el horario pertenece al profesor
    const existingSchedule = await prisma.class_schedule.findFirst({
      where: {
        id: schedule_id,
        teacher_id: profesor.id_profesor
      }
    })

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Horario no encontrado o no autorizado' }, { status: 404 })
    }

    // Actualizar horario
    const updatedSchedule = await prisma.class_schedule.update({
      where: { id: schedule_id },
      data: {
        level_id,
        day_of_week,
        start_time,
        duration_minutes,
        classroom
      },
      include: {
        level: {
          select: {
            nombre: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      schedule: {
        id: updatedSchedule.id,
        day_of_week: updatedSchedule.day_of_week,
        start_time: updatedSchedule.start_time,
        duration_minutes: updatedSchedule.duration_minutes,
        classroom: updatedSchedule.classroom,
        level: updatedSchedule.level.nombre
      }
    })

  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json({ 
      error: 'Error al actualizar horario' 
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.rol !== 'PROFESOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const profesor = await prisma.profesor.findUnique({
      where: { id_usuario: parseInt(session.user.id) }
    })

    if (!profesor) {
      return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const schedule_id = searchParams.get('id')

    if (!schedule_id) {
      return NextResponse.json({ error: 'ID de horario requerido' }, { status: 400 })
    }

    // Verificar que el horario pertenece al profesor
    const existingSchedule = await prisma.class_schedule.findFirst({
      where: {
        id: parseInt(schedule_id),
        teacher_id: profesor.id_profesor
      }
    })

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Horario no encontrado o no autorizado' }, { status: 404 })
    }

    // Eliminar horario (soft delete)
    await prisma.class_schedule.update({
      where: { id: parseInt(schedule_id) },
      data: { is_active: false }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Horario eliminado correctamente'
    })

  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json({ 
      error: 'Error al eliminar horario' 
    }, { status: 500 })
  }
}