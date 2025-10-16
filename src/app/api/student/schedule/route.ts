import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// Datos de ejemplo para desarrollo
const SAMPLE_SCHEDULE_DATA = {
  horarios: [
    {
      curso: {
        id: 1,
        nombre: "Inglés Básico A1",
        modalidad: "PRESENCIAL",
        nivel: "A1"
      },
      schedules: [
        {
          id: 1,
          day_of_week: "MONDAY",
          start_time: "09:00",
          duration_minutes: 90,
          classroom: "Aula 101",
          teacher: {
            nombre: "María",
            apellido: "González"
          }
        },
        {
          id: 2,
          day_of_week: "WEDNESDAY",
          start_time: "09:00",
          duration_minutes: 90,
          classroom: "Aula 101",
          teacher: {
            nombre: "María",
            apellido: "González"
          }
        },
        {
          id: 3,
          day_of_week: "FRIDAY",
          start_time: "09:00",
          duration_minutes: 90,
          classroom: "Aula 101",
          teacher: {
            nombre: "María",
            apellido: "González"
          }
        }
      ],
      activities: [
        {
          id: 1,
          title: "Vocabulario Básico - Familia",
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          activity_type: "ASSIGNMENT"
        },
        {
          id: 2,
          title: "Quiz: Present Simple",
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          activity_type: "QUIZ"
        }
      ]
    },
    {
      curso: {
        id: 2,
        nombre: "Inglés Intermedio B1",
        modalidad: "ONLINE",
        nivel: "B1"
      },
      schedules: [
        {
          id: 4,
          day_of_week: "TUESDAY",
          start_time: "14:00",
          duration_minutes: 120,
          classroom: "Aula Virtual 1",
          teacher: {
            nombre: "Carlos",
            apellido: "Rodríguez"
          }
        },
        {
          id: 5,
          day_of_week: "THURSDAY",
          start_time: "14:00",
          duration_minutes: 120,
          classroom: "Aula Virtual 1",
          teacher: {
            nombre: "Carlos",
            apellido: "Rodríguez"
          }
        }
      ],
      activities: [
        {
          id: 3,
          title: "Ensayo: Mi ciudad natal",
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          activity_type: "ASSIGNMENT"
        },
        {
          id: 4,
          title: "Video: Presentación Personal",
          due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          activity_type: "VIDEO"
        }
      ]
    }
  ]
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.rol !== 'ESTUDIANTE') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    try {
      // Intentar obtener datos reales de la base de datos
      const estudiante = await prisma.estudiante.findUnique({
        where: { id_usuario: parseInt(session.user.id) }
      })

      if (!estudiante) {
        console.log('Estudiante no encontrado, usando datos de ejemplo')
        return NextResponse.json({ 
          success: true, 
          ...SAMPLE_SCHEDULE_DATA,
          student_name: `${session.user.name} ${session.user.apellido}`,
          isExample: true
        })
      }

      // Obtener inscripciones y horarios del estudiante
      const inscripciones = await prisma.inscripcion.findMany({
        where: { 
          student_id: estudiante.id_estudiante,
          status: 'ACTIVE'
        },
        include: {
          course: {
            include: {
              class_schedules: {
                where: { is_active: true },
                include: {
                  teacher: {
                    include: {
                      usuario: {
                        select: {
                          nombre: true,
                          apellido: true
                        }
                      }
                    }
                  },
                  level: {
                    select: {
                      nombre: true
                    }
                  }
                }
              },
              activities: {
                where: {
                  is_published: true,
                  due_date: {
                    gte: new Date()
                  }
                },
                orderBy: {
                  due_date: 'asc'
                },
                take: 5 // Próximas 5 actividades
              }
            }
          }
        }
      })

      // Si no hay inscripciones reales, usar datos de ejemplo
      if (inscripciones.length === 0) {
        console.log('No hay inscripciones, usando datos de ejemplo')
        return NextResponse.json({ 
          success: true, 
          ...SAMPLE_SCHEDULE_DATA,
          student_name: `${session.user.name} ${session.user.apellido}`,
          isExample: true
        })
      }

      // Formatear la respuesta con datos reales
      const horarios = inscripciones.map(inscripcion => ({
        curso: {
          id: inscripcion.course.id_curso,
          nombre: inscripcion.course.nombre,
          modalidad: inscripcion.course.modalidad,
          nivel: inscripcion.course.class_schedules[0]?.level?.nombre || 'A1'
        },
        schedules: inscripcion.course.class_schedules.map(schedule => ({
          id: schedule.id,
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time,
          duration_minutes: schedule.duration_minutes,
          classroom: schedule.classroom,
          teacher: {
            nombre: schedule.teacher.usuario.nombre,
            apellido: schedule.teacher.usuario.apellido
          }
        })),
        activities: inscripcion.course.activities.map(activity => ({
          id: activity.id,
          title: activity.title,
          due_date: activity.due_date,
          activity_type: activity.activity_type
        }))
      }))

      return NextResponse.json({ 
        success: true, 
        horarios,
        student_name: `${session.user.name} ${session.user.apellido}`,
        isExample: false
      })

    } catch (dbError) {
      console.error('Error accessing database, using sample data:', dbError)
      // En caso de error de base de datos, usar datos de ejemplo
      return NextResponse.json({ 
        success: true, 
        ...SAMPLE_SCHEDULE_DATA,
        student_name: `${session.user.name} ${session.user.apellido}`,
        isExample: true
      })
    }

  } catch (error) {
    console.error('Error fetching student schedule:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}