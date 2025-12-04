import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    messageId: string
  }>
}

// PUT - Editar mensaje
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { messageId: messageIdParam } = await params
    const messageId = parseInt(messageIdParam)
    const { contenido } = await request.json()

    if (!contenido?.trim()) {
      return NextResponse.json({ error: 'El contenido es requerido' }, { status: 400 })
    }

    // Verificar que el mensaje existe y pertenece al usuario
    const message = await prisma.chat_message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })
    }

    if (message.usuario_id !== user.id) {
      return NextResponse.json({ error: 'No tienes permiso para editar este mensaje' }, { status: 403 })
    }

    if (message.eliminado) {
      return NextResponse.json({ error: 'No se puede editar un mensaje eliminado' }, { status: 400 })
    }

    // Actualizar mensaje
    const updatedMessage = await prisma.chat_message.update({
      where: { id: messageId },
      data: {
        contenido: contenido.trim(),
        editado_en: new Date()
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
    console.error('Error updating message:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar mensaje (Soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { messageId: messageIdParam } = await params
    const messageId = parseInt(messageIdParam)

    // Verificar que el mensaje existe y pertenece al usuario
    const message = await prisma.chat_message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })
    }

    if (message.usuario_id !== user.id) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar este mensaje' }, { status: 403 })
    }

    // Soft delete
    const deletedMessage = await prisma.chat_message.update({
      where: { id: messageId },
      data: {
        eliminado: true,
        contenido: 'Este mensaje ha sido eliminado',
        archivo_url: null,
        archivo_nombre: null
      },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, rol: true }
        }
      }
    })

    return NextResponse.json(deletedMessage)

  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
