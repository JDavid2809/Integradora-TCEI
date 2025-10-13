"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useDebounce } from '../../../hooks/useDebounce'
import api from '../../../lib/api'
import FeedbackAlert from '../../FeedbackAlert'
import Pagination from '../../Pagination'
import { 
  Users, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  MailCheck,
  MailX
} from 'lucide-react'

interface User {
  id: number
  email: string
  nombre: string
  apellido: string
  rol: 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE'
  verificado: boolean
  estudiante?: {
    id_estudiante: number
    telefono: string
    edad: number
    categoria_edad?: {
      rango: string
    }
    b_activo: boolean
  }
  profesor?: {
    id_profesor: number
    telefono: string
    edad: number
    nivel_estudios: string
    b_activo: boolean
  }
  administrador?: {
    id_administrador: number
    b_activo: boolean
  }
}

interface UserFormData {
  email: string
  password: string
  nombre: string
  apellido: string
  rol: 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE'
  telefono?: string
  edad?: number
  id_categoria_edad?: number
  nivel_estudios?: string
  observaciones?: string
}

// Nota: las categorías ya no se cargan ni seleccionan; se calculan automáticamente

// Helper para renderizar números de forma segura
const renderSafeNumber = (value: number | undefined, suffix: string = '') => {
  if (typeof value === 'number' && !isNaN(value)) {
    return `${value}${suffix}`
  }
  return 'N/A'
}

// Cálculo automático de categoría por edad
const calcularCategoriaEdad = (edad: number): number => {
  if (edad >= 18 && edad <= 25) return 1 // 18-25 años
  if (edad >= 26 && edad <= 35) return 2 // 26-35 años
  if (edad >= 36 && edad <= 45) return 3 // 36-45 años
  if (edad >= 46) return 4 // 46+ años
  return 1
}

const obtenerNombreCategoria = (edad?: number): string | null => {
  if (!edad || isNaN(edad)) return null
  const id = calcularCategoriaEdad(edad)
  switch (id) {
    case 1: return '18-25 años'
    case 2: return '26-35 años'
    case 3: return '36-45 años'
    case 4: return '46+ años'
    default: return null
  }
}

