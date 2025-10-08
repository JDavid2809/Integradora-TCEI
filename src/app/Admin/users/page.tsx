'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: number
  email: string
  nombre: string
  apellido: string
  rol: 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE'
  detalles: any
  activo: boolean
}

interface UserFormData {
  email: string
  password: string
  nombre: string
  apellido: string
  rol: 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE'
  detalles: {
    [key: string]: any
  }
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'ESTUDIANTE',
    detalles: {}
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (filterRole) params.append('role', filterRole)

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, filterRole])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Usuario creado exitosamente')
        setShowCreateForm(false)
        setFormData({
          email: '',
          password: '',
          nombre: '',
          apellido: '',
          rol: 'ESTUDIANTE',
          detalles: {}
        })
        fetchUsers()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al crear usuario:', error)
      alert('Error al crear usuario')
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingUser) return

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Usuario actualizado exitosamente')
        setEditingUser(null)
        fetchUsers()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      alert('Error al actualizar usuario')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Usuario eliminado exitosamente')
        fetchUsers()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      alert('Error al eliminar usuario')
    }
  }

  const startEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '',
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      detalles: user.detalles || {}
    })
    setShowCreateForm(true)
  }

  const renderRoleSpecificFields = () => {
    const { rol } = formData

    switch (rol) {
      case 'ESTUDIANTE':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.detalles.telefono || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  detalles: { ...formData.detalles, telefono: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.detalles.edad || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  detalles: { ...formData.detalles, edad: parseInt(e.target.value) || 0 }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido Paterno
              </label>
              <input
                type="text"
                value={formData.detalles.paterno || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  detalles: { ...formData.detalles, paterno: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido Materno
              </label>
              <input
                type="text"
                value={formData.detalles.materno || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  detalles: { ...formData.detalles, materno: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
              />
            </div>
          </div>
        )

      case 'PROFESOR':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.detalles.telefono || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  detalles: { ...formData.detalles, telefono: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad
              </label>
              <input
                type="number"
                min="18"
                max="80"
                value={formData.detalles.edad || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  detalles: { ...formData.detalles, edad: parseInt(e.target.value) || 0 }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CURP
              </label>
              <input
                type="text"
                value={formData.detalles.curp || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  detalles: { ...formData.detalles, curp: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RFC
              </label>
              <input
                type="text"
                value={formData.detalles.rfc || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  detalles: { ...formData.detalles, rfc: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={formData.detalles.direccion || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  detalles: { ...formData.detalles, direccion: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de Estudios
              </label>
              <input
                type="text"
                value={formData.detalles.nivel_estudios || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  detalles: { ...formData.detalles, nivel_estudios: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <input
                type="text"
                value={formData.detalles.observaciones || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  detalles: { ...formData.detalles, observaciones: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
              />
            </div>
          </div>
        )

      case 'ADMIN':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Único
              </label>
              <input
                type="email"
                value={formData.detalles.email_unico || formData.email}
                onChange={(e) => setFormData({
                  ...formData,
                  detalles: { ...formData.detalles, email_unico: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen
              </label>
              <input
                type="text"
                placeholder="/path/to/image.jpg"
                value={formData.detalles.image || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  detalles: { ...formData.detalles, image: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!session || session.user?.rol !== 'ADMIN') {
    return <div>No autorizado</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#00246a]">Gestión de Usuarios</h1>
        <button
          onClick={() => {
            setShowCreateForm(true)
            setEditingUser(null)
            setFormData({
              email: '',
              password: '',
              nombre: '',
              apellido: '',
              rol: 'ESTUDIANTE',
              detalles: {}
            })
          }}
          className="bg-[#00246a] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Crear Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Rol
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            >
              <option value="">Todos los roles</option>
              <option value="ADMIN">Administradores</option>
              <option value="PROFESOR">Profesores</option>
              <option value="ESTUDIANTE">Estudiantes</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchUsers}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00246a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.nombre} {user.apellido}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.rol === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.rol === 'PROFESOR' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => startEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de crear/editar usuario */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00246a]">
                {editingUser ? 'Editar Usuario' : 'Crear Usuario'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingUser(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
              {/* Campos básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña {editingUser ? '(dejar vacío para mantener)' : '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol *
                  </label>
                  <select
                    required
                    value={formData.rol}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      rol: e.target.value as 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE',
                      detalles: {} // Reset detalles when changing role
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  >
                    <option value="ESTUDIANTE">Estudiante</option>
                    <option value="PROFESOR">Profesor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>

              {/* Campos específicos del rol */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Información específica del {formData.rol.toLowerCase()}
                </h3>
                {renderRoleSpecificFields()}
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingUser(null)
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700"
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
