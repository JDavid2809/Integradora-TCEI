import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// Middleware para verificar autorización de admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user?.rol !== 'ADMIN') {
    return false
  }
  
  return true
}

// GET - Obtener todas las clases/imparte para pagos
export async function GET() {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const classes = await prisma.imparte.findMany({
      select: {
        id_imparte: true,
        curso: {
          select: {
            id_curso: true,
            nombre: true
          }
        },
        profesor: {
          select: {
            nombre: true,
            paterno: true
          }
        },
        nivel: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: [
        { curso: { nombre: 'asc' } },
        { nivel: { nombre: 'asc' } }
      ]
    })

    return NextResponse.json({
      success: true,
      classes
    })

  } catch (error) {
    console.error('Error fetching course classes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
