'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export interface DashboardMetrics {
  // Métricas de usuarios
  totalStudents: number
  totalTeachers: number
  totalAdmins: number
  activeUsers: number
  newUsersThisMonth: number
  newUsersLastMonth: number
  
  // Métricas de cursos
  totalCourses: number
  activeCourses: number
  coursesByModality: {
    online: number
    presencial: number
  }
  
  // Métricas financieras
  totalRevenue: number
  revenueThisMonth: number
  revenueLastMonth: number
  pendingPayments: number
  
  // Métricas de inscripciones
  totalEnrollments: number
  enrollmentsThisMonth: number
  enrollmentsLastMonth: number
  activeEnrollments: number
  completionRate: number
  
  // Solicitudes pendientes
  pendingTeacherRequests: number
  
  // Datos para gráficas
  monthlyRevenue: Array<{ month: string; revenue: number }>
  enrollmentTrends: Array<{ month: string; enrollments: number }>
  coursesByLevel: Array<{ level: string; count: number }>
  topCourses: Array<{ name: string; enrollments: number; revenue: number }>
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.rol !== 'ADMIN') {
      throw new Error('No autorizado')
    }

    // Fechas para comparaciones
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Obtener todas las métricas en paralelo
    const [
      totalStudents,
      totalTeachers,
      totalAdmins,
      activeStudents,
      activeTeachers,
      totalCourses,
      activeCourses,
      onlineCourses,
      presencialCourses,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      pendingPayments,
      totalEnrollments,
      enrollmentsThisMonth,
      enrollmentsLastMonth,
      activeEnrollments,
      completedEnrollments,
      pendingTeacherRequests,
      monthlyRevenueData,
      enrollmentData,
      coursesWithEnrollments,
      imparteByLevel,
      niveles
    ] = await Promise.all([
      // Usuarios
      prisma.estudiante.count(),
      prisma.profesor.count(),
      prisma.administrador.count(),
      prisma.estudiante.count({ where: { b_activo: true } }),
      prisma.profesor.count({ where: { b_activo: true } }),
      
      // Cursos
      prisma.curso.count(),
      prisma.curso.count({ where: { b_activo: true } }),
      prisma.curso.count({ where: { modalidad: 'ONLINE' } }),
      prisma.curso.count({ where: { modalidad: 'PRESENCIAL' } }),
      
      // Ingresos
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' }
      }).then(result => Number(result._sum.amount || 0)),
      
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PAID',
          payment_date: { gte: startOfThisMonth }
        }
      }).then(result => Number(result._sum.amount || 0)),
      
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PAID',
          payment_date: {
            gte: startOfLastMonth,
            lt: startOfThisMonth
          }
        }
      }).then(result => Number(result._sum.amount || 0)),
      
      prisma.payment.count({
        where: { status: 'PENDING' }
      }),
      
      // Inscripciones
      prisma.inscripcion.count(),
      prisma.inscripcion.count({
        where: { enrolled_at: { gte: startOfThisMonth } }
      }),
      prisma.inscripcion.count({
        where: {
          enrolled_at: {
            gte: startOfLastMonth,
            lt: startOfThisMonth
          }
        }
      }),
      prisma.inscripcion.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.inscripcion.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Solicitudes
      prisma.solicitud_profesor.count({
        where: { estado: 'PENDIENTE' }
      }),
      
      // Datos para gráficas - Ingresos mensuales
      prisma.payment.groupBy({
        by: ['payment_date'],
        where: {
          payment_date: { gte: startOfYear },
          status: 'PAID'
        },
        _sum: {
          amount: true
        }
      }),
      
      // Datos para gráficas - Inscripciones mensuales
      prisma.inscripcion.groupBy({
        by: ['enrolled_at'],
        where: {
          enrolled_at: { gte: startOfYear }
        },
        _count: true
      }),
      
      // Top cursos con inscripciones
      prisma.curso.findMany({
        where: { b_activo: true },
        select: {
          nombre: true,
          inscripciones: {
            select: {
              payments: {
                where: { status: 'PAID' },
                select: { amount: true }
              }
            }
          }
        },
        take: 10
      }),
      
      // Cursos por nivel
      prisma.imparte.groupBy({
        by: ['id_nivel'],
        _count: true,
        where: {
          curso: { b_activo: true }
        }
      }),
      
      prisma.nivel.findMany()
    ])

    // Procesar datos de ingresos mensuales
    const monthlyRevenueMap = new Map<number, number>()
    monthlyRevenueData.forEach(item => {
      const month = new Date(item.payment_date).getMonth()
      const current = monthlyRevenueMap.get(month) || 0
      monthlyRevenueMap.set(month, current + Number(item._sum.amount || 0))
    })

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
      month: monthNames[i],
      revenue: monthlyRevenueMap.get(i) || 0
    }))

    // Procesar datos de inscripciones mensuales
    const enrollmentMap = new Map<number, number>()
    enrollmentData.forEach(item => {
      const month = new Date(item.enrolled_at).getMonth()
      const current = enrollmentMap.get(month) || 0
      enrollmentMap.set(month, current + item._count)
    })

    const enrollmentTrends = Array.from({ length: 12 }, (_, i) => ({
      month: monthNames[i],
      enrollments: enrollmentMap.get(i) || 0
    }))

    // Top cursos
    const topCourses = coursesWithEnrollments
      .map(course => ({
        name: course.nombre,
        enrollments: course.inscripciones.length,
        revenue: course.inscripciones.reduce((acc, insc) => {
          return acc + insc.payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
        }, 0)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Cursos por nivel
    const coursesByLevel = imparteByLevel.map(item => {
      const nivel = niveles.find(n => n.id_nivel === item.id_nivel)
      return {
        level: nivel?.nombre || 'Sin nivel',
        count: item._count
      }
    })

    // Calcular tasa de completitud
    const completionRate = totalEnrollments > 0
      ? (completedEnrollments / totalEnrollments) * 100
      : 0

    return {
      // Usuarios
      totalStudents,
      totalTeachers,
      totalAdmins,
      activeUsers: activeStudents + activeTeachers,
      newUsersThisMonth: 0, // Simplificado
      newUsersLastMonth: 0, // Simplificado
      
      // Cursos
      totalCourses,
      activeCourses,
      coursesByModality: {
        online: onlineCourses,
        presencial: presencialCourses
      },
      
      // Financiero
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      pendingPayments,
      
      // Inscripciones
      totalEnrollments,
      enrollmentsThisMonth,
      enrollmentsLastMonth,
      activeEnrollments,
      completionRate: Math.round(completionRate * 100) / 100,
      
      // Solicitudes
      pendingTeacherRequests,
      
      // Gráficas
      monthlyRevenue,
      enrollmentTrends,
      coursesByLevel,
      topCourses
    }
  } catch (error) {
    console.error('Error obteniendo métricas del dashboard:', error)
    throw error
  }
}
