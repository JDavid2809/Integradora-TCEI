import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// POST - Iniciar chat privado con otro usuario
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const currentUser = await prisma.usuario.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const { targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: 'ID del usuario objetivo es requerido' }, { status: 400 })
    }

    if (currentUser.id === parseInt(targetUserId)) {
      return NextResponse.json({ error: 'No puedes chatear contigo mismo' }, { status: 400 })
    }

    // Verificar que el usuario objetivo existe
    const targetUser = await prisma.usuario.findUnique({
      where: { id: parseInt(targetUserId) },
      select: { id: true, nombre: true, apellido: true, rol: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario objetivo no encontrado' }, { status: 404 })
    }

    // Buscar si ya existe un chat privado entre estos dos usuarios
    const existingChat = await prisma.chat_room.findFirst({
      where: {
        tipo: 'PRIVADO',
        activo: true,
        AND: [
          {
            participantes: {
              some: {
                usuario_id: currentUser.id,
                activo: true
              }
            }
          },
          {
            participantes: {
              some: {
                usuario_id: targetUser.id,
                activo: true
              }
            }
          }
        ]
      },
      include: {
        participantes: {
          where: { activo: true },
          include: {
            usuario: {
              select: { id: true, nombre: true, apellido: true, rol: true }
            }
          }
        },
        mensajes: {
          orderBy: { enviado_en: 'desc' },
          take: 1,
          include: {
            usuario: {
              select: { id: true, nombre: true, apellido: true, rol: true }
            }
          }
        }
      }
    })

    if (existingChat) {
      // Si ya existe, devolver el chat existente
      return NextResponse.json({
        ...existingChat,
        ultimo_mensaje: existingChat.mensajes[0] || null,
        mensajes_no_leidos: 0 // TODO: Implementar contador real
      })
    }

    // Crear nuevo chat privado
    const chatName = `${currentUser.nombre} ${currentUser.apellido} & ${targetUser.nombre} ${targetUser.apellido}`
    
    const newChat = await prisma.chat_room.create({
      data: {
        nombre: chatName,
        descripcion: `Chat privado entre ${currentUser.nombre} y ${targetUser.nombre}`,
        tipo: 'PRIVADO',
        creado_por: currentUser.id,
        activo: true
      }
    })

    // Agregar ambos usuarios como participantes
    await prisma.chat_participant.createMany({
      data: [
        {
          chat_room_id: newChat.id,
          usuario_id: currentUser.id,
          activo: true
        },
        {
          chat_room_id: newChat.id,
          usuario_id: targetUser.id,
          activo: true
        }
      ]
    })

    // Mensaje de bienvenida del sistema
    await prisma.chat_message.create({
      data: {
        chat_room_id: newChat.id,
        usuario_id: currentUser.id,
        contenido: `Chat privado iniciado entre ${currentUser.nombre} ${currentUser.apellido} y ${targetUser.nombre} ${targetUser.apellido}`,
        tipo: 'SISTEMA'
      }
    })

    // Obtener el chat completo con participantes
    const chatWithDetails = await prisma.chat_room.findUnique({
      where: { id: newChat.id },
      include: {
        participantes: {
          where: { activo: true },
          include: {
            usuario: {
              select: { id: true, nombre: true, apellido: true, rol: true }
            }
          }
        },
        mensajes: {
          orderBy: { enviado_en: 'desc' },
          take: 1,
          include: {
            usuario: {
              select: { id: true, nombre: true, apellido: true, rol: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      ...chatWithDetails,
      ultimo_mensaje: chatWithDetails?.mensajes[0] || null,
      mensajes_no_leidos: 0
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating private chat:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}