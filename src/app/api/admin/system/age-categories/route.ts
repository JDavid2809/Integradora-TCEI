import { NextResponse, NextRequest } from 'next/server'
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

// GET - Obtener todas las categorías de edad
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activo = searchParams.get('activo')
    const includeStats = searchParams.get('includeStats') === 'true'

    let whereClause: any = {}
    
    if (activo !== null && activo !== undefined) {
      whereClause.b_activo = activo === 'true'
    }

    const categories = await prisma.categoria_edad.findMany({
      where: whereClause,
      include: includeStats ? {
        estudiante: {
          where: { b_activo: true },
          include: {
            usuario: true
          }
        }
      } : undefined,
      orderBy: {
        id_categoria_edad: 'asc'
      }
    })

    const categoriesWithStats = categories.map(category => {
      const baseCategory = {
        id: category.id_categoria_edad,
        rango: category.rango,
        activo: category.b_activo
      }

      if (includeStats && 'estudiante' in category) {
        const estudiantes = Array.isArray(category.estudiante) ? category.estudiante : []
        
        return {
          ...baseCategory,
          total_estudiantes: estudiantes.length,
          estudiantes: estudiantes.map((est: any) => ({
            id: est.id_estudiante,
            nombre: `${est.usuario.nombre} ${est.usuario.apellido}`,
            email: est.usuario.email,
            edad: est.edad
          }))
        }
      }

      return baseCategory
    })

    return NextResponse.json({
      categories: categoriesWithStats
    })

  } catch (error) {
    console.error('Error al obtener categorías de edad:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nueva categoría de edad
export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { rango } = body

    if (!rango) {
      return NextResponse.json({ error: 'El rango es requerido' }, { status: 400 })
    }

    const newCategory = await prisma.categoria_edad.create({
      data: {
        rango,
        b_activo: true
      }
    })

    return NextResponse.json({
      message: 'Categoría de edad creada exitosamente',
      category: {
        id: newCategory.id_categoria_edad,
        rango: newCategory.rango,
        activo: newCategory.b_activo
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear categoría de edad:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
