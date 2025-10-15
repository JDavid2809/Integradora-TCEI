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

    // En desarrollo, incluir usuarios no verificados para debug
    const includeUnverified = process.env.NODE_ENV === 'development'
    
    console.log(`🔍 Searching users with query: "${query}", includeUnverified: ${includeUnverified}`)

    // Buscar usuarios (excluyendo al usuario actual)
    const users = await prisma.usuario.findMany({
      where: {
        AND: [
          { id: { not: currentUser.id } },
          ...(includeUnverified ? [] : [{ verificado: true }]), // Solo usuarios verificados en producción
          query.trim() ? {
            OR: [
              { nombre: { contains: query, mode: 'insensitive' } },
              { apellido: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          } : {}
        ]
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        verificado: true,
        estudiante: {
          select: {
            b_activo: true
          }
        },
        profesor: {
          select: {
            b_activo: true
          }
        }
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
          chatRoomId: existingChat?.id || null,
          isActive: user.estudiante?.b_activo ?? user.profesor?.b_activo ?? true
        }
      })
    )

    console.log(`✅ Found ${usersWithChatStatus.length} users for query "${query}"`)

    // En desarrollo, agregar información de debug
    const response: any = {
      users: usersWithChatStatus
    }

    if (process.env.NODE_ENV === 'development') {
      response.debug = {
        query,
        totalFound: usersWithChatStatus.length,
        includeUnverified,
        currentUserId: currentUser.id,
        verifiedUsers: usersWithChatStatus.filter(u => u.verificado).length,
        activeUsers: usersWithChatStatus.filter(u => u.isActive).length
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}