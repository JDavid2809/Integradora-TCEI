import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    roomId: string
  }>
}

// POST - Unirse a una sala
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

    const { roomId: roomIdParam } = await params
    const roomId = parseInt(roomIdParam)

    // Verificar que la sala existe y está activa
    const room = await prisma.chat_room.findFirst({
      where: {
        id: roomId,
        activo: true
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
    }

    // Verificar si ya es participante
    const existingParticipant = await prisma.chat_participant.findFirst({
      where: {
        chat_room_id: roomId,
        usuario_id: user.id
      }
    })

    if (existingParticipant) {
      if (existingParticipant.activo) {
        return NextResponse.json({ message: 'Ya eres participante de esta sala' })
      } else {
        // Reactivar participación
        await prisma.chat_participant.update({
          where: { id: existingParticipant.id },
          data: { activo: true }
        })
      }
    } else {
      // Crear nueva participación
      await prisma.chat_participant.create({
        data: {
          chat_room_id: roomId,
          usuario_id: user.id
        }
      })
    }

    // Mensaje del sistema
    await prisma.chat_message.create({
      data: {
        chat_room_id: roomId,
        usuario_id: user.id,
        contenido: `${user.nombre} ${user.apellido} se ha unido a la sala`,
        tipo: 'SISTEMA'
      }
    })

    return NextResponse.json({ message: 'Te has unido a la sala exitosamente' })

  } catch (error) {
    console.error('Error joining chat room:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}