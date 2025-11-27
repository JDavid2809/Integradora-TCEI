import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/getUserFromSession'

/**
 * GET /api/admin/attendance
 * Obtiene todos los registros de asistencia con filtros
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Construir filtros
    // Tipado explícito para el filtro de asistencia
    const where: {
      id_estudiante?: number;
      fecha?: { gte?: Date; lte?: Date };
      id_imparte?: { in: number[] };
    } = {};

    if (studentId) {
      where.id_estudiante = parseInt(studentId)
    }

    if (startDate || endDate) {
      where.fecha = {}
      if (startDate) where.fecha.gte = new Date(startDate)
      if (endDate) where.fecha.lte = new Date(endDate)
    }

    // Si se filtra por curso, necesitamos filtrar por id_imparte
    let imparteIds: number[] = []
    if (courseId) {
      const imparteRecords = await prisma.imparte.findMany({
        where: { id_curso: parseInt(courseId) },
        select: { id_imparte: true }
      })
      imparteIds = imparteRecords.map(i => i.id_imparte)
      if (imparteIds.length > 0) {
        where.id_imparte = { in: imparteIds }
      } else {
        // Si no hay clases para ese curso, devolver vacío
        return NextResponse.json({
          attendance: [],
          total: 0,
          page,
          totalPages: 0
        })
      }
    }

    // Obtener registros de asistencia del historial académico
    const [attendance, total] = await Promise.all([
      prisma.historial_academico.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fecha: 'desc' },
        include: {
          estudiante: {
            select: {
              id_estudiante: true,
              nombre: true,
              paterno: true,
              materno: true,
              email: true
            }
          },
          imparte: {
            include: {
              curso: {
                select: {
                  id_curso: true,
                  nombre: true
                }
              },
              nivel: {
                select: {
                  id_nivel: true,
                  nombre: true
                }
              },
              profesor: {
                select: {
                  id_profesor: true,
                  nombre: true,
                  paterno: true,
                  materno: true
                }
              }
            }
          }
        }
      }),
      prisma.historial_academico.count({ where })
    ])

    return NextResponse.json({
      attendance: attendance.map(record => ({
        id: record.id_historial,
        estudiante: {
          id: record.estudiante.id_estudiante,
          nombre: `${record.estudiante.nombre} ${record.estudiante.paterno || ''} ${record.estudiante.materno || ''}`.trim(),
          email: record.estudiante.email
        },
        curso: record.imparte.curso.nombre,
        nivel: record.imparte.nivel.nombre,
        profesor: `${record.imparte.profesor.nombre} ${record.imparte.profesor.paterno || ''}`.trim(),
        asistencia: record.asistencia,
        fecha: record.fecha,
        calificacion: record.calificacion,
        tipo: record.tipo,
        comentario: record.comentario
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Error al obtener asistencias:', error)
    return NextResponse.json(
      { error: 'Error al obtener asistencias' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/attendance
 * Crea un nuevo registro de asistencia
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      id_estudiante, 
      id_imparte, 
      asistencia, 
      fecha,
      calificacion,
      tipo,
      comentario 
    } = body

    // Validaciones
    if (!id_estudiante || !id_imparte) {
      return NextResponse.json(
        { error: 'Estudiante e imparte son requeridos' },
        { status: 400 }
      )
    }

    if (asistencia !== undefined && (asistencia < 0 || asistencia > 100)) {
      return NextResponse.json(
        { error: 'La asistencia debe estar entre 0 y 100' },
        { status: 400 }
      )
    }

    // Verificar que el estudiante y la clase existan
    const [estudiante, imparte] = await Promise.all([
      prisma.estudiante.findUnique({
        where: { id_estudiante: parseInt(id_estudiante) }
      }),
      prisma.imparte.findUnique({
        where: { id_imparte: parseInt(id_imparte) }
      })
    ])

    if (!estudiante) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      )
    }

    if (!imparte) {
      return NextResponse.json(
        { error: 'Clase no encontrada' },
        { status: 404 }
      )
    }

    // Obtener el ID del administrador desde la sesión
    const usuario = await getUserFromSession(session)

    const adminId = (usuario as any)?.administrador?.id_administrador

    if (!adminId) {
      return NextResponse.json(
        { error: 'Usuario administrador no encontrado' },
        { status: 404 }
      )
    }

    // Crear registro de asistencia
    const record = await prisma.historial_academico.create({
      data: {
        id_estudiante: parseInt(id_estudiante),
        id_imparte: parseInt(id_imparte),
        id_capturo: adminId, // ID del admin que lo creó
        tipo_capturo: 'USER',
        asistencia: asistencia ? parseFloat(asistencia) : null,
        fecha: fecha ? new Date(fecha) : new Date(),
        calificacion: calificacion ? parseFloat(calificacion) : null,
        tipo: tipo || null,
        comentario: comentario || null
      },
      include: {
        estudiante: {
          select: {
            nombre: true,
            paterno: true,
            email: true
          }
        },
        imparte: {
          include: {
            curso: { select: { nombre: true } },
            nivel: { select: { nombre: true } }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Asistencia registrada exitosamente',
      attendance: record
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear asistencia:', error)
    return NextResponse.json(
      { error: 'Error al crear asistencia' },
      { status: 500 }
    )
  }
}
