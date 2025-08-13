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

// GET - Obtener preguntas de un examen
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const params = await context.params
    const examId = parseInt(params.id)

    const questions = await prisma.pregunta.findMany({
      where: {
        id_examen: examId
      },
      include: {
        respuesta: {
          orderBy: {
            id_respuesta: 'asc'
          }
        }
      },
      orderBy: {
        id_pregunta: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      questions
    })

  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva pregunta
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const params = await context.params
    const examId = parseInt(params.id)
    const body = await request.json()
    const { descripcion, ruta_file_media, respuestas } = body

    // Validar datos
    if (!descripcion) {
      return NextResponse.json(
        { error: 'Descripción de la pregunta es requerida' },
        { status: 400 }
      )
    }

    const validAnswers = respuestas.filter((r: any) => r.descripcion.trim() !== '')
    if (validAnswers.length < 2) {
      return NextResponse.json(
        { error: 'Debe tener al menos 2 respuestas' },
        { status: 400 }
      )
    }

    const correctAnswers = validAnswers.filter((r: any) => r.es_correcta)
    if (correctAnswers.length === 0) {
      return NextResponse.json(
        { error: 'Debe marcar al menos una respuesta como correcta' },
        { status: 400 }
      )
    }

    // Verificar que el examen existe
    const exam = await prisma.examen.findUnique({
      where: { id_examen: examId }
    })

    if (!exam) {
      return NextResponse.json(
        { error: 'Examen no encontrado' },
        { status: 404 }
      )
    }

    // Crear la pregunta con respuestas
    const question = await prisma.pregunta.create({
      data: {
        id_examen: examId,
        descripcion,
        ruta_file_media: ruta_file_media || null,
        respuesta: {
          create: validAnswers.map((respuesta: any) => ({
            descripcion: respuesta.descripcion.trim(),
            es_correcta: respuesta.es_correcta,
            ruta_file_media: respuesta.ruta_file_media || null
          }))
        }
      },
      include: {
        respuesta: true
      }
    })

    return NextResponse.json({
      success: true,
      question
    })

  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
