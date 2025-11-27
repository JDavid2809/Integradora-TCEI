import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    messageId: string
  }>
}

// GET - Obtener un mensaje por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { messageId: messageIdParam } = await params
    const messageId = parseInt(messageIdParam)

    if (!messageId) {
      return NextResponse.json({ error: 'ID de mensaje inválido' }, { status: 400 })
    }

    const message = await prisma.chat_message.findUnique({
      where: { id: messageId },
      include: {
        chat_room: true,
        usuario: {
          select: { id: true, nombre: true, apellido: true, rol: true }
        },
        lecturas: {
          include: {
            usuario: {
              select: { id: true, nombre: true, apellido: true, rol: true }
            }
          }
        }
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ message })

  } catch (error) {
    console.error('Error fetching message:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
