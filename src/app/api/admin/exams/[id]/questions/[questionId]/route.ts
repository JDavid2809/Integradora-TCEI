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

// DELETE - Eliminar pregunta
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const params = await context.params
    const examId = parseInt(params.id)
    const questionId = parseInt(params.questionId)

    // Verificar que la pregunta existe y pertenece al examen
    const question = await prisma.pregunta.findFirst({
      where: {
        id_pregunta: questionId,
        id_examen: examId
      }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Pregunta no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar respuestas primero (por la relación)
    await prisma.respuesta.deleteMany({
      where: {
        id_pregunta: questionId
      }
    })

    // Eliminar la pregunta
    await prisma.pregunta.delete({
      where: {
        id_pregunta: questionId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Pregunta eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
