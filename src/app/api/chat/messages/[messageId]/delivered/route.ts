import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// PUT - Marcar mensaje como entregado
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
    const isParticipant = message.chat_room.participantes.some(
      (p: any) => p.usuario_id === Number(session.user.id)
    )

    if (!isParticipant) {
      return NextResponse.json({ error: 'No tienes acceso a esta sala' }, { status: 403 })
    }

    // Marcar como entregado si aún no lo está
    const updatedMessage = await prisma.chat_message.update({
      where: { id: messageId },
      data: {
        entregado_en: message.entregado_en || new Date()
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

    return NextResponse.json(updatedMessage)

  } catch (error) {
    console.error('Error marking message as delivered:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}