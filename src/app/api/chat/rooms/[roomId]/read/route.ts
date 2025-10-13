import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    roomId: string
  }
}

// POST - Marcar mensajes como leídos
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const roomId = parseInt(params.roomId)

    // Actualizar último visto
    await prisma.chat_participant.updateMany({
      where: {
        chat_room_id: roomId,
        usuario_id: user.id,
        activo: true
      },
      data: {
        ultimo_visto: new Date()
      }
    })

    return NextResponse.json({ message: 'Mensajes marcados como leídos' })

  } catch (error) {
    console.error('Error marking as read:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}