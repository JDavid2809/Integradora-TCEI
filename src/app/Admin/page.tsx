import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/authOptions'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
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

  console.log('✅ Admin access granted:', session.user.email, 'Role:', session.user.rol)
 
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-[#00246a] mb-4">
            Panel de Administración
          </h1>
          <div className="border-b border-gray-200 pb-4 mb-6">
            <p className="text-gray-600">
              Bienvenido, {session.user.name} {session.user.apellido}
            </p>
            <p className="text-sm text-gray-500">Rol: {session.user.rol}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#00246a] mb-2">Usuarios</h3>
              <p className="text-gray-600">Gestionar profesores y estudiantes</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#00246a] mb-2">Cursos</h3>
              <p className="text-gray-600">Administrar contenido de cursos</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#00246a] mb-2">Reportes</h3>
              <p className="text-gray-600">Ver estadísticas y reportes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
