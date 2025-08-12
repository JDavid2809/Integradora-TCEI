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

    let whereClause: any = {}
    
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
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nombre, id_nivel, preguntas } = body

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    // Verificar que el nivel existe si se proporciona
    if (id_nivel) {
      const nivel = await prisma.nivel.findUnique({
        where: { id_nivel: parseInt(id_nivel) }
      })

      if (!nivel) {
        return NextResponse.json({ error: 'Nivel no encontrado' }, { status: 400 })
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Crear examen
      const newExam = await tx.examen.create({
        data: {
          nombre,
          id_nivel: id_nivel ? parseInt(id_nivel) : null,
          b_activo: true
        }
      })

      // Crear preguntas si se proporcionan
      if (preguntas && Array.isArray(preguntas)) {
        for (const pregunta of preguntas) {
          const newQuestion = await tx.pregunta.create({
            data: {
              id_examen: newExam.id_examen,
              descripcion: pregunta.descripcion,
              ruta_file_media: pregunta.ruta_file_media || null
            }
          })

          // Crear respuestas para la pregunta
          if (pregunta.respuestas && Array.isArray(pregunta.respuestas)) {
            for (const respuesta of pregunta.respuestas) {
              await tx.respuesta.create({
                data: {
                  id_pregunta: newQuestion.id_pregunta,
                  descripcion: respuesta.descripcion,
                  ruta_file_media: respuesta.ruta_file_media || null,
                  es_correcta: respuesta.es_correcta || false
                }
              })
            }
          }
        }
      }

      return newExam
    })

    return NextResponse.json({
      message: 'Examen creado exitosamente',
      exam: {
        id: result.id_examen,
        nombre: result.nombre,
        id_nivel: result.id_nivel,
        activo: result.b_activo
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear examen:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
