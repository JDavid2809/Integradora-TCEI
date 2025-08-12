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

// GET - Obtener estadísticas del sistema
export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await checkAdminAuth()
    if (!isAuthorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // month, week, year

    // Calcular fechas para el período
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'month':
      default:
        startDate.setMonth(now.getMonth() - 1)
        break
    }

    // Obtener estadísticas generales
    const [
      totalUsuarios,
      totalEstudiantes,
      totalProfesores,
      totalAdministradores,
      estudiantesActivos,
      profesoresActivos,
      totalCursos,
      cursosActivos,
      totalExamenes,
      examenesActivos,
      totalPagos,
      totalIngresosPeriodo,
      totalIngresosGeneral,
      resultadosExamenes
    ] = await Promise.all([
      // Usuarios
      prisma.usuario.count(),
      prisma.estudiante.count(),
      prisma.profesor.count(),
      prisma.administrador.count(),
      prisma.estudiante.count({ where: { b_activo: true } }),
      prisma.profesor.count({ where: { b_activo: true } }),
      
      // Cursos
      prisma.curso.count(),
      prisma.curso.count({ where: { b_activo: true } }),
      
      // Exámenes
      prisma.examen.count(),
      prisma.examen.count({ where: { b_activo: true } }),
      
      // Pagos
      prisma.pago.count(),
      prisma.pago.aggregate({
        where: { fecha_pago: { gte: startDate } },
        _sum: { monto: true }
      }),
      prisma.pago.aggregate({
        _sum: { monto: true }
      }),
      
      // Resultados de exámenes
      prisma.resultado_examen.count({
        where: { fecha: { gte: startDate } }
      })
    ])

    // Obtener datos de crecimiento por mes (últimos 12 meses)
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      monthEnd.setDate(0)
      monthEnd.setHours(23, 59, 59, 999)

      const [nuevosEstudiantes, nuevosProfesores, ingresosMes, examenesTomados] = await Promise.all([
        prisma.estudiante.count({
          where: {
            usuario: {
              email: {
                contains: '@'
              }
            }
          }
        }),
        prisma.profesor.count({
          where: {
            usuario: {
              email: {
                contains: '@'
              }
            }
          }
        }),
        prisma.pago.aggregate({
          where: {
            fecha_pago: {
              gte: monthStart,
              lte: monthEnd
            }
          },
          _sum: { monto: true }
        }),
        prisma.resultado_examen.count({
          where: {
            fecha: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        })
      ])

      monthlyData.push({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM
        nuevos_estudiantes: nuevosEstudiantes,
        nuevos_profesores: nuevosProfesores,
        ingresos: Number(ingresosMes._sum.monto || 0),
        examenes_tomados: examenesTomados
      })
    }

    // Obtener top cursos por estudiantes inscritos
    const topCursos = await prisma.curso.findMany({
      include: {
        horario: true,
        imparte: {
          include: {
            pago: true
          }
        }
      },
      orderBy: {
        horario: {
          _count: 'desc'
        }
      },
      take: 5
    })

    const topCursosData = topCursos.map(curso => ({
      id: curso.id_curso,
      nombre: curso.nombre,
      modalidad: curso.modalidad,
      estudiantes_inscritos: curso.horario.length,
      total_ingresos: curso.imparte.reduce((sum, imp) => 
        sum + imp.pago.reduce((pSum, pago) => pSum + Number(pago.monto), 0), 0
      )
    }))

    // Obtener distribución por edades
    const categoriaEdades = await prisma.categoria_edad.findMany({
      include: {
        estudiante: {
          where: { b_activo: true }
        }
      }
    })

    const distribucionEdades = categoriaEdades.map(cat => ({
      categoria: cat.rango,
      estudiantes: cat.estudiante.length
    }))

    // Obtener actividad reciente
    const actividadReciente = await Promise.all([
      prisma.usuario.findMany({
        take: 5,
        orderBy: { id: 'desc' },
        include: {
          estudiante: true,
          profesor: true,
          administrador: true
        }
      }),
      prisma.pago.findMany({
        take: 5,
        orderBy: { fecha_pago: 'desc' },
        include: {
          estudiante: {
            include: { usuario: true }
          },
          imparte: {
            include: { curso: true }
          }
        }
      }),
      prisma.resultado_examen.findMany({
        take: 5,
        orderBy: { fecha: 'desc' },
        include: {
          estudiante: {
            include: { usuario: true }
          },
          examen: true
        }
      })
    ])

    const estadisticas = {
      resumen: {
        total_usuarios: totalUsuarios,
        total_estudiantes: totalEstudiantes,
        total_profesores: totalProfesores,
        total_administradores: totalAdministradores,
        estudiantes_activos: estudiantesActivos,
        profesores_activos: profesoresActivos,
        total_cursos: totalCursos,
        cursos_activos: cursosActivos,
        total_examenes: totalExamenes,
        examenes_activos: examenesActivos,
        total_pagos: totalPagos,
        ingresos_periodo: Number(totalIngresosPeriodo._sum.monto || 0),
        ingresos_total: Number(totalIngresosGeneral._sum.monto || 0),
        examenes_tomados_periodo: resultadosExamenes
      },
      crecimiento_mensual: monthlyData,
      top_cursos: topCursosData,
      distribucion_edades: distribucionEdades,
      actividad_reciente: {
        nuevos_usuarios: actividadReciente[0].map(user => ({
          id: user.id,
          nombre: `${user.nombre} ${user.apellido}`,
          email: user.email,
          rol: user.rol,
          tipo_perfil: user.estudiante ? 'Estudiante' : user.profesor ? 'Profesor' : 'Administrador'
        })),
        pagos_recientes: actividadReciente[1].map(pago => ({
          id: pago.id_pago,
          estudiante: pago.estudiante ? `${pago.estudiante.usuario.nombre} ${pago.estudiante.usuario.apellido}` : 'Sin asignar',
          curso: pago.imparte.curso.nombre,
          monto: Number(pago.monto),
          fecha: pago.fecha_pago
        })),
        examenes_recientes: actividadReciente[2].map(resultado => ({
          id: resultado.id_resultado,
          estudiante: resultado.estudiante ? `${resultado.estudiante.usuario.nombre} ${resultado.estudiante.usuario.apellido}` : 'Desconocido',
          examen: resultado.examen?.nombre || 'Examen eliminado',
          calificacion: Number(resultado.calificacion),
          fecha: resultado.fecha
        }))
      }
    }

    return NextResponse.json(estadisticas)

  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
