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

// GET - Obtener pago específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const paymentId = parseInt(id)
    
    const payment = await prisma.pago.findUnique({
      where: { id_pago: paymentId },
      include: {
        estudiante: {
          include: {
            usuario: true,
            categoria_edad: true
          }
        },
        imparte: {
          include: {
            curso: true,
            nivel: true,
            profesor: {
              include: {
                usuario: true
              }
            }
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    const paymentData = {
      id: payment.id_pago,
      estudiante: payment.estudiante ? {
        id: payment.estudiante.id_estudiante,
        nombre: `${payment.estudiante.usuario.nombre} ${payment.estudiante.usuario.apellido}`,
        email: payment.estudiante.usuario.email,
        telefono: payment.estudiante.telefono,
        edad: payment.estudiante.edad,
        categoria_edad: payment.estudiante.categoria_edad?.rango
      } : null,
      curso: {
        id: payment.imparte.curso.id_curso,
        nombre: payment.imparte.curso.nombre,
        modalidad: payment.imparte.curso.modalidad,
        inicio: payment.imparte.curso.inicio,
        fin: payment.imparte.curso.fin
      },
      nivel: {
        id: payment.imparte.nivel.id_nivel,
        nombre: payment.imparte.nivel.nombre
      },
      profesor: {
        id: payment.imparte.profesor.id_profesor,
        nombre: `${payment.imparte.profesor.usuario.nombre} ${payment.imparte.profesor.usuario.apellido}`,
        email: payment.imparte.profesor.usuario.email
      },
      clase: {
        id: payment.imparte.id_imparte,
        dias: payment.imparte.dias,
        hora_inicio: payment.imparte.hora_inicio,
        duracion_min: payment.imparte.duracion_min,
        tipo: payment.imparte.tipo
      },
      monto: Number(payment.monto),
      fecha_pago: payment.fecha_pago,
      tipo: payment.tipo
    }

    return NextResponse.json(paymentData)

  } catch (error) {
    console.error('Error al obtener pago:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar pago
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const paymentId = parseInt(id)
    const body = await request.json()
    const { id_estudiante, id_imparte, monto, fecha_pago, tipo } = body

    // Verificar que el pago existe
    const existingPayment = await prisma.pago.findUnique({
      where: { id_pago: paymentId }
    })

    if (!existingPayment) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    // Verificar que el estudiante existe si se proporciona
    if (id_estudiante) {
      const estudiante = await prisma.estudiante.findUnique({
        where: { id_estudiante: parseInt(id_estudiante) }
      })

      if (!estudiante) {
        return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 400 })
      }
    }

    // Verificar que el imparte existe si se proporciona
    if (id_imparte) {
      const imparte = await prisma.imparte.findUnique({
        where: { id_imparte: parseInt(id_imparte) }
      })

      if (!imparte) {
        return NextResponse.json({ error: 'Clase no encontrada' }, { status: 400 })
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {}
    if (id_estudiante !== undefined) updateData.id_estudiante = id_estudiante ? parseInt(id_estudiante) : null
    if (id_imparte) updateData.id_imparte = parseInt(id_imparte)
    if (monto !== undefined) updateData.monto = parseFloat(monto)
    if (fecha_pago) updateData.fecha_pago = new Date(fecha_pago)
    if (tipo && ['Mensualidad'].includes(tipo)) updateData.tipo = tipo

    const updatedPayment = await prisma.pago.update({
      where: { id_pago: paymentId },
      data: updateData,
      include: {
        estudiante: {
          include: {
            usuario: true
          }
        },
        imparte: {
          include: {
            curso: true,
            nivel: true,
            profesor: {
              include: {
                usuario: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Pago actualizado exitosamente',
      payment: {
        id: updatedPayment.id_pago,
        estudiante: updatedPayment.estudiante ? {
          id: updatedPayment.estudiante.id_estudiante,
          nombre: `${updatedPayment.estudiante.usuario.nombre} ${updatedPayment.estudiante.usuario.apellido}`,
          email: updatedPayment.estudiante.usuario.email
        } : null,
        curso: {
          id: updatedPayment.imparte.curso.id_curso,
          nombre: updatedPayment.imparte.curso.nombre,
          modalidad: updatedPayment.imparte.curso.modalidad
        },
        nivel: updatedPayment.imparte.nivel.nombre,
        profesor: `${updatedPayment.imparte.profesor.usuario.nombre} ${updatedPayment.imparte.profesor.usuario.apellido}`,
        monto: Number(updatedPayment.monto),
        fecha_pago: updatedPayment.fecha_pago,
        tipo: updatedPayment.tipo
      }
    })

  } catch (error) {
    console.error('Error al actualizar pago:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar pago
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const paymentId = parseInt(id)

    // Verificar que el pago existe
    const existingPayment = await prisma.pago.findUnique({
      where: { id_pago: paymentId }
    })

    if (!existingPayment) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    await prisma.pago.delete({
      where: { id_pago: paymentId }
    })

    return NextResponse.json({
      message: 'Pago eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar pago:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