export default function AdminUserCrud() {
  const [users, setUsers] = useState<User[]>([])
  // Categorías: ya no se cargan manualmente; se calculan automáticamente a partir de la edad
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPageState] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{sent: boolean, error: string | null} | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Función segura para cambiar página
  const setCurrentPage = (page: number) => {
    const safePage = typeof page === 'number' && !isNaN(page) && page > 0 ? page : 1
    setCurrentPageState(safePage)
  }

  const debouncedSearch = useDebounce(searchTerm, 400)

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'ESTUDIANTE',
    telefono: '',
    edad: undefined,
    id_categoria_edad: undefined,
    nivel_estudios: '',
    observaciones: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [warningMessage, setWarningMessage] = useState('')
  const [resendingEmail, setResendingEmail] = useState<number | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      // Cancelar request previo
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(roleFilter !== 'ALL' && { role: roleFilter }),
        ...(verificationFilter !== 'ALL' && { 
          verification: verificationFilter === 'VERIFIED' ? 'true' : 'false' 
        }),
        ...(debouncedSearch && { search: debouncedSearch })
      })

      const data = await api<{ users: User[]; total: number }>(`/api/admin/users?${params}`, { signal: controller.signal })
      setUsers(data.users || [])
      const total = typeof data.total === 'number' && !isNaN(data.total) ? data.total : 0
      setTotalPages(Math.max(1, Math.ceil(total / 10)))
    } catch (error: any) {
      if (error?.name === 'AbortError') return
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, roleFilter, verificationFilter, debouncedSearch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Eliminado: fetchCategories (categorías calculadas automáticamente)

  const handleCreateUser = () => {
    setEditingUser(null)
    setFormData({
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      rol: 'ESTUDIANTE',
      telefono: '',
      edad: undefined,
  id_categoria_edad: undefined,
      nivel_estudios: '',
      observaciones: ''
    })
    setErrors({})
    setShowModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '',
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      telefono: user.estudiante?.telefono || user.profesor?.telefono || '',
      edad: user.estudiante?.edad || user.profesor?.edad || undefined,
      // La categoría se recalculará automáticamente a partir de la edad
      id_categoria_edad: user.rol === 'ESTUDIANTE' && typeof user.estudiante?.edad === 'number'
        ? calcularCategoriaEdad(user.estudiante.edad)
        : undefined,
      nivel_estudios: user.profesor?.nivel_estudios || '',
      observaciones: ''
    })
    setErrors({})
    setShowModal(true)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) newErrors.email = 'Email es requerido'
    if (!formData.nombre) newErrors.nombre = 'Nombre es requerido'
    if (!formData.apellido) newErrors.apellido = 'Apellido es requerido'
    if (!editingUser && !formData.password) newErrors.password = 'Contraseña es requerida'
    
    if (formData.rol === 'ESTUDIANTE') {
      if (!formData.edad) newErrors.edad = 'Edad es requerida para estudiantes'
      // id_categoria_edad se calculará automáticamente en base a la edad
    }
    
    if (formData.rol === 'PROFESOR') {
      if (!formData.nivel_estudios) newErrors.nivel_estudios = 'Nivel de estudios es requerido para profesores'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    setEmailStatus(null)
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users'
      const method = editingUser ? 'PUT' : 'POST'

      // Construir payload y calcular categoría automáticamente si aplica
      const payload = {
        ...formData,
        ...(formData.rol === 'ESTUDIANTE' && typeof formData.edad === 'number'
          ? { id_categoria_edad: calcularCategoriaEdad(formData.edad) }
          : { id_categoria_edad: undefined, edad: undefined })
      }

      const response = await api(url, {
        method,
        body: JSON.stringify(payload)
      })

      // Manejar la respuesta para mostrar información del correo
      if (editingUser) {
        setSuccessMessage('Usuario actualizado exitosamente')
        setWarningMessage('')
      } else {
        // Creación de nuevo usuario
        if (response.emailStatus) {
          setEmailStatus(response.emailStatus)
          if (response.emailStatus.sent) {
            setSuccessMessage('Usuario creado exitosamente. El correo de verificación ha sido enviado.')
            setWarningMessage('')
          } else {
            setSuccessMessage('Usuario creado exitosamente')
            setWarningMessage(`El correo de verificación no pudo ser enviado. Error: ${response.emailStatus.error}`)
          }
        } else {
          setSuccessMessage('Usuario creado exitosamente')
          setWarningMessage('')
        }
      }
      setShowModal(false)
      fetchUsers()
      setTimeout(() => {
        setSuccessMessage('')
        setWarningMessage('')
        setEmailStatus(null)
      }, 5000) // Extendido a 5 segundos para leer el mensaje completo
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al guardar usuario'
      setErrors({ general: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return

    try {
      await api(`/api/admin/users/${userId}`, { method: 'DELETE' })
      setSuccessMessage('Usuario eliminado exitosamente')
      fetchUsers()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar usuario'
      alert(message)
    }
  }

  const handleResendVerification = async (userId: number, userEmail: string) => {
    setResendingEmail(userId)
    try {
      const response = await api('/api/admin/users/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ userId, email: userEmail })
      })

      if (response.success) {
        setSuccessMessage('Correo de verificación reenviado exitosamente')
      } else {
        setWarningMessage(`Error al reenviar correo: ${response.error || 'Error desconocido'}`)
      }
      
      setTimeout(() => {
        setSuccessMessage('')
        setWarningMessage('')
      }, 5000)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al reenviar correo de verificación'
      setWarningMessage(message)
      setTimeout(() => setWarningMessage(''), 5000)
    } finally {
      setResendingEmail(null)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'PROFESOR': return 'bg-blue-100 text-blue-800'
      case 'ESTUDIANTE': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 md:w-8 md:h-8 text-[#00246a]" />
          <h1 className="text-xl md:text-2xl font-bold text-[#00246a]">Gestión de Usuarios</h1>
        </div>
        <button
          onClick={handleCreateUser}
          className="flex items-center gap-2 bg-[#00246a] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base w-full sm:w-auto justify-center"
        >
          <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden xs:inline">Nuevo Usuario</span>
          <span className="xs:hidden">Nuevo</span>
        </button>
      </div>

      {/* Success/Warning Messages */}
      {successMessage && (
        <FeedbackAlert type="success">{successMessage}</FeedbackAlert>
      )}
      {warningMessage && (
        <FeedbackAlert type="warning">{warningMessage}</FeedbackAlert>
      )}

      {/* Filters - Responsive */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow-md">
        <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
          {/* Search - Full width on mobile */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            />
          </div>
          
          {/* Filters - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent min-w-0 flex-1"
              >
                <option value="ALL">Todos los roles</option>
                <option value="ESTUDIANTE">Estudiantes</option>
                <option value="PROFESOR">Profesores</option>
                <option value="ADMIN">Administradores</option>
              </select>
            </div>
            
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent min-w-0 flex-1"
            >
              <option value="ALL">Todos los estados</option>
              <option value="VERIFIED">Verificados</option>
              <option value="NOT_VERIFIED">No verificados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table/Cards - Responsive */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00246a] mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm md:text-base">Cargando usuarios...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table - Hidden on mobile */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
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
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.nombre} {user.apellido}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.rol)}`}>
                          {user.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          {(user.estudiante?.telefono || user.profesor?.telefono) && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {user.estudiante?.telefono || user.profesor?.telefono}
                            </div>
                          )}
                          {(() => {
                            const edad = user.estudiante?.edad || user.profesor?.edad
                            return (typeof edad === 'number' && !isNaN(edad) && edad > 0) && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {renderSafeNumber(edad, ' años')}
                              </div>
                            )
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {/* Estado de actividad */}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            (user.estudiante?.b_activo ?? user.profesor?.b_activo ?? user.administrador?.b_activo ?? true)
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {(user.estudiante?.b_activo ?? user.profesor?.b_activo ?? user.administrador?.b_activo ?? true)
                              ? 'Activo' 
                              : 'Inactivo'}
                          </span>
                          
                          {/* Estado de verificación */}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.verificado
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.verificado ? 'Verificado' : 'No verificado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          {/* Botón de reenviar verificación solo para usuarios no verificados */}
                          {!user.verificado && (
                            <button
                              onClick={() => handleResendVerification(user.id, user.email)}
                              disabled={resendingEmail === user.id}
                              className="text-orange-600 hover:text-orange-900 p-1 rounded disabled:opacity-50"
                              title="Reenviar correo de verificación"
                            >
                              {resendingEmail === user.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                              ) : (
                                <RotateCcw className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Visible on mobile/tablet */}
            <div className="lg:hidden space-y-4 p-4">
              {users.map((user) => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  {/* User Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">
                        {user.nombre} {user.apellido}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.rol)}`}>
                      {user.rol}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1">
                    {(user.estudiante?.telefono || user.profesor?.telefono) && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Phone className="w-3 h-3" />
                        {user.estudiante?.telefono || user.profesor?.telefono}
                      </div>
                    )}
                    {(() => {
                      const edad = user.estudiante?.edad || user.profesor?.edad
                      return (typeof edad === 'number' && !isNaN(edad) && edad > 0) && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {renderSafeNumber(edad, ' años')}
                        </div>
                      )
                    })()}
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (user.estudiante?.b_activo ?? user.profesor?.b_activo ?? user.administrador?.b_activo ?? true)
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(user.estudiante?.b_activo ?? user.profesor?.b_activo ?? user.administrador?.b_activo ?? true)
                        ? 'Activo' 
                        : 'Inactivo'}
                    </span>
                    
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.verificado
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.verificado ? 'Verificado' : 'No verificado'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-xs"
                      >
                        <Edit className="w-3 h-3" />
                        Editar
                      </button>
                      
                      {!user.verificado && (
                        <button
                          onClick={() => handleResendVerification(user.id, user.email)}
                          disabled={resendingEmail === user.id}
                          className="flex items-center gap-1 text-orange-600 hover:text-orange-900 px-2 py-1 rounded text-xs disabled:opacity-50"
                        >
                          {resendingEmail === user.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-600"></div>
                          ) : (
                            <>
                              <RotateCcw className="w-3 h-3" />
                              Reenviar
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-900 px-2 py-1 rounded text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="px-4 py-3 border-t border-gray-200">
            <Pagination 
              page={isNaN(currentPage) ? 1 : currentPage} 
              totalPages={isNaN(totalPages) ? 1 : totalPages} 
              onChange={setCurrentPage} 
            />
          </div>
        )}
      </div>

      {/* Modal - Responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 md:p-6 border-b">
              <h2 className="text-lg md:text-xl font-bold text-[#00246a]">
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-6">
              {errors.general && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                {/* Basic Information - Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3 py-2 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="correo@ejemplo.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full px-3 py-2 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className={`w-full px-3 py-2 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                        errors.nombre ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nombre"
                    />
                    {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      className={`w-full px-3 py-2 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                        errors.apellido ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Apellido"
                    />
                    {errors.apellido && <p className="mt-1 text-xs text-red-600">{errors.apellido}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol *
                    </label>
                    <select
                      value={formData.rol}
                      onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'ESTUDIANTE' | 'PROFESOR' | 'ADMIN' })}
                      className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                    >
                      <option value="ESTUDIANTE">Estudiante</option>
                      <option value="PROFESOR">Profesor</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                      placeholder="555-1234"
                    />
                  </div>
                </div>

                {/* Role-specific fields */}
                {formData.rol === 'ESTUDIANTE' && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Información del Estudiante</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Edad *
                        </label>
                        <input
                          type="number"
                          value={formData.edad || ''}
                          onChange={(e) => {
                            const value = e.target.value
                            if (!value) {
                              setFormData({ ...formData, edad: undefined })
                            } else {
                              const parsedValue = parseInt(value)
                              setFormData({ ...formData, edad: isNaN(parsedValue) ? undefined : parsedValue })
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                            errors.edad ? 'border-red-500' : 'border-gray-300'
                          }`}
                          min="1"
                          max="100"
                          placeholder="Edad"
                        />
                        {errors.edad && <p className="mt-1 text-sm text-red-600">{errors.edad}</p>}
                        {typeof formData.edad === 'number' && !isNaN(formData.edad) && (
                          <p className="mt-1 text-xs text-gray-500">
                            Categoría asignada automáticamente: <span className="font-medium">{obtenerNombreCategoria(formData.edad)}</span>
                          </p>
                        )}
                      </div>
                      {/* La categoría se asigna automáticamente con base en la edad; no hay selección manual */}
                    </div>
                  </div>
                )}

                {formData.rol === 'PROFESOR' && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Información del Profesor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Edad
                        </label>
                        <input
                          type="number"
                          value={formData.edad || ''}
                          onChange={(e) => {
                            const value = e.target.value
                            if (!value) {
                              setFormData({ ...formData, edad: undefined })
                            } else {
                              const parsedValue = parseInt(value)
                              setFormData({ ...formData, edad: isNaN(parsedValue) ? undefined : parsedValue })
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                          min="18"
                          max="80"
                          placeholder="Edad"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nivel de Estudios *
                        </label>
                        <input
                          type="text"
                          value={formData.nivel_estudios}
                          onChange={(e) => setFormData({ ...formData, nivel_estudios: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                            errors.nivel_estudios ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Ej: Licenciatura en Lenguas"
                        />
                        {errors.nivel_estudios && <p className="mt-1 text-sm text-red-600">{errors.nivel_estudios}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observaciones
                        </label>
                        <textarea
                          value={formData.observaciones}
                          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                          rows={3}
                          placeholder="Observaciones adicionales..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons - Responsive */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm md:text-base"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSubmitting ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear Usuario')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
