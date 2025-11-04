'use client'

import MetricCard from '@/components/admin/MetricCard'
import RevenueChart from '@/components/admin/RevenueChart'
import EnrollmentChart from '@/components/admin/EnrollmentChart'
import TopCourses from '@/components/admin/TopCourses'
import CourseDistribution from '@/components/admin/CourseDistribution'
import { AlertCircle, DollarSign } from 'lucide-react'
import { DashboardMetrics as MetricsType } from '@/actions/admin/dashboardMetrics'

interface DashboardMetricsProps {
  metrics: MetricsType
}

export default function DashboardMetricsComponent({ metrics }: DashboardMetricsProps) {
  const usersTrend = metrics.newUsersLastMonth > 0
    ? ((metrics.newUsersThisMonth - metrics.newUsersLastMonth) / metrics.newUsersLastMonth) * 100
    : 0

  const revenueTrend = metrics.revenueLastMonth > 0
    ? ((metrics.revenueThisMonth - metrics.revenueLastMonth) / metrics.revenueLastMonth) * 100
    : 0

  const enrollmentsTrend = metrics.enrollmentsLastMonth > 0
    ? ((metrics.enrollmentsThisMonth - metrics.enrollmentsLastMonth) / metrics.enrollmentsLastMonth) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Usuarios"
          value={metrics.totalStudents + metrics.totalTeachers + metrics.totalAdmins}
          icon="Users"
          color="blue"
          trend={{
            value: Math.round(usersTrend),
            isPositive: usersTrend >= 0
          }}
          delay={0}
        />

        <MetricCard
          title="Estudiantes Activos"
          value={metrics.totalStudents}
          icon="GraduationCap"
          color="green"
          delay={0.1}
        />

        <MetricCard
          title="Cursos Activos"
          value={metrics.activeCourses}
          icon="BookOpen"
          color="purple"
          delay={0.2}
        />

        <MetricCard
          title="Ingresos Total"
          value={'$' + metrics.totalRevenue.toLocaleString()}
          icon="DollarSign"
          color="orange"
          trend={{
            value: Math.round(revenueTrend),
            isPositive: revenueTrend >= 0
          }}
          delay={0.3}
        />
      </div>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Profesores"
          value={metrics.totalTeachers}
          icon="UserCheck"
          color="blue"
          delay={0.4}
        />

        <MetricCard
          title="Inscripciones Activas"
          value={metrics.activeEnrollments}
          icon="TrendingUp"
          color="green"
          trend={{
            value: Math.round(enrollmentsTrend),
            isPositive: enrollmentsTrend >= 0
          }}
          delay={0.5}
        />

        <MetricCard
          title="Solicitudes Pendientes"
          value={metrics.pendingTeacherRequests}
          icon="AlertCircle"
          color="red"
          delay={0.6}
        />

        <MetricCard
          title="Tasa de Completitud"
          value={metrics.completionRate + '%'}
          icon="Award"
          color="purple"
          delay={0.7}
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={metrics.monthlyRevenue} />
        <EnrollmentChart data={metrics.enrollmentTrends} />
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCourses courses={metrics.topCourses} />
        <CourseDistribution data={metrics.coursesByLevel} />
      </div>

      {/* Tarjetas de información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Modalidades */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Cursos por Modalidad</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Online</span>
              <span className="text-lg font-bold text-blue-600">
                {metrics.coursesByModality.online}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Presencial</span>
              <span className="text-lg font-bold text-green-600">
                {metrics.coursesByModality.presencial}
              </span>
            </div>
          </div>
        </div>

        {/* Ingresos del mes */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ingresos Este Mes</h3>
          <div className="flex items-center justify-center h-24">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                ${metrics.revenueThisMonth.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">MXN</p>
            </div>
          </div>
        </div>

        {/* Pagos pendientes */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Pagos Pendientes</h3>
          <div className="flex items-center justify-center h-24">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {metrics.pendingPayments}
              </p>
              <p className="text-sm text-gray-500 mt-1">Pendientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas si hay solicitudes o pagos pendientes */}
      {(metrics.pendingTeacherRequests > 0 || metrics.pendingPayments > 0) && (
        <div className="space-y-4">
          {metrics.pendingTeacherRequests > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">
                  Solicitudes de Profesores Pendientes
                </h4>
                <p className="text-sm text-yellow-700">
                  Hay {metrics.pendingTeacherRequests} solicitudes esperando revisión.
                </p>
              </div>
            </div>
          )}

          {metrics.pendingPayments > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 mb-1">
                  Pagos Pendientes
                </h4>
                <p className="text-sm text-orange-700">
                  Hay {metrics.pendingPayments} pagos pendientes de procesamiento.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
