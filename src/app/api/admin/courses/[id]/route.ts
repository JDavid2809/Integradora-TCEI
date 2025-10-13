import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// Middleware para verificar autorización de admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user?.rol !== 'ADMIN') {
    return false
  }
  
  return true
}

// GET - Obtener curso específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const courseId = parseInt(id)
    
    const course = await prisma.curso.findUnique({
      where: { id_curso: courseId },
      include: {
        imparte: {
          include: {
            profesor: {
              include: {
                usuario: true
              }
            },
            nivel: true,
            historial_academico: {
              include: {
                estudiante: {
                  include: {
                    usuario: true
                  }
                }
              }
            },
            pago: {
              include: {
                estudiante: {
                  include: {
                    usuario: true
                  }
                }
              }
            }
          }
        },
        horario: {
          include: {
            estudiante: {
              include: {
                usuario: true,
                categoria_edad: true
              }
            },
            horario_detalle: {
              include: {
                imparte: {
                  include: {
                    profesor: {
                      include: {
                        usuario: true
                      }
                    },
                    nivel: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
    }

    const courseData = {
      id: course.id_curso,
      nombre: course.nombre,
      modalidad: course.modalidad,
      inicio: course.inicio,
      fin: course.fin,
      activo: course.b_activo,
      profesores: course.imparte.map(imp => ({
        id: imp.profesor.id_profesor,
        nombre: `${imp.profesor.usuario.nombre} ${imp.profesor.usuario.apellido}`,
        nivel: imp.nivel.nombre,
        dias: imp.dias,
        hora_inicio: imp.hora_inicio,
        duracion_min: imp.duracion_min,
        tipo: imp.tipo
      })),
      estudiantes: course.horario.map(hor => ({
        id: hor.estudiante.id_estudiante,
        nombre: `${hor.estudiante.usuario.nombre} ${hor.estudiante.usuario.apellido}`,
        email: hor.estudiante.usuario.email,
        edad: hor.estudiante.edad,
        categoria_edad: hor.estudiante.categoria_edad?.rango,
        activo: hor.estudiante.b_activo,
        horarios: hor.horario_detalle.map(det => ({
          profesor: `${det.imparte.profesor.usuario.nombre} ${det.imparte.profesor.usuario.apellido}`,
          nivel: det.imparte.nivel.nombre,
          comentario: det.comentario
        }))
      })),
      pagos: course.imparte.flatMap(imp => 
        imp.pago.map(pago => ({
          id: pago.id_pago,
          estudiante: pago.estudiante ? `${pago.estudiante.usuario.nombre} ${pago.estudiante.usuario.apellido}` : 'Sin asignar',
          monto: Number(pago.monto),
          fecha_pago: pago.fecha_pago,
          tipo: pago.tipo
        }))
      ),
      historial_academico: course.imparte.flatMap(imp =>
        imp.historial_academico.map(hist => ({
          id: hist.id_historial,
          estudiante: `${hist.estudiante.usuario.nombre} ${hist.estudiante.usuario.apellido}`,
          calificacion: hist.calificacion,
          fecha: hist.fecha,
          tipo: hist.tipo,
          comentario: hist.comentario,
          asistencia: hist.asistencia,
          tipo_evaluacion: hist.tipo_evaluacion
        }))
      )
    }

    return NextResponse.json(courseData)

  } catch (error) {
    console.error('Error al obtener curso:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar curso
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const courseId = parseInt(id)
    const body = await request.json()
    const { nombre, modalidad, inicio, fin, activo, precio, total_lecciones } = body

    // Verificar que el curso existe
    const existingCourse = await prisma.curso.findUnique({
      where: { id_curso: courseId }
    })

    if (!existingCourse) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
    }

    // Preparar datos para actualizar
    const updateData: any = {}
    if (nombre) updateData.nombre = nombre
    if (modalidad && ['PRESENCIAL', 'ONLINE'].includes(modalidad)) {
      updateData.modalidad = modalidad
    }
    if (inicio !== undefined) updateData.inicio = inicio ? new Date(inicio) : null
    if (fin !== undefined) updateData.fin = fin ? new Date(fin) : null
    if (activo !== undefined) updateData.b_activo = activo
    if (precio !== undefined) updateData.precio = precio ? Number(precio) : null
    if (total_lecciones !== undefined) updateData.total_lecciones = total_lecciones ? Number(total_lecciones) : null

    const updatedCourse = await prisma.curso.update({
      where: { id_curso: courseId },
      data: updateData
    })

    return NextResponse.json({
      message: 'Curso actualizado exitosamente',
      course: {
        id: updatedCourse.id_curso,
        nombre: updatedCourse.nombre,
        modalidad: updatedCourse.modalidad,
        inicio: updatedCourse.inicio,
        fin: updatedCourse.fin,
        activo: updatedCourse.b_activo
      }
    })

  } catch (error) {
    console.error('Error al actualizar curso:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar curso
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const courseId = parseInt(id)

    // Verificar que el curso existe
    const existingCourse = await prisma.curso.findUnique({
      where: { id_curso: courseId },
      include: {
        imparte: true,
        horario: true
      }
    })

    if (!existingCourse) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
    }

    // Verificar si hay dependencias
    if (existingCourse.imparte.length > 0 || existingCourse.horario.length > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar el curso porque tiene profesores asignados o estudiantes inscritos' 
      }, { status: 400 })
    }

    await prisma.curso.delete({
      where: { id_curso: courseId }
    })

    return NextResponse.json({
      message: 'Curso eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar curso:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
