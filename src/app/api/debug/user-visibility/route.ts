import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// GET - Debug: Diagnosticar por qué un usuario no aparece
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Solo permitir en desarrollo o para administradores
    if (process.env.NODE_ENV === 'production' && session?.user?.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userId = searchParams.get('userId')

    if (!email && !userId) {
      return NextResponse.json({ error: 'Se requiere email o userId' }, { status: 400 })
    }

    // Buscar usuario por email o ID
    const whereClause = email ? { email } : { id: parseInt(userId!) }
    const user = await prisma.usuario.findUnique({
      where: whereClause,
      include: {
        estudiante: {
          include: {
            categoria_edad: true
          }
        },
        profesor: true,
        administrador: true,
        participaciones: {
          include: {
            chat_room: true
          }
        },
        mensajes: {
          take: 5,
          orderBy: { enviado_en: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        found: false,
        message: 'Usuario no encontrado en la base de datos',
        searchCriteria: { email, userId }
      })
    }

    // Diagnosticar problemas potenciales
    const diagnosis: {
      user: any
      issues: string[]
      suggestions: string[]
      chatStatus: any
      adminStatus?: any
    } = {
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        verificado: user.verificado,
        createdAt: user.estudiante?.id_usuario || user.profesor?.id_usuario || user.administrador?.id_usuario
      },
      issues: [],
      suggestions: [],
      chatStatus: {
        participationsCount: user.participaciones.length,
        messagesCount: user.mensajes.length,
        activeParticipations: user.participaciones.filter(p => p.activo).length
      }
    }

    // Verificar problemas comunes
    if (!user.verificado) {
      diagnosis.issues.push('Usuario no verificado (verificado = false)')
      diagnosis.suggestions.push('Verificar email del usuario o forzar verificación')
    }

    const userDetails = user.estudiante || user.profesor || user.administrador
    if (userDetails && 'b_activo' in userDetails && !userDetails.b_activo) {
      diagnosis.issues.push(`Usuario ${user.rol.toLowerCase()} inactivo (b_activo = false)`)
      diagnosis.suggestions.push('Activar usuario desde el panel de administración')
    }

    if (!user.nombre || !user.apellido) {
      diagnosis.issues.push('Nombre o apellido vacío')
      diagnosis.suggestions.push('Completar información básica del usuario')
    }

    if (user.participaciones.length === 0) {
      diagnosis.issues.push('Usuario no participa en ninguna sala de chat')
      diagnosis.suggestions.push('Agregar usuario a salas públicas (General, Soporte)')
    }

    // Verificar visibilidad en búsqueda de chat
    const currentUser = session?.user ? await prisma.usuario.findUnique({
      where: { email: session.user.email! }
    }) : null

    if (currentUser) {
      const searchResults = await prisma.usuario.findMany({
        where: {
          AND: [
            { id: { not: currentUser.id } },
            { verificado: true },
            {
              OR: [
                { nombre: { contains: user.nombre, mode: 'insensitive' } },
                { apellido: { contains: user.apellido, mode: 'insensitive' } },
                { email: { contains: user.email, mode: 'insensitive' } }
              ]
            }
          ]
        },
        select: { id: true }
      })

      diagnosis.chatStatus = {
        ...diagnosis.chatStatus,
        visibleInSearch: searchResults.some(u => u.id === user.id)
      }

      if (!searchResults.some(u => u.id === user.id)) {
        if (!user.verificado) {
          diagnosis.issues.push('No aparece en búsqueda: usuario no verificado')
        } else if (user.id === currentUser.id) {
          diagnosis.issues.push('No aparece en búsqueda: es el usuario actual (comportamiento esperado)')
        } else {
          diagnosis.issues.push('No aparece en búsqueda: causa desconocida')
        }
      }
    }

    // Verificar visibilidad en administración
    const adminSearchResults = await prisma.usuario.findMany({
      where: {
        OR: [
          { nombre: { contains: user.nombre, mode: 'insensitive' } },
          { apellido: { contains: user.apellido, mode: 'insensitive' } },
          { email: { contains: user.email, mode: 'insensitive' } }
        ]
      },
      select: { id: true }
    })

    diagnosis.adminStatus = {
      visibleInAdminSearch: adminSearchResults.some(u => u.id === user.id),
      totalUsersInSystem: await prisma.usuario.count()
    }

    // Sugerencias generales
    if (diagnosis.issues.length === 0) {
      diagnosis.suggestions.push('Usuario parece estar configurado correctamente')
    }

    return NextResponse.json({
      found: true,
      diagnosis,
      rawData: {
        user: {
          ...user,
          password: '[HIDDEN]' // No exponer contraseñas
        }
      }
    })

  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}