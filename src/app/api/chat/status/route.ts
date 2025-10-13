import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// PUT - Actualizar estado de conexión del usuario
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { isOnline } = await request.json()

    if (typeof isOnline !== 'boolean') {
      return NextResponse.json({ error: 'Estado de conexión inválido' }, { status: 400 })
    }

    // Actualizar el último visto en todas las participaciones activas del usuario
    if (isOnline) {
      await prisma.chat_participant.updateMany({
        where: {
          usuario_id: Number(session.user.id),
          activo: true
        },
        data: {
          ultimo_visto: new Date()
        }
      })
    }

    // En una implementación completa, aquí actualizarías un campo de estado en línea
    // Por ahora, solo actualizamos el último_visto

    return NextResponse.json({ 
      success: true, 
      isOnline,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}