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

// GET - Obtener todos los pagos
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const estudianteId = searchParams.get('estudiante')
    const tipo = searchParams.get('tipo')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    let whereClause: any = {}
    
    if (estudianteId) {
      whereClause.id_estudiante = parseInt(estudianteId)
    }

    if (tipo && ['Mensualidad'].includes(tipo)) {
      whereClause.tipo = tipo
    }

    if (fechaInicio || fechaFin) {
      whereClause.fecha_pago = {}
      if (fechaInicio) {
        whereClause.fecha_pago.gte = new Date(fechaInicio)
      }
      if (fechaFin) {
        whereClause.fecha_pago.lte = new Date(fechaFin)
      }
    }

    const [payments, total] = await Promise.all([
      prisma.pago.findMany({
        where: whereClause,
        skip,
        take: limit,
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
        },
        orderBy: {
          fecha_pago: 'desc'
        }
      }),
      prisma.pago.count({ where: whereClause })
    ])

    const paymentsWithDetails = payments.map(payment => ({
      id: payment.id_pago,
      estudiante: payment.estudiante ? {
        id: payment.estudiante.id_estudiante,
        nombre: `${payment.estudiante.usuario.nombre} ${payment.estudiante.usuario.apellido}`,
        email: payment.estudiante.usuario.email
      } : null,
      curso: {
        id: payment.imparte.curso.id_curso,
        nombre: payment.imparte.curso.nombre,
        modalidad: payment.imparte.curso.modalidad
      },
      nivel: payment.imparte.nivel.nombre,
      profesor: `${payment.imparte.profesor.usuario.nombre} ${payment.imparte.profesor.usuario.apellido}`,
      monto: Number(payment.monto),
      fecha_pago: payment.fecha_pago,
      tipo: payment.tipo
    }))

    // Calcular estadísticas
    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.monto), 0)
    const monthlyStats = payments.reduce((acc, payment) => {
      const month = payment.fecha_pago.toISOString().slice(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + Number(payment.monto)
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      payments: paymentsWithDetails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statistics: {
        total_amount: totalAmount,
        average_payment: payments.length > 0 ? totalAmount / payments.length : 0,
        monthly_stats: monthlyStats
      }
    })

  } catch (error) {
    console.error('Error al obtener pagos:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nuevo pago
export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id_estudiante, id_imparte, monto, fecha_pago, tipo } = body

    if (!id_imparte || !monto || !fecha_pago || !tipo) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (!['Mensualidad'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo de pago inválido' }, { status: 400 })
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

    // Verificar que el imparte existe
    const imparte = await prisma.imparte.findUnique({
      where: { id_imparte: parseInt(id_imparte) },
      include: {
        curso: true,
        nivel: true,
        profesor: {
          include: {
            usuario: true
          }
        }
      }
    })

    if (!imparte) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 400 })
    }

    const newPayment = await prisma.pago.create({
      data: {
        id_estudiante: id_estudiante ? parseInt(id_estudiante) : null,
        id_imparte: parseInt(id_imparte),
        monto: parseFloat(monto),
        fecha_pago: new Date(fecha_pago),
        tipo
      },
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
      message: 'Pago registrado exitosamente',
      payment: {
        id: newPayment.id_pago,
        estudiante: newPayment.estudiante ? {
          id: newPayment.estudiante.id_estudiante,
          nombre: `${newPayment.estudiante.usuario.nombre} ${newPayment.estudiante.usuario.apellido}`,
          email: newPayment.estudiante.usuario.email
        } : null,
        curso: {
          id: newPayment.imparte.curso.id_curso,
          nombre: newPayment.imparte.curso.nombre,
          modalidad: newPayment.imparte.curso.modalidad
        },
        nivel: newPayment.imparte.nivel.nombre,
        profesor: `${newPayment.imparte.profesor.usuario.nombre} ${newPayment.imparte.profesor.usuario.apellido}`,
        monto: Number(newPayment.monto),
        fecha_pago: newPayment.fecha_pago,
        tipo: newPayment.tipo
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear pago:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
