'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

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
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'users', name: 'Usuarios', icon: '👥' },
    { id: 'courses', name: 'Cursos', icon: '📚' },
    { id: 'exams', name: 'Exámenes', icon: '📝' },
    { id: 'payments', name: 'Pagos', icon: '💰' },
    { id: 'system', name: 'Sistema', icon: '⚙️' }
  ]

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Usuarios</p>
              <p className="text-3xl font-bold">{stats?.resumen.total_usuarios || 0}</p>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Estudiantes Activos</p>
              <p className="text-3xl font-bold">{stats?.resumen.estudiantes_activos || 0}</p>
            </div>
            <div className="text-4xl opacity-80">🎓</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Cursos Activos</p>
              <p className="text-3xl font-bold">{stats?.resumen.cursos_activos || 0}</p>
            </div>
            <div className="text-4xl opacity-80">📚</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Ingresos Total</p>
              <p className="text-3xl font-bold">${stats?.resumen.ingresos_total?.toLocaleString() || 0}</p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
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
                  <p className="text-sm font-medium">{usuario.nombre}</p>
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

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard()
      case 'users':
        return <AdminUsersSection />
      case 'courses':
        return <AdminCoursesSection />
      case 'exams':
        return <AdminExamsSection />
      case 'payments':
        return <AdminPaymentsSection />
      case 'system':
        return <AdminSystemSection />
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#00246a]">Panel de Administración</h1>
              <p className="text-gray-600">Bienvenido, {session.user.name} {session.user.apellido}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Rol: {session.user.rol}</span>
              
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm h-screen sticky top-0">
          <nav className="p-4">
            <div className="space-y-2">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-[#00246a] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

// Componentes de sección (placeholders - se implementarán posteriormente)
function AdminUsersSection() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-[#00246a] mb-4">Gestión de Usuarios</h2>
      <p className="text-gray-600">
        Aquí puedes crear, leer, actualizar y eliminar usuarios (estudiantes, profesores, administradores).
      </p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-green-600">✅ Crear Usuarios</h3>
          <p className="text-sm text-gray-600">Alumnos, profesores, otros administradores</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-blue-600">👁️ Leer Contenido</h3>
          <p className="text-sm text-gray-600">Ver todos los datos del sistema</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-orange-600">✏️ Actualizar Datos</h3>
          <p className="text-sm text-gray-600">Modificar perfiles, configuraciones</p>
        </div>
      </div>
    </div>
  )
}

function AdminCoursesSection() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-[#00246a] mb-4">Gestión de Cursos</h2>
      <p className="text-gray-600">
        Administra cursos y contenidos educativos.
      </p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-green-600">✅ Crear Cursos</h3>
          <p className="text-sm text-gray-600">Nuevos cursos y contenidos</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-red-600">🗑️ Eliminar Cursos</h3>
          <p className="text-sm text-gray-600">Remover cursos obsoletos</p>
        </div>
      </div>
    </div>
  )
}

function AdminExamsSection() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-[#00246a] mb-4">Gestión de Exámenes</h2>
      <p className="text-gray-600">
        Crear y administrar exámenes y evaluaciones.
      </p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-green-600">✅ Crear Exámenes</h3>
          <p className="text-sm text-gray-600">Nuevos exámenes y evaluaciones</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-red-600">🗑️ Eliminar Evaluaciones</h3>
          <p className="text-sm text-gray-600">Remover exámenes obsoletos</p>
        </div>
      </div>
    </div>
  )
}

function AdminPaymentsSection() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-[#00246a] mb-4">Gestión de Pagos</h2>
      <p className="text-gray-600">
        Administra registros de pagos y transacciones.
      </p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-green-600">✅ Registrar Pagos</h3>
          <p className="text-sm text-gray-600">Nuevos registros de pago</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-red-600">🗑️ Eliminar Registros</h3>
          <p className="text-sm text-gray-600">Remover registros erróneos</p>
        </div>
      </div>
    </div>
  )
}

function AdminSystemSection() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-[#00246a] mb-4">Configuración del Sistema</h2>
      <p className="text-gray-600">
        Administra configuraciones del sistema y del bot.
      </p>
      <div className="mt-4 space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-purple-600">⚙️ Configuraciones Generales</h3>
          <p className="text-sm text-gray-600">Sin restricciones de acceso ni modificación</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-blue-600">🤖 Configuración del Bot</h3>
          <p className="text-sm text-gray-600">Personalizar asistente virtual</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-orange-600">📊 Registros de Asistencia</h3>
          <p className="text-sm text-gray-600">Administrar asistencias de estudiantes</p>
        </div>
      </div>
    </div>
  )
}
