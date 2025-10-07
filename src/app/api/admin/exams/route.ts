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

// GET - Obtener todos los exámenes
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const nivelId = searchParams.get('nivel')
    const activo = searchParams.get('activo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Tipado explícito para el filtro de exámenes
    let whereClause: {
      id_nivel?: number;
      b_activo?: boolean;
      nombre?: { contains: string; mode: 'insensitive' };
    } = {};
    
    if (nivelId) {
      whereClause.id_nivel = parseInt(nivelId)
    }

    if (activo !== null && activo !== undefined) {
      whereClause.b_activo = activo === 'true'
    }

    if (search) {
      whereClause.nombre = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const [exams, total] = await Promise.all([
      prisma.examen.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          nivel: true,
          pregunta: {
            include: {
              respuesta: true
            }
          },
          resultado_examen: {
            include: {
              estudiante: {
                include: {
                  usuario: true
                }
              }
            }
          }
        },
        orderBy: {
          id_examen: 'desc'
        }
      }),
      prisma.examen.count({ where: whereClause })
    ])

    const examsWithStats = exams.map(exam => ({
      id: exam.id_examen,
      nombre: exam.nombre,
      nivel: exam.nivel?.nombre || 'Sin nivel',
      activo: exam.b_activo,
      total_preguntas: exam.pregunta.length,
      resultados_registrados: exam.resultado_examen.length,
      promedio_calificaciones: exam.resultado_examen.length > 0 
        ? exam.resultado_examen.reduce((sum, res) => sum + Number(res.calificacion), 0) / exam.resultado_examen.length
        : 0,
      ultimo_resultado: exam.resultado_examen.length > 0 
        ? exam.resultado_examen.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0].fecha
        : null
    }))

    return NextResponse.json({
      exams: examsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error al obtener exámenes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nuevo examen
export async function POST(request: NextRequest) {
  try {
    // Admin has read/update/delete permissions, but must NOT create exams per spec
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Creación de exámenes no permitida para ADMIN' }, { status: 403 })

  } catch (error) {
    console.error('Error al crear examen:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
