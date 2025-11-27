import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/getUserFromSession'

// GET - Obtener todas las salas de chat del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await getUserFromSession(session)

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Obtener salas donde el usuario es participante
    const participantRooms = await prisma.chat_room.findMany({
      where: {
        AND: [
          { activo: true },
          {
            participantes: {
              some: {
                usuario_id: user.id,
                activo: true
              }
            }
          }
        ]
      },
      include: {
        creador: {
          select: { id: true, nombre: true, apellido: true, rol: true }
        },
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
      },
      orderBy: { creado_en: 'desc' }
    })

    // Agregar salas generales y de soporte si el usuario no está en ellas
    const generalRooms = await prisma.chat_room.findMany({
      where: {
        AND: [
          { activo: true },
          { tipo: { in: ['GENERAL', 'SOPORTE'] } },
          {
            NOT: {
              participantes: {
                some: {
                  usuario_id: user.id,
                  activo: true
                }
              }
            }
          }
        ]
      },
      include: {
        creador: {
          select: { id: true, nombre: true, apellido: true, rol: true }
        },
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

    // Combinar y formatear resultados
    const allRooms = [...participantRooms, ...generalRooms].map(room => ({
      ...room,
      ultimo_mensaje: room.mensajes[0] || null,
      mensajes_no_leidos: 0 // TODO: Implementar contador real
    }))

    return NextResponse.json(allRooms)

  } catch (error) {
    console.error('Error fetching chat rooms:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nueva sala de chat
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await getUserFromSession(session)

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const { nombre, descripcion, tipo = 'GENERAL' } = await request.json()

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    // Solo admins pueden crear salas de tipo SOPORTE
    if (tipo === 'SOPORTE' && session.user.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores pueden crear salas de soporte' }, { status: 403 })
    }

    // Crear la sala
    const newRoom = await prisma.chat_room.create({
      data: {
        nombre,
        descripcion,
        tipo,
        creado_por: user.id
      },
      include: {
        creador: {
          select: { id: true, nombre: true, apellido: true, rol: true }
        },
        participantes: {
          include: {
            usuario: {
              select: { id: true, nombre: true, apellido: true, rol: true }
            }
          }
        }
      }
    })

    // Agregar al creador como participante
    await prisma.chat_participant.create({
      data: {
        chat_room_id: newRoom.id,
        usuario_id: user.id
      }
    })

    // Mensaje de bienvenida del sistema
    await prisma.chat_message.create({
      data: {
        chat_room_id: newRoom.id,
        usuario_id: user.id,
        contenido: `${user.nombre} ${user.apellido} ha creado la sala de chat`,
        tipo: 'SISTEMA'
      }
    })

    return NextResponse.json(newRoom, { status: 201 })

  } catch (error) {
    console.error('Error creating chat room:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}