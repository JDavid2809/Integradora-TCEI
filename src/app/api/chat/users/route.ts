import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// GET - Buscar usuarios para chat privado
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    // Buscar usuarios (excluyendo al usuario actual)
    const users = await prisma.usuario.findMany({
      where: {
        AND: [
          { id: { not: currentUser.id } },
          { verificado: true }, // Solo usuarios verificados
          {
            OR: [
              { nombre: { contains: query, mode: 'insensitive' } },
              { apellido: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true
      },
      take: limit,
      orderBy: [
        { nombre: 'asc' },
        { apellido: 'asc' }
      ]
    })

    // Para cada usuario, verificar si ya existe un chat privado
    const usersWithChatStatus = await Promise.all(
      users.map(async (user) => {
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
                    usuario_id: user.id,
                    activo: true
                  }
                }
              }
            ]
          },
          select: { id: true }
        })

        return {
          ...user,
          hasExistingChat: !!existingChat,
          chatRoomId: existingChat?.id || null
        }
      })
    )

    return NextResponse.json(usersWithChatStatus)

  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}