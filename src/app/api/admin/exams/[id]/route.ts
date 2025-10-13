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

// GET - Obtener examen específico
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
    const examId = parseInt(id)
    
    const exam = await prisma.examen.findUnique({
      where: { id_examen: examId },
      include: {
        nivel: true,
        pregunta: {
          include: {
            respuesta: true
          },
          orderBy: {
            id_pregunta: 'asc'
          }
        },
        resultado_examen: {
          include: {
            estudiante: {
              include: {
                usuario: true
              }
            }
          },
          orderBy: {
            fecha: 'desc'
          }
        }
      }
    })

    if (!exam) {
      return NextResponse.json({ error: 'Examen no encontrado' }, { status: 404 })
    }

    const examData = {
      id: exam.id_examen,
      nombre: exam.nombre,
      nivel: exam.nivel,
      activo: exam.b_activo,
      preguntas: exam.pregunta.map(pregunta => ({
        id: pregunta.id_pregunta,
        descripcion: pregunta.descripcion,
        ruta_file_media: pregunta.ruta_file_media,
        respuestas: pregunta.respuesta.map(respuesta => ({
          id: respuesta.id_respuesta,
          descripcion: respuesta.descripcion,
          ruta_file_media: respuesta.ruta_file_media,
          es_correcta: respuesta.es_correcta
        }))
      })),
      resultados: exam.resultado_examen.map(resultado => ({
        id: resultado.id_resultado,
        estudiante: {
          id: resultado.estudiante?.id_estudiante,
          nombre: resultado.estudiante ? `${resultado.estudiante.usuario.nombre} ${resultado.estudiante.usuario.apellido}` : 'Desconocido',
          email: resultado.estudiante?.usuario.email
        },
        calificacion: Number(resultado.calificacion),
        fecha: resultado.fecha
      })),
      estadisticas: {
        total_preguntas: exam.pregunta.length,
        total_resultados: exam.resultado_examen.length,
        promedio_calificaciones: exam.resultado_examen.length > 0 
          ? exam.resultado_examen.reduce((sum, res) => sum + Number(res.calificacion), 0) / exam.resultado_examen.length
          : 0,
        calificacion_maxima: exam.resultado_examen.length > 0 
          ? Math.max(...exam.resultado_examen.map(res => Number(res.calificacion)))
          : 0,
        calificacion_minima: exam.resultado_examen.length > 0 
          ? Math.min(...exam.resultado_examen.map(res => Number(res.calificacion)))
          : 0
      }
    }

    return NextResponse.json(examData)

  } catch (error) {
    console.error('Error al obtener examen:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar examen
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
    const examId = parseInt(id)
    const body = await request.json()
    const { nombre, id_nivel, activo, preguntas } = body

    // Verificar que el examen existe
    const existingExam = await prisma.examen.findUnique({
      where: { id_examen: examId }
    })

    if (!existingExam) {
      return NextResponse.json({ error: 'Examen no encontrado' }, { status: 404 })
    }

    // Verificar que el nivel existe si se proporciona
    if (id_nivel) {
      const nivel = await prisma.nivel.findUnique({
        where: { id_nivel: parseInt(id_nivel) }
      })

      if (!nivel) {
        return NextResponse.json({ error: 'Nivel no encontrado' }, { status: 400 })
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Preparar datos para actualizar examen
      // Tipado explícito para los datos de actualización de examen
      const updateData: {
        nombre?: string;
        id_nivel?: number | null;
        b_activo?: boolean;
      } = {};
      if (nombre) updateData.nombre = nombre
      if (id_nivel !== undefined) updateData.id_nivel = id_nivel ? parseInt(id_nivel) : null
      if (activo !== undefined) updateData.b_activo = activo

      // Actualizar examen
      const updatedExam = await tx.examen.update({
        where: { id_examen: examId },
        data: updateData
      })

      // Si se proporcionan preguntas, actualizar toda la estructura
      if (preguntas && Array.isArray(preguntas)) {
        // Eliminar preguntas y respuestas existentes
        await tx.respuesta.deleteMany({
          where: {
            pregunta: {
              id_examen: examId
            }
          }
        })
        
        await tx.pregunta.deleteMany({
          where: { id_examen: examId }
        })

        // Crear nuevas preguntas y respuestas
        for (const pregunta of preguntas) {
          const newQuestion = await tx.pregunta.create({
            data: {
              id_examen: examId,
              descripcion: pregunta.descripcion,
              ruta_file_media: pregunta.ruta_file_media || null
            }
          })

          // Crear respuestas para la pregunta
          if (pregunta.respuestas && Array.isArray(pregunta.respuestas)) {
            for (const respuesta of pregunta.respuestas) {
              await tx.respuesta.create({
                data: {
                  id_pregunta: newQuestion.id_pregunta,
                  descripcion: respuesta.descripcion,
                  ruta_file_media: respuesta.ruta_file_media || null,
                  es_correcta: respuesta.es_correcta || false
                }
              })
            }
          }
        }
      }

      return updatedExam
    })

    return NextResponse.json({
      message: 'Examen actualizado exitosamente',
      exam: {
        id: result.id_examen,
        nombre: result.nombre,
        id_nivel: result.id_nivel,
        activo: result.b_activo
      }
    })

  } catch (error) {
    console.error('Error al actualizar examen:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar examen
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
    const examId = parseInt(id)

    // Verificar que el examen existe
    const existingExam = await prisma.examen.findUnique({
      where: { id_examen: examId },
      include: {
        resultado_examen: true
      }
    })

    if (!existingExam) {
      return NextResponse.json({ error: 'Examen no encontrado' }, { status: 404 })
    }

    // Verificar si hay resultados registrados
    if (existingExam.resultado_examen.length > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar el examen porque tiene resultados registrados' 
      }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      // Eliminar respuestas
      await tx.respuesta.deleteMany({
        where: {
          pregunta: {
            id_examen: examId
          }
        }
      })

      // Eliminar preguntas
      await tx.pregunta.deleteMany({
        where: { id_examen: examId }
      })

      // Eliminar examen
      await tx.examen.delete({
        where: { id_examen: examId }
      })
    })

    return NextResponse.json({
      message: 'Examen eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar examen:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
