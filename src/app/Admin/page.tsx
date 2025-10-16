'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  Settings,
  GraduationCap,
  DollarSign,
  ArrowRight,
  Target,
  Activity
} from 'lucide-react'

// Import CRUD components
import AdminUserCrud from '@/components/ui/admin/AdminUserCrud'
import AdminPaymentCrud from '@/components/ui/admin/AdminPaymentCrud'
import TeacherRequestsSection from '@/components/ui/admin/TeacherRequestsSection'

interface SystemStats {
  resumen: {
    total_usuarios: number
    total_estudiantes: number
    total_profesores: number
    total_administradores: number
    estudiantes_activos: number
    profesores_activos: number
    total_cursos: number
    cursos_activos: number
    total_examenes: number
    examenes_activos: number
    total_pagos: number
    ingresos_periodo: number
    ingresos_total: number
    examenes_tomados_periodo: number
  }
  actividad_reciente: {
    nuevos_usuarios: Array<{
      id: number
      nombre: string
      email: string
      rol: string
      tipo_perfil: string
    }>
    pagos_recientes: Array<{
      id: number
      estudiante: string
      curso: string
      monto: number
      fecha: string
    }>
    examenes_recientes: Array<{
      id: number
      estudiante: string
      examen: string
      calificacion: number
      fecha: string
    }>
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      redirect("/Login")
    }

    // Verificación estricta de rol
    if (session.user?.rol !== 'ADMIN') {
      // Redirigir según el rol actual
      switch (session.user?.rol) {
        case 'PROFESOR':
          redirect("/Teachers")
          break
        case 'ESTUDIANTE':
          redirect("/Students")
          break
        default:
          redirect("/Login")
      }
    }
  }, [session, status])

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      const response = await fetch('/api/admin/system/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00246a]"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  console.log('✅ Admin access granted:', session.user.email, 'Role:', session.user.rol)

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, label: 'Inicio' },
    { id: 'users', name: 'Usuarios', icon: Users, label: 'Usuarios' },
    { id: 'solicitudes', name: 'Solicitudes', icon: GraduationCap, label: 'Solicitudes' },
    { id: 'payments', name: 'Pagos', icon: CreditCard, label: 'Pagos' },
    { id: 'system', name: 'Sistema', icon: Settings, label: 'Config' }
  ]

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Usuarios</p>
              <p className="text-3xl font-bold">{stats?.resumen.total_usuarios || 0}</p>
            </div>
            <Users className="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Estudiantes Activos</p>
              <p className="text-3xl font-bold">{stats?.resumen.estudiantes_activos || 0}</p>
            </div>
            <GraduationCap className="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Ingresos Total</p>
              <p className="text-3xl font-bold">${stats?.resumen.ingresos_total?.toLocaleString() || 0}</p>
            </div>
            <DollarSign className="w-10 h-10 opacity-80" />
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nuevos usuarios */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-[#00246a] mb-4">Usuarios Recientes</h3>
          <div className="space-y-3">
            {stats?.actividad_reciente.nuevos_usuarios.map(usuario => (
              <div key={usuario.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs">{usuario.rol.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{usuario.nombre}</p>
                  <p className="text-xs text-gray-500">{usuario.tipo_perfil}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagos recientes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-[#00246a] mb-4">Pagos Recientes</h3>
          <div className="space-y-3">
            {stats?.actividad_reciente.pagos_recientes.map(pago => (
              <div key={pago.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">{pago.estudiante}</p>
                  <p className="text-xs text-gray-500">{pago.curso}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">${pago.monto}</p>
                  <p className="text-xs text-gray-500">{new Date(pago.fecha).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exámenes recientes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-[#00246a] mb-4">Exámenes Recientes</h3>
          <div className="space-y-3">
            {stats?.actividad_reciente.examenes_recientes.map(examen => (
              <div key={examen.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">{examen.estudiante}</p>
                  <p className="text-xs text-gray-500">{examen.examen}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${examen.calificacion >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                    {examen.calificacion}%
                  </p>
                  <p className="text-xs text-gray-500">{new Date(examen.fecha).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderSolicitudesSection = () => (
    <TeacherRequestsSection />
  )

  const navigateToPage = (page: string) => {
    window.location.href = `/Admin/${page}`
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard()
      case 'users':
        return <AdminUserCrud />
      case 'solicitudes':
        return renderSolicitudesSection()
      case 'payments':
        return <AdminPaymentCrud />
      case 'system':
        return <AdminSystemSection navigateToPage={navigateToPage} />
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#00246a]">Panel Admin</h1>
              <p className="text-sm md:text-base text-gray-600 hidden md:block">
                Bienvenido, {session.user.name} {session.user.apellido}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs md:text-sm text-gray-500">Rol: {session.user.rol}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Solo visible en desktop */}
        <div className="hidden md:block w-64 bg-white shadow-sm h-screen sticky top-0">
          <nav className="p-4">
            <div className="space-y-2">
              {navigationItems.map(item => {
                const IconComponent = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-[#00246a] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 md:p-6">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation - Solo visible en móvil */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex items-center justify-around">
          {navigationItems.map(item => {
            const IconComponent = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors ${
                  isActive ? 'text-[#00246a]' : 'text-gray-500'
                }`}
              >
                <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                  )}
                  <IconComponent className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                </div>
                <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-normal'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AdminSystemSection({ navigateToPage }: { navigateToPage: (page: string) => void }) {
  return (
    <div className="bg-white p-3 md:p-6 rounded-lg shadow-md">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-[#00246a]">Configuración del Sistema</h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1 hidden sm:block">
            Administra configuraciones del sistema.
          </p>
        </div>
        <button
          onClick={() => navigateToPage('system')}
          className="w-full sm:w-auto bg-[#00246a] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <span className="hidden xs:inline">Ir a Configuraciones</span>
          <span className="xs:hidden">Configuraciones</span>
          <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
        </button>
      </div>

      {/* Mobile description - Only visible on small screens */}
      <p className="text-sm text-gray-600 mb-4 sm:hidden">
        Administra configuraciones del sistema.
      </p>

      {/* Configuration Cards - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="p-3 md:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 md:w-5 md:h-5 text-purple-600 flex-shrink-0" />
            <h3 className="font-semibold text-purple-600 text-sm md:text-base">Niveles de Inglés</h3>
          </div>
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            Configurar niveles del sistema (A1, A2, B1, etc.)
          </p>
        </div>

        <div className="p-3 md:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
            <h3 className="font-semibold text-blue-600 text-sm md:text-base">Categorías de Edad</h3>
          </div>
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            Gestionar rangos de edad para estudiantes
          </p>
        </div>

        <div className="p-3 md:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-orange-600 flex-shrink-0" />
            <h3 className="font-semibold text-orange-600 text-sm md:text-base">Estado del Sistema</h3>
          </div>
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            Ver estadísticas de uso de configuraciones
          </p>
        </div>
      </div>

      {/* Optional: Quick Actions for Mobile */}
      <div className="mt-4 md:hidden">
        <div className="flex flex-col space-y-2">
          <button className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Gestionar Niveles</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Gestionar Edades</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 hover:bg-orange-100 transition-colors">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Ver Estado</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
