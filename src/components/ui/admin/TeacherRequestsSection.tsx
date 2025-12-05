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
  MessageSquare,
  Paperclip
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
  documentos_adjuntos?: string // JSON string
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
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#00246a] dark:text-blue-400">Solicitudes de Profesores</h2>
          <button
            onClick={loadRequests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#00246a] dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Total</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticas.total}</p>
          </div>
          <div className="p-4 border border-yellow-200 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">Pendientes</h3>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">{estadisticas.pendientes}</p>
          </div>
          <div className="p-4 border border-green-200 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/20">
            <h3 className="font-semibold text-green-800 dark:text-green-400">Aprobadas</h3>
            <p className="text-2xl font-bold text-green-900 dark:text-green-300">{estadisticas.aprobadas}</p>
          </div>
          <div className="p-4 border border-red-200 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20">
            <h3 className="font-semibold text-red-800 dark:text-red-400">Rechazadas</h3>
            <p className="text-2xl font-bold text-red-900 dark:text-red-300">{estadisticas.rechazadas}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <div className="flex gap-2">
            {['TODOS', 'PENDIENTE', 'APROBADA', 'RECHAZADA'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFilter(estado as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === estado
                    ? 'bg-[#00246a] dark:bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
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
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00246a] dark:text-blue-400" />
            <p className="text-gray-600 dark:text-gray-400">Cargando solicitudes...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No hay solicitudes</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'TODOS' 
                ? 'No se han recibido solicitudes de profesores aún.'
                : `No hay solicitudes con estado "${filter}".`
              }
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id_solicitud} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(request.estado)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                
                {request.estado === 'RECHAZADA' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openActionModal(request, 'APROBAR')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Reconsiderar y aprobar"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprobar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{request.email}</span>
                </div>
                {request.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{request.telefono}</span>
                  </div>
                )}
                {request.edad && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{request.edad} años</span>
                  </div>
                )}
                {request.nivel_estudios && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{request.nivel_estudios}</span>
                  </div>
                )}
              </div>

              {request.observaciones && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{request.observaciones}</p>
                    </div>
                  </div>
                </div>
              )}

              {request.documentos_adjuntos && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Paperclip className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div className="w-full">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Documentos adjuntos:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(() => {
                          try {
                            const docs = JSON.parse(request.documentos_adjuntos)
                            return docs.map((doc: any, idx: number) => (
                              <a
                                key={idx}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded hover:bg-gray-50 dark:hover:bg-slate-500 transition-colors text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                <FileText className="w-3 h-3" />
                                <span className="truncate text-gray-700 dark:text-gray-200">{doc.name}</span>
                              </a>
                            ))
                          } catch (e) {
                            return <span className="text-sm text-red-500">Error al cargar documentos</span>
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {request.fecha_revision && request.comentario_revision && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Comentario de revisión:
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-200">{request.comentario_revision}</p>
                      <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                        {new Date(request.fecha_revision).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Solicitud recibida: {new Date(request.fecha_solicitud).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmación */}
      {showModal && selectedRequest && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {actionType === 'APROBAR' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              ¿Estás seguro de que quieres {actionType === 'APROBAR' ? 'aprobar' : 'rechazar'} la solicitud de{' '}
              <strong>{selectedRequest.nombre} {selectedRequest.apellido}</strong>?
            </p>
            
            {actionType === 'APROBAR' && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✅ Se creará automáticamente una cuenta de profesor con una contraseña temporal.
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full p-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
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