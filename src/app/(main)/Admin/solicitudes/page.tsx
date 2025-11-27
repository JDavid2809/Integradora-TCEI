'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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

export default function TeacherRequestsAdmin() {
  const { data: session, status } = useSession()
  const [requests, setRequests] = useState<TeacherRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'TODOS' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'>('TODOS')
  const [selectedRequest, setSelectedRequest] = useState<TeacherRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionComment, setActionComment] = useState('')
  const [actionType, setActionType] = useState<'APROBAR' | 'RECHAZAR' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Verificar autorización
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.rol !== 'ADMIN') {
      window.location.href = '/Login'
      return
    }
    loadRequests()
  }, [session, status])

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
      
      // Si se aprobó, mostrar información adicional
      if (actionType === 'APROBAR' && result.password_temporal) {
        alert(`Profesor creado. Password temporal: ${result.password_temporal}\n(En producción esto se enviaría por email)`)
      }

    } catch (error) {
      console.error('Error al procesar solicitud:', error)
      alert(error instanceof Error ? error.message : 'Error desconocido')
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

  const getStatusBadge = (estado: string) => {
    const styles = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APROBADA: 'bg-green-100 text-green-800 border-green-200',
      RECHAZADA: 'bg-red-100 text-red-800 border-red-200'
    }
    
    const icons = {
      PENDIENTE: <Clock className="w-4 h-4" />,
      APROBADA: <CheckCircle className="w-4 h-4" />,
      RECHAZADA: <XCircle className="w-4 h-4" />
    }

    const labels = {
      PENDIENTE: 'Pendiente',
      APROBADA: 'Aprobada',
      RECHAZADA: 'Rechazada'
    }

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${styles[estado as keyof typeof styles]}`}>
        {icons[estado as keyof typeof icons]}
        {labels[estado as keyof typeof labels]}
      </span>
    )
  }

  const filteredRequests = filter === 'TODOS' ? requests : requests.filter(req => req.estado === filter)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!session || session.user?.rol !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Solicitudes de Profesores
          </h1>
          <p className="text-gray-600">
            Gestiona las solicitudes para unirse al equipo de profesores
          </p>
        </div>

        {/* Filtros y estadísticas */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
              >
                <option value="TODOS">Todas las solicitudes</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="APROBADA">Aprobadas</option>
                <option value="RECHAZADA">Rechazadas</option>
              </select>
              <button
                onClick={loadRequests}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.estado === 'PENDIENTE').length}
                </div>
                <div className="text-gray-500">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.estado === 'APROBADA').length}
                </div>
                <div className="text-gray-500">Aprobadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {requests.filter(r => r.estado === 'RECHAZADA').length}
                </div>
                <div className="text-gray-500">Rechazadas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de solicitudes */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-8 h-8 border-2 border-[#00246a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay solicitudes
            </h3>
            <p className="text-gray-600">
              {filter === 'TODOS' ? 'No se han recibido solicitudes aún' : `No hay solicitudes ${filter.toLowerCase()}`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id_solicitud} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Información principal */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {request.nombre} {request.apellido}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {request.email}
                          </span>
                          {request.telefono && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {request.telefono}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(request.fecha_solicitud).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(request.estado)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      {request.edad && (
                        <div>
                          <span className="font-medium text-gray-700">Edad:</span>
                          <span className="ml-2 text-gray-600">{request.edad} años</span>
                        </div>
                      )}
                      {request.nivel_estudios && (
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-700">Estudios:</span>
                          <span className="ml-1 text-gray-600">{request.nivel_estudios}</span>
                        </div>
                      )}
                      {request.direccion && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-700">Ubicación:</span>
                          <span className="ml-1 text-gray-600">{request.direccion}</span>
                        </div>
                      )}
                      {request.curp && (
                        <div>
                          <span className="font-medium text-gray-700">CURP:</span>
                          <span className="ml-2 text-gray-600">{request.curp}</span>
                        </div>
                      )}
                      {request.rfc && (
                        <div>
                          <span className="font-medium text-gray-700">RFC:</span>
                          <span className="ml-2 text-gray-600">{request.rfc}</span>
                        </div>
                      )}
                    </div>

                    {request.observaciones && (
                      <div className="mt-4">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-700">Observaciones:</span>
                            <p className="text-gray-600 text-sm mt-1">{request.observaciones}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Información de revisión */}
                    {request.estado !== 'PENDIENTE' && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-700">
                            {request.estado === 'APROBADA' ? 'Aprobada' : 'Rechazada'} por:
                          </span>
                          <span className="text-gray-600">
                            {request.revisor ? 
                              `${request.revisor.usuario.nombre} ${request.revisor.usuario.apellido}` : 
                              'Sistema'
                            }
                          </span>
                          {request.fecha_revision && (
                            <span className="text-gray-500 ml-auto">
                              {new Date(request.fecha_revision).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {request.comentario_revision && (
                          <p className="text-sm text-gray-600 mt-2">{request.comentario_revision}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  {request.estado === 'PENDIENTE' && (
                    <div className="flex flex-col gap-3 min-w-[200px]">
                      <button
                        onClick={() => openActionModal(request, 'APROBAR')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprobar
                      </button>
                      <button
                        onClick={() => openActionModal(request, 'RECHAZAR')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de confirmación */}
        {showModal && selectedRequest && actionType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {actionType === 'APROBAR' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
              </h3>
              
              <p className="text-gray-600 mb-4">
                ¿Estás seguro de que quieres {actionType === 'APROBAR' ? 'aprobar' : 'rechazar'} la solicitud de{' '}
                <strong>{selectedRequest.nombre} {selectedRequest.apellido}</strong>?
              </p>

              {actionType === 'APROBAR' && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Al aprobar:</strong> Se creará automáticamente un usuario profesor con credenciales temporales.
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  placeholder={
                    actionType === 'APROBAR' 
                      ? 'Comentarios adicionales...' 
                      : 'Razón del rechazo...'
                  }
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAction}
                  disabled={actionLoading || (actionType === 'RECHAZAR' && !actionComment.trim())}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
    </div>
  )
}