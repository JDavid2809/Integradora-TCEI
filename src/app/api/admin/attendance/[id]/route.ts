import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/attendance/[id]
 * Obtiene un registro de asistencia específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const id = parseInt(params.id)

    const record = await prisma.historial_academico.findUnique({
      where: { id_historial: id },
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
            curso: { select: { id_curso: true, nombre: true } },
            nivel: { select: { id_nivel: true, nombre: true } },
            profesor: {
              select: {
                id_profesor: true,
                nombre: true,
                paterno: true
              }
            }
          }
        }
      }
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ attendance: record })

  } catch (error) {
    console.error('Error al obtener asistencia:', error)
    return NextResponse.json(
      { error: 'Error al obtener asistencia' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/attendance/[id]
 * Actualiza un registro de asistencia
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const id = parseInt(params.id)
    const body = await request.json()
    const { asistencia, calificacion, tipo, comentario, fecha } = body

    // Verificar que el registro existe
    const existing = await prisma.historial_academico.findUnique({
      where: { id_historial: id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      )
    }

    // Validaciones
    if (asistencia !== undefined && (asistencia < 0 || asistencia > 100)) {
      return NextResponse.json(
        { error: 'La asistencia debe estar entre 0 y 100' },
        { status: 400 }
      )
    }

    // Actualizar registro
    const updated = await prisma.historial_academico.update({
      where: { id_historial: id },
      data: {
        asistencia: asistencia !== undefined ? parseFloat(asistencia) : existing.asistencia,
        calificacion: calificacion !== undefined ? parseFloat(calificacion) : existing.calificacion,
        tipo: tipo !== undefined ? tipo : existing.tipo,
        comentario: comentario !== undefined ? comentario : existing.comentario,
        fecha: fecha ? new Date(fecha) : existing.fecha
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
      message: 'Asistencia actualizada exitosamente',
      attendance: updated
    })

  } catch (error) {
    console.error('Error al actualizar asistencia:', error)
    return NextResponse.json(
      { error: 'Error al actualizar asistencia' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/attendance/[id]
 * Elimina un registro de asistencia
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const id = parseInt(params.id)

    // Verificar que el registro existe
    const existing = await prisma.historial_academico.findUnique({
      where: { id_historial: id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar registro
    await prisma.historial_academico.delete({
      where: { id_historial: id }
    })

    return NextResponse.json({
      message: 'Asistencia eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar asistencia:', error)
    return NextResponse.json(
      { error: 'Error al eliminar asistencia' },
      { status: 500 }
    )
  }
}
