import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// PUT - Marcar mensaje como leído
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const messageId = parseInt(resolvedParams.messageId)
    
    if (!messageId) {
      return NextResponse.json({ error: 'ID de mensaje inválido' }, { status: 400 })
    }

    // Verificar que el mensaje existe
    const message = await prisma.chat_message.findUnique({
      where: { id: messageId },
      include: {
        chat_room: {
          include: {
            participantes: {
              where: { activo: true }
            }
          }
        }
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })
    }

    // Verificar que el usuario es participante de la sala
    // Use explicit lookup instead of relying on includes to avoid stale/partial data
    const participant = await prisma.chat_participant.findFirst({
      where: {
        chat_room_id: message.chat_room.id,
        usuario_id: Number(session.user.id),
        activo: true,
      }
    })

    if (!participant) {
      console.warn(`User ${session.user?.email} attempted to mark message ${messageId} as read but is not participant (room ${message.chat_room.id}) - participants in room: ${JSON.stringify(message.chat_room.participantes?.map((p: any) => p.usuario_id)) || '[]'}`)
      return NextResponse.json({ error: 'No tienes acceso a esta sala' }, { status: 403 })
    }

    // Marcar mensaje como leído
    await prisma.chat_message.update({
      where: { id: messageId },
      data: {
        visto_en: new Date()
      }
    })

    // Crear o actualizar registro de lectura individual
    await prisma.chat_message_read.upsert({
      where: {
        mensaje_id_usuario_id: {
          mensaje_id: messageId,
          usuario_id: Number(session.user.id)
        }
      },
      update: {
        leido_en: new Date()
      },
      create: {
        mensaje_id: messageId,
        usuario_id: Number(session.user.id),
        leido_en: new Date()
      }
    })

    // Obtener el mensaje actualizado con las lecturas
    const updatedMessage = await prisma.chat_message.findUnique({
      where: { id: messageId },
      include: {
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

    return NextResponse.json(updatedMessage)

  } catch (error) {
    console.error('Error marking message as read:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}