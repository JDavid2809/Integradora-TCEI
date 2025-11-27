import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/getUserFromSession'
import { redis, safePublish } from '@/lib/redis'

interface RouteParams {
  params: Promise<{
    roomId: string
  }>
}

// GET - Obtener mensajes de una sala
export async function GET(request: NextRequest, { params }: RouteParams) {
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
    
    // Verificar que el usuario es participante de la sala o que la sala es pública
    const room = await prisma.chat_room.findFirst({
      where: {
        id: roomId,
        activo: true,
        OR: [
          { tipo: { in: ['GENERAL', 'SOPORTE'] } }, // Salas públicas
          {
            participantes: {
              some: {
                usuario_id: user.id,
                activo: true
              }
            }
          }
        ]
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Sala no encontrada o sin acceso' }, { status: 404 })
    }

    // Obtener mensajes
    const messages = await prisma.chat_message.findMany({
      where: {
        chat_room_id: roomId,
        eliminado: false
      },
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
      },
      orderBy: { enviado_en: 'asc' },
      take: 100 // Limitar a los últimos 100 mensajes
    })

    // Obtener participantes
    const participants = await prisma.chat_participant.findMany({
      where: {
        chat_room_id: roomId,
        activo: true
      },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, rol: true }
        }
      }
    })

    return NextResponse.json({
      messages,
      participants
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Enviar mensaje a una sala
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
    const { contenido, tipo = 'TEXTO', archivo_url, archivo_nombre } = await request.json()

    if (!contenido?.trim()) {
      return NextResponse.json({ error: 'El contenido del mensaje es requerido' }, { status: 400 })
    }

    // Verificar acceso a la sala
    const room = await prisma.chat_room.findFirst({
      where: {
        id: roomId,
        activo: true,
        OR: [
          { tipo: { in: ['GENERAL', 'SOPORTE'] } },
          {
            participantes: {
              some: {
                usuario_id: user.id,
                activo: true
              }
            }
          }
        ]
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Sala no encontrada o sin acceso' }, { status: 404 })
    }

    // Si es una sala pública y el usuario no es participante, agregarlo automáticamente
    if (['GENERAL', 'SOPORTE'].includes(room.tipo)) {
      const existingParticipant = await prisma.chat_participant.findFirst({
        where: {
          chat_room_id: roomId,
          usuario_id: user.id
        }
      })

      if (!existingParticipant) {
        await prisma.chat_participant.create({
          data: {
            chat_room_id: roomId,
            usuario_id: user.id
          }
        })
      } else if (!existingParticipant.activo) {
        await prisma.chat_participant.update({
          where: { id: existingParticipant.id },
          data: { activo: true }
        })
      }
    }

    // Crear el mensaje
    const newMessage = await prisma.chat_message.create({
      data: {
        chat_room_id: roomId,
        usuario_id: user.id,
        contenido: contenido.trim(),
        tipo,
        archivo_url,
        archivo_nombre,
        entregado_en: new Date() // Marcar como entregado inmediatamente
      },
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

    // Publicar en Redis para WebSocket
    try {
      const wsMessage = {
        type: 'message',
        id: String(newMessage.id),
        room: String(roomId),
        content: newMessage.contenido,
        senderId: String(user.id),
        senderName: `${user.nombre} ${user.apellido || ''}`.trim(),
        timestamp: Math.floor(new Date(newMessage.enviado_en).getTime() / 1000),
        metadata: {
          tipo: newMessage.tipo,
          archivo_url: newMessage.archivo_url,
          archivo_nombre: newMessage.archivo_nombre
        }
      }
      
      // Use helper to avoid unhandled errors and to retry if needed
      const ok = await safePublish(`chat:room:${roomId}`, JSON.stringify(wsMessage))
      if (!ok) {
        console.warn('Redis publish failed, continuing without Pub/Sub')
      }
    } catch (redisError) {
      console.error('Error publishing to Redis:', redisError)
      // No fallar la request si Redis falla, el mensaje ya se guardó en DB
    }

    return NextResponse.json(newMessage, { status: 201 })

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}