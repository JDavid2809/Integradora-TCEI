import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// GET - Herramienta de administración para visibilidad de usuarios
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Solo administradores pueden usar esta herramienta
    if (!session?.user || session.user.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')

    switch (action) {
      case 'list-problematic':
        // Listar usuarios con problemas potenciales
        const problematicUsers = await prisma.usuario.findMany({
          where: {
            OR: [
              { verificado: false },
              { nombre: { equals: '' } },
              { apellido: { equals: '' } }
            ]
          },
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            rol: true,
            verificado: true
          },
          take: 50
        })

        return NextResponse.json({
          action: 'list-problematic',
          count: problematicUsers.length,
          users: problematicUsers,
          issues: {
            unverified: problematicUsers.filter(u => !u.verificado).length,
            incompleteNames: problematicUsers.filter(u => !u.nombre || !u.apellido).length
          }
        })

      case 'verify-user':
        if (!userId && !email) {
          return NextResponse.json({ error: 'userId o email requerido' }, { status: 400 })
        }

        const whereClause = userId ? { id: parseInt(userId) } : { email: email! }
        
        const updatedUser = await prisma.usuario.update({
          where: whereClause,
          data: { verificado: true },
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            verificado: true
          }
        })

        return NextResponse.json({
          action: 'verify-user',
          success: true,
          user: updatedUser
        })

      case 'chat-stats':
        // Estadísticas del sistema de chat
        const [totalUsers, verifiedUsers, chatRooms, totalMessages] = await Promise.all([
          prisma.usuario.count(),
          prisma.usuario.count({ where: { verificado: true } }),
          prisma.chat_room.count(),
          prisma.chat_message.count()
        ])

        const recentActivity = await prisma.chat_message.findMany({
          take: 10,
          orderBy: { enviado_en: 'desc' },
          include: {
            usuario: {
              select: { email: true, nombre: true, apellido: true }
            }
          }
        })

        return NextResponse.json({
          action: 'chat-stats',
          stats: {
            totalUsers,
            verifiedUsers,
            unverifiedUsers: totalUsers - verifiedUsers,
            chatRooms,
            totalMessages,
            verificationRate: Math.round((verifiedUsers / totalUsers) * 100)
          },
          recentActivity: recentActivity.map(msg => ({
            id: msg.id,
            contenido: msg.contenido.substring(0, 50) + '...',
            usuario: `${msg.usuario.nombre} ${msg.usuario.apellido}`,
            enviado_en: msg.enviado_en
          }))
        })

      case 'search-test':
        const query = searchParams.get('query') || ''
        
        const searchResults = await prisma.usuario.findMany({
          where: {
            AND: [
              {
                OR: [
                  { email: { contains: query, mode: 'insensitive' } },
                  { nombre: { contains: query, mode: 'insensitive' } },
                  { apellido: { contains: query, mode: 'insensitive' } }
                ]
              }
            ]
          },
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            rol: true,
            verificado: true
          },
          take: 20
        })

        return NextResponse.json({
          action: 'search-test',
          query,
          results: searchResults.length,
          users: searchResults
        })

      default:
        return NextResponse.json({
          error: 'Acción no válida',
          availableActions: [
            'list-problematic - Lista usuarios con problemas',
            'verify-user - Verifica un usuario (userId o email)',
            'chat-stats - Estadísticas del chat',
            'search-test - Prueba búsqueda (query)'
          ]
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error en admin tool:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// POST - Acciones de administración
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { action, userIds } = body

    switch (action) {
      case 'bulk-verify':
        if (!userIds || !Array.isArray(userIds)) {
          return NextResponse.json({ error: 'userIds array requerido' }, { status: 400 })
        }

        const bulkUpdate = await prisma.usuario.updateMany({
          where: { id: { in: userIds } },
          data: { verificado: true }
        })

        return NextResponse.json({
          action: 'bulk-verify',
          success: true,
          updatedCount: bulkUpdate.count
        })

      case 'reset-user-status':
        const { userId } = body
        if (!userId) {
          return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
        }

        // Resetear estado del usuario (simulado - actualizar cuando se implemente tabla de estado)
        console.log(`Reseteando estado para usuario ID: ${userId}`)

        return NextResponse.json({
          action: 'reset-user-status',
          success: true,
          userId
        })

      default:
        return NextResponse.json({
          error: 'Acción POST no válida',
          availableActions: [
            'bulk-verify - Verifica múltiples usuarios',
            'reset-user-status - Resetea estado de usuario'
          ]
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error en admin tool POST:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}