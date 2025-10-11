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

// GET - Obtener todos los cursos
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const modalidad = searchParams.get('modalidad')
    const activo = searchParams.get('activo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    let whereClause: Record<string, unknown> = {}
    
    if (modalidad && ['PRESENCIAL', 'ONLINE'].includes(modalidad)) {
      whereClause.modalidad = modalidad
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

    const [courses, total] = await Promise.all([
      prisma.curso.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          imparte: {
            include: {
              profesor: {
                include: {
                  usuario: true
                }
              },
              nivel: true,
              historial_academico: true,
              pago: true
            }
          },
          horario: {
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
          id_curso: 'desc'
        }
      }),
      prisma.curso.count({ where: whereClause })
    ])

    const coursesWithStats = courses.map(course => ({
      id: course.id_curso,
      nombre: course.nombre,
      modalidad: course.modalidad,
      inicio: course.inicio,
      fin: course.fin,
      activo: course.b_activo,
      profesores: course.imparte.map(imp => ({
        id: imp.profesor.id_profesor,
        nombre: `${imp.profesor.usuario.nombre} ${imp.profesor.usuario.apellido}`,
        nivel: imp.nivel.nombre
      })),
      estudiantes_inscritos: course.horario.length,
      total_pagos: course.imparte.reduce((sum, imp) => 
        sum + imp.pago.reduce((pSum, pago) => pSum + Number(pago.monto), 0), 0
      )
    }))

    return NextResponse.json({
      courses: coursesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error al obtener cursos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nuevo curso
export async function POST(request: NextRequest) {
  try {
    // Admin has read/update/delete permissions, but must NOT create courses per spec
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Creación de cursos no permitida para ADMIN' }, { status: 403 })
  } catch (error) {
    console.error('Error al crear curso:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
