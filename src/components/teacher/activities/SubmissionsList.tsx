'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  BarChart3,
  RefreshCw,
  Award,
  TrendingUp,
  Users
} from 'lucide-react'
import {
  ActivitySubmissionWithDetails,
  SubmissionStatusConfig
} from '@/types/course-activity'
import { getActivitySubmissions } from '@/actions/teacher/activityActions'
import GradeSubmissionModal from './GradeSubmissionModal'

interface SubmissionsListProps {
  activityId: number
  activityTitle: string
  teacherId: number
  totalPoints: number
  onBack: () => void
}

type StatusFilter = 'all' | 'SUBMITTED' | 'GRADED' | 'RETURNED' | 'PENDING' | 'LATE_SUBMISSION' | 'DRAFT'

export default function SubmissionsList({
  activityId,
  activityTitle,
  teacherId,
  totalPoints,
  onBack
}: SubmissionsListProps) {
  const [submissions, setSubmissions] = useState<ActivitySubmissionWithDetails[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<ActivitySubmissionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<ActivitySubmissionWithDetails | null>(null)
  const [showGradeModal, setShowGradeModal] = useState(false)

  // Cargar entregas
  const loadSubmissions = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getActivitySubmissions(activityId, teacherId)
      setSubmissions(data)
      setFilteredSubmissions(data)
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [activityId, teacherId])

  useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  // Filtrar entregas
  useEffect(() => {
    let filtered = [...submissions]

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (submission) =>
          submission.student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.student.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.student.usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.student.usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro de estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter((submission) => submission.status === statusFilter)
    }

    setFilteredSubmissions(filtered)
  }, [submissions, searchTerm, statusFilter])

  // Refrescar
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadSubmissions()
    setIsRefreshing(false)
  }

  // Abrir modal de calificación
  const handleGradeSubmission = (submission: ActivitySubmissionWithDetails) => {
    setSelectedSubmission(submission)
    setShowGradeModal(true)
  }

  // Callback de éxito al calificar
  const handleGradeSuccess = () => {
    setShowGradeModal(false)
    setSelectedSubmission(null)
    loadSubmissions()
  }

  // Formatear fecha
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calcular estadísticas
  const stats = {
    total: submissions.length,
    submitted: submissions.filter((s) => s.status === 'SUBMITTED').length,
    graded: submissions.filter((s) => s.status === 'GRADED' || s.status === 'RETURNED').length,
    pending: submissions.filter((s) => s.status === 'DRAFT').length,
    late: submissions.filter((s) => s.status === 'LATE').length,
    averageScore:
      submissions.filter((s) => s.score !== null).length > 0
        ? (
            submissions.reduce((sum, s) => sum + (s.score || 0), 0) /
            submissions.filter((s) => s.score !== null).length
          ).toFixed(1)
        : '0'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 sm:w-12 sm:h-12 animate-spin mx-auto mb-4 text-[#00246a]" />
          <p className="text-sm sm:text-base text-gray-600">Cargando entregas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">Volver</span>
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[#00246a] truncate">
            Entregas: {activityTitle}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Puntuación total: {totalPoints} puntos
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 sm:p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
          <p className="text-xs sm:text-sm opacity-90">Total</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3 sm:p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats.submitted}</p>
          <p className="text-xs sm:text-sm opacity-90">Enviadas</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 sm:p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats.graded}</p>
          <p className="text-xs sm:text-sm opacity-90">Calificadas</p>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg p-3 sm:p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats.pending}</p>
          <p className="text-xs sm:text-sm opacity-90">Pendientes</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 sm:p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats.late}</p>
          <p className="text-xs sm:text-sm opacity-90">Tardías</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 sm:p-4 text-white col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{stats.averageScore}</p>
          <p className="text-xs sm:text-sm opacity-90">Promedio</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm sm:text-base bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00246a] focus:border-[#00246a] text-gray-900 placeholder-gray-500 font-medium transition-all duration-200 shadow-sm hover:border-gray-400"
            />
          </div>

          {/* Filtro de estado */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="flex-1 px-4 py-3 text-sm sm:text-base bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00246a] focus:border-[#00246a] text-gray-900 font-medium transition-all duration-200 shadow-sm hover:border-gray-400 appearance-none cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="SUBMITTED">Enviadas</option>
              <option value="GRADED">Calificadas</option>
              <option value="RETURNED">Devueltas</option>
              <option value="PENDING">Pendientes</option>
              <option value="LATE_SUBMISSION">Tardías</option>
              <option value="DRAFT">Borradores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de entregas */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">
            {submissions.length === 0 ? 'No hay entregas' : 'No se encontraron entregas'}
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            {submissions.length === 0
              ? 'Los estudiantes aún no han enviado trabajos'
              : 'Intenta ajustar los filtros de búsqueda'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Vista de tabla para desktop */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Estudiante
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Fecha de Envío
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Intentos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Calificación
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => {
                  const statusConfig = SubmissionStatusConfig[submission.status]
                  const percentage = submission.score
                    ? ((submission.score / totalPoints) * 100).toFixed(0)
                    : null

                  return (
                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">
                              {submission.student.usuario.nombre} {submission.student.usuario.apellido}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {submission.student.usuario.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-700`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {submission.submitted_at
                            ? formatDate(submission.submitted_at)
                            : 'No enviada'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 font-medium">
                          {submission.attempt_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {submission.score !== null ? (
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-500" />
                            <span className="text-lg font-bold text-gray-900">
                              {submission.score}
                            </span>
                            <span className="text-sm text-gray-500">/ {totalPoints}</span>
                            <span className="text-sm font-medium text-gray-600">
                              ({percentage}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Sin calificar</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleGradeSubmission(submission)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          {submission.score !== null ? 'Ver / Editar' : 'Calificar'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Vista de tarjetas para móvil */}
          <div className="lg:hidden space-y-4">
            {filteredSubmissions.map((submission) => {
              const statusConfig = SubmissionStatusConfig[submission.status]
              const percentage = submission.score
                ? ((submission.score / totalPoints) * 100).toFixed(0)
                : null

              return (
                <div
                  key={submission.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
                >
                  {/* Estudiante */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {submission.student.usuario.nombre} {submission.student.usuario.apellido}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {submission.student.usuario.email}
                      </p>
                    </div>
                  </div>

                  {/* Estado y fecha */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-700`}
                    >
                      {statusConfig.label}
                    </span>
                    {submission.submitted_at && (
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(submission.submitted_at)}
                      </span>
                    )}
                  </div>

                  {/* Info de intentos y calificación */}
                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Intento</p>
                      <p className="text-lg font-bold text-gray-900">
                        {submission.attempt_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Calificación</p>
                      {submission.score !== null ? (
                        <div className="flex items-baseline gap-1">
                          <p className="text-lg font-bold text-gray-900">{submission.score}</p>
                          <p className="text-sm text-gray-500">/ {totalPoints}</p>
                          <p className="text-sm font-medium text-gray-600">({percentage}%)</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Sin calificar</p>
                      )}
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <button
                    onClick={() => handleGradeSubmission(submission)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00246a] text-white rounded-lg hover:bg-blue-700"
                  >
                    <Eye className="w-5 h-5" />
                    {submission.score !== null ? 'Ver / Editar Calificación' : 'Calificar Entrega'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal de calificación */}
      {showGradeModal && selectedSubmission && (
        <GradeSubmissionModal
          submission={selectedSubmission}
          teacherId={teacherId}
          totalPoints={totalPoints}
          onClose={() => {
            setShowGradeModal(false)
            setSelectedSubmission(null)
          }}
          onSuccess={handleGradeSuccess}
        />
      )}
    </div>
  )
}
