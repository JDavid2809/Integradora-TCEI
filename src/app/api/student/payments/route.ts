import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// Middleware para verificar que es estudiante
async function checkStudentAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.rol !== 'ESTUDIANTE') {
    return null;
  }
  
  return session;
}

// GET - Obtener historial de pagos propio
export async function GET() {
  try {
    const session = await checkStudentAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el estudiante
    const student = await prisma.estudiante.findUnique({
      where: {
        id_usuario: parseInt(session.user.id)
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    // Obtener historial de pagos
    const payments = await prisma.pago.findMany({
      where: {
        id_estudiante: student.id_estudiante
      },
      include: {
        imparte: {
          include: {
            curso: {
              select: {
                nombre: true,
                modalidad: true
              }
            },
            profesor: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true
                  }
                }
              }
            },
            nivel: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha_pago: 'desc'
      }
    });

    const paymentsData = payments.map(payment => ({
      id_pago: payment.id_pago,
      monto: Number(payment.monto),
      fecha: payment.fecha_pago,
      tipo: payment.tipo,
      curso: {
        nombre: payment.imparte.curso.nombre,
        modalidad: payment.imparte.curso.modalidad,
        nivel: payment.imparte.nivel?.nombre || 'No especificado',
        profesor: `${payment.imparte.profesor.usuario.nombre} ${payment.imparte.profesor.usuario.apellido}`
      }
    }));

    // Calcular estadísticas
    const totalPagado = paymentsData.reduce((sum, payment) => sum + payment.monto, 0);
    const pagosPorTipo = paymentsData.reduce((acc, payment) => {
      acc[payment.tipo] = (acc[payment.tipo] || 0) + payment.monto;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      total_pagos: paymentsData.length,
      total_monto: totalPagado,
      pagos_por_tipo: pagosPorTipo,
      historial: paymentsData
    });

  } catch (error) {
    console.error("Error al obtener historial de pagos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Procesar transacción de pago
export async function POST(request: NextRequest) {
  try {
    const session = await checkStudentAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const { id_imparte, monto, tipo } = data;

    // Validaciones
    if (!id_imparte || !monto || !tipo) {
      return NextResponse.json({ 
        error: "Datos requeridos: id_imparte, monto, tipo" 
      }, { status: 400 });
    }

    if (typeof monto !== 'number' || monto <= 0) {
      return NextResponse.json({ 
        error: "El monto debe ser un número positivo" 
      }, { status: 400 });
    }

    // Verificar que el curso existe y el estudiante está inscrito
    const student = await prisma.estudiante.findUnique({
      where: {
        id_usuario: parseInt(session.user.id)
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    // Verificar que el estudiante está inscrito en el curso
    const enrollment = await prisma.horario.findFirst({
      where: {
        id_estudiante: student.id_estudiante,
        curso: {
          imparte: {
            some: {
              id_imparte: parseInt(id_imparte)
            }
          }
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json({ 
        error: "No estás inscrito en este curso" 
      }, { status: 403 });
    }

    // Crear el pago
    const newPayment = await prisma.pago.create({
      data: {
        monto: monto,
        fecha_pago: new Date(),
        tipo: tipo,
        id_imparte: parseInt(id_imparte),
        id_estudiante: student.id_estudiante
      },
      include: {
        imparte: {
          include: {
            curso: {
              select: {
                nombre: true,
                modalidad: true
              }
            },
            profesor: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true
                  }
                }
              }
            },
            nivel: {
              select: {
                nombre: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: "Pago procesado exitosamente",
      pago: {
        id_pago: newPayment.id_pago,
        monto: Number(newPayment.monto),
        fecha: newPayment.fecha_pago,
        tipo: newPayment.tipo,
        curso: {
          nombre: newPayment.imparte.curso.nombre,
          modalidad: newPayment.imparte.curso.modalidad,
          nivel: newPayment.imparte.nivel?.nombre || 'No especificado',
          profesor: `${newPayment.imparte.profesor.usuario.nombre} ${newPayment.imparte.profesor.usuario.apellido}`
        }
      }
    });

  } catch (error) {
    console.error("Error al procesar pago:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
