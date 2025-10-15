'use client'

import { useState, useEffect } from 'react'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  GraduationCap,
  FileText,
  Filter,
  RefreshCw,
  MessageSquare
} from 'lucide-react'

interface TeacherRequest {
  id_solicitud: number
  nombre: string
  apellido: string
  email: string
  telefono?: string
  edad?: number
  curp?: string
  rfc?: string
  direccion?: string
  nivel_estudios?: string
  observaciones?: string
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
  fecha_solicitud: string
  fecha_revision?: string
  comentario_revision?: string
  revisor?: {
    usuario: {
      nombre: string
      apellido: string
    }
  }
}

interface TeacherRequestsSectionProps {
  className?: string
}

export default function TeacherRequestsSection({ className = '' }: TeacherRequestsSectionProps) {
  const [requests, setRequests] = useState<TeacherRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'TODOS' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'>('TODOS')
  const [selectedRequest, setSelectedRequest] = useState<TeacherRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionComment, setActionComment] = useState('')
  const [actionType, setActionType] = useState<'APROBAR' | 'RECHAZAR' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0
  })

  useEffect(() => {
    loadRequests()
  }, [filter])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const filterParam = filter !== 'TODOS' ? `?estado=${filter}` : ''
      const response = await fetch(`/api/admin/teacher-requests${filterParam}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar solicitudes')
      }

      const data = await response.json()
      setRequests(data.solicitudes || [])
      setEstadisticas(data.estadisticas || {
        total: 0,
        pendientes: 0,
        aprobadas: 0,
        rechazadas: 0
      })
    } catch (error) {
      console.error('Error al cargar solicitudes:', error)
      alert('Error al cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedRequest || !actionType || actionLoading) return

    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/teacher-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_solicitud: selectedRequest.id_solicitud,
          accion: actionType.toLowerCase(),
          comentario_revision: actionComment.trim() || null
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar solicitud')
      }

      // Actualizar la lista
      await loadRequests()
      
      // Cerrar modal
      setShowModal(false)
      setSelectedRequest(null)
      setActionComment('')
      setActionType(null)

      // Mostrar mensaje de éxito
      alert(`Solicitud ${actionType === 'APROBAR' ? 'aprobada' : 'rechazada'} exitosamente`)
      
      if (actionType === 'APROBAR' && result.usuario_creado?.credenciales_enviadas) {
        alert(`✅ Credenciales enviadas por correo electrónico a: ${result.usuario_creado.email}\n\nEl profesor recibirá sus credenciales de acceso en su bandeja de entrada.`)
      }

    } catch (error) {
      console.error('Error al procesar solicitud:', error)
      alert(error instanceof Error ? error.message : 'Error al procesar solicitud')
    } finally {
      setActionLoading(false)
    }
  }

  const openActionModal = (request: TeacherRequest, action: 'APROBAR' | 'RECHAZAR') => {
    setSelectedRequest(request)
    setActionType(action)
    setActionComment('')
    setShowModal(true)
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'APROBADA':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'RECHAZADA':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (estado: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"
    switch (estado) {
      case 'PENDIENTE':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'APROBADA':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'RECHAZADA':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const filteredRequests = requests

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con estadísticas */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#00246a]">Solicitudes de Profesores</h2>
          <button
            onClick={loadRequests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-semibold text-gray-800">Total</h3>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
          </div>
          <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <h3 className="font-semibold text-yellow-800">Pendientes</h3>
            <p className="text-2xl font-bold text-yellow-900">{estadisticas.pendientes}</p>
          </div>
          <div className="p-4 border border-green-200 rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-800">Aprobadas</h3>
            <p className="text-2xl font-bold text-green-900">{estadisticas.aprobadas}</p>
          </div>
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <h3 className="font-semibold text-red-800">Rechazadas</h3>
            <p className="text-2xl font-bold text-red-900">{estadisticas.rechazadas}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2">
            {['TODOS', 'PENDIENTE', 'APROBADA', 'RECHAZADA'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFilter(estado as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === estado
                    ? 'bg-[#00246a] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de solicitudes */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00246a]" />
            <p className="text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay solicitudes</h3>
            <p className="text-gray-500">
              {filter === 'TODOS' 
                ? 'No se han recibido solicitudes de profesores aún.'
                : `No hay solicitudes con estado "${filter}".`
              }
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id_solicitud} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(request.estado)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.nombre} {request.apellido}
                    </h3>
                    <span className={getStatusBadge(request.estado)}>
                      {request.estado}
                    </span>
                  </div>
                </div>
                
                {request.estado === 'PENDIENTE' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openActionModal(request, 'APROBAR')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => openActionModal(request, 'RECHAZAR')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{request.email}</span>
                </div>
                {request.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{request.telefono}</span>
                  </div>
                )}
                {request.edad && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{request.edad} años</span>
                  </div>
                )}
                {request.nivel_estudios && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{request.nivel_estudios}</span>
                  </div>
                )}
              </div>

              {request.observaciones && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Observaciones:</p>
                      <p className="text-sm text-gray-600">{request.observaciones}</p>
                    </div>
                  </div>
                </div>
              )}

              {request.fecha_revision && request.comentario_revision && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Comentario de revisión:
                      </p>
                      <p className="text-sm text-blue-600">{request.comentario_revision}</p>
                      <p className="text-xs text-blue-500 mt-1">
                        {new Date(request.fecha_revision).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500">
                Solicitud recibida: {new Date(request.fecha_solicitud).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmación */}
      {showModal && selectedRequest && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === 'APROBAR' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
            </h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que quieres {actionType === 'APROBAR' ? 'aprobar' : 'rechazar'} la solicitud de{' '}
              <strong>{selectedRequest.nombre} {selectedRequest.apellido}</strong>?
            </p>
            
            {actionType === 'APROBAR' && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ Se creará automáticamente una cuenta de profesor con una contraseña temporal.
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario {actionType === 'RECHAZAR' ? '(requerido)' : '(opcional)'}
              </label>
              <textarea
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder={
                  actionType === 'APROBAR' 
                    ? 'Mensaje de bienvenida o instrucciones adicionales...'
                    : 'Motivo del rechazo...'
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading || (actionType === 'RECHAZAR' && !actionComment.trim())}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  actionType === 'APROBAR' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading ? 'Procesando...' : (actionType === 'APROBAR' ? 'Aprobar' : 'Rechazar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}