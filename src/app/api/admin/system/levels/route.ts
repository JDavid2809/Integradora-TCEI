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

// GET - Obtener todos los niveles
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

    const levels = await prisma.nivel.findMany({
      where: whereClause,
      include: includeStats ? {
        examen: true,
        imparte: {
          include: {
            curso: true,
            profesor: {
              include: {
                usuario: true
              }
            }
          }
        }
      } : undefined,
      orderBy: {
        id_nivel: 'asc'
      }
    })

    const levelsWithStats = levels.map(level => {
      const baseLevel = {
        id: level.id_nivel,
        nombre: level.nombre,
        activo: level.b_activo
      }

      if (includeStats && 'examen' in level && 'imparte' in level) {
        const examenes = Array.isArray(level.examen) ? level.examen : []
        const impartes = Array.isArray(level.imparte) ? level.imparte : []
        
        return {
          ...baseLevel,
          total_examenes: examenes.length,
          total_clases: impartes.length,
          profesores_asignados: impartes.map((imp: any) => ({
            id: imp.profesor.id_profesor,
            nombre: `${imp.profesor.usuario.nombre} ${imp.profesor.usuario.apellido}`,
            curso: imp.curso.nombre
          }))
        }
      }

      return baseLevel
    })

    return NextResponse.json({
      levels: levelsWithStats
    })

  } catch (error) {
    console.error('Error al obtener niveles:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nuevo nivel
export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nombre } = body

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    // Verificar que el nombre no existe
    const existingLevel = await prisma.nivel.findUnique({
      where: { nombre }
    })

    if (existingLevel) {
      return NextResponse.json({ error: 'Ya existe un nivel con ese nombre' }, { status: 400 })
    }

    const newLevel = await prisma.nivel.create({
      data: {
        nombre,
        b_activo: true
      }
    })

    return NextResponse.json({
      message: 'Nivel creado exitosamente',
      level: {
        id: newLevel.id_nivel,
        nombre: newLevel.nombre,
        activo: newLevel.b_activo
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear nivel:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar nivel (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, nombre, activo } = body

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    // Verificar que el nivel existe
    const existingLevel = await prisma.nivel.findUnique({
      where: { id_nivel: parseInt(id) }
    })

    if (!existingLevel) {
      return NextResponse.json({ error: 'Nivel no encontrado' }, { status: 404 })
    }

    // Verificar que el nombre no existe en otro nivel si se está cambiando
    if (nombre && nombre !== existingLevel.nombre) {
      const nameExists = await prisma.nivel.findUnique({
        where: { nombre }
      })
      
      if (nameExists) {
        return NextResponse.json({ error: 'Ya existe un nivel con ese nombre' }, { status: 400 })
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {}
    if (nombre) updateData.nombre = nombre
    if (activo !== undefined) updateData.b_activo = activo

    const updatedLevel = await prisma.nivel.update({
      where: { id_nivel: parseInt(id) },
      data: updateData
    })

    return NextResponse.json({
      message: 'Nivel actualizado exitosamente',
      level: {
        id: updatedLevel.id_nivel,
        nombre: updatedLevel.nombre,
        activo: updatedLevel.b_activo
      }
    })

  } catch (error) {
    console.error('Error al actualizar nivel:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar nivel
export async function DELETE(request: NextRequest) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    const levelId = parseInt(id)

    // Verificar que el nivel existe
    const existingLevel = await prisma.nivel.findUnique({
      where: { id_nivel: levelId },
      include: {
        examen: true,
        imparte: true
      }
    })

    if (!existingLevel) {
      return NextResponse.json({ error: 'Nivel no encontrado' }, { status: 404 })
    }

    // Verificar si hay dependencias
    if (existingLevel.examen.length > 0 || existingLevel.imparte.length > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar el nivel porque tiene exámenes o clases asociadas' 
      }, { status: 400 })
    }

    await prisma.nivel.delete({
      where: { id_nivel: levelId }
    })

    return NextResponse.json({
      message: 'Nivel eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar nivel:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
