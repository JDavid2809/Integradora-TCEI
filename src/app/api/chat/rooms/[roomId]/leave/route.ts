import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/getUserFromSession'

interface RouteParams {
  params: Promise<{
    roomId: string
  }>
}

// POST - Salir de una sala
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await getUserFromSession(session)

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const { roomId: roomIdParam } = await params
    const roomId = parseInt(roomIdParam)

    // Buscar participación activa
    const participant = await prisma.chat_participant.findFirst({
      where: {
        chat_room_id: roomId,
        usuario_id: user.id,
        activo: true
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'No eres participante de esta sala' }, { status: 404 })
    }

    // Desactivar participación
    await prisma.chat_participant.update({
      where: { id: participant.id },
      data: { activo: false }
    })

    // Mensaje del sistema
    await prisma.chat_message.create({
      data: {
        chat_room_id: roomId,
        usuario_id: user.id,
        contenido: `${user.nombre} ${user.apellido} ha salido de la sala`,
        tipo: 'SISTEMA'
      }
    })

    return NextResponse.json({ message: 'Has salido de la sala exitosamente' })

  } catch (error) {
    console.error('Error leaving chat room:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}