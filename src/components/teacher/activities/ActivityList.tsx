'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Plus,
    Search,
    Filter,
    Calendar,
    Users,
    FileText,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    BarChart3,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    RefreshCw,
    MoreVertical,
    Grid3x3,
    List
} from 'lucide-react'
import { CourseActivityWithDetails } from '@/types/course-activity'
import {
    getCourseActivities,
    deleteActivity,
    toggleActivityPublish
} from '@/actions/teacher/activityActions'
import { ActivityTypeConfig } from '@/types/course-activity'

interface ActivityListProps {
    courseId: number
    teacherId: number
    courseName: string
    onCreateNew: () => void
    onEdit: (activityId: number) => void
    onViewSubmissions: (activityId: number, activityTitle: string, totalPoints: number) => void
}

type FilterType = 'all' | 'published' | 'unpublished'
type ActivityTypeFilter = 'all' | string
type ViewMode = 'grid' | 'list'

export default function ActivityList({
    courseId,
    teacherId,
    courseName,
    onCreateNew,
    onEdit,
    onViewSubmissions
}: ActivityListProps) {
    const [activities, setActivities] = useState<CourseActivityWithDetails[]>([])
    const [filteredActivities, setFilteredActivities] = useState<CourseActivityWithDetails[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<FilterType>('all')
    const [typeFilter, setTypeFilter] = useState<ActivityTypeFilter>('all')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [actioningActivity, setActioningActivity] = useState<number | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [activityToDelete, setActivityToDelete] = useState<CourseActivityWithDetails | null>(null)
    const [showMenu, setShowMenu] = useState<number | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('grid')

    // Mapeo de colores para clases de Tailwind (no soporta interpolación dinámica)
    const colorClasses = {
        blue: { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
        green: { bg: 'bg-green-100', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
        orange: { bg: 'bg-orange-100', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' },
        red: { bg: 'bg-red-100', text: 'text-red-600', badge: 'bg-red-100 text-red-700' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' },
        indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
        pink: { bg: 'bg-pink-100', text: 'text-pink-600', badge: 'bg-pink-100 text-pink-700' }
    } as const

    // Cargar actividades
    const loadActivities = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await getCourseActivities(courseId, teacherId)
            setActivities(data)
            setFilteredActivities(data)
        } catch (error) {
            console.error('Error loading activities:', error)
        } finally {
            setIsLoading(false)
        }
    }, [courseId, teacherId])

    useEffect(() => {
        loadActivities()
    }, [loadActivities])

    // Filtrar actividades
    useEffect(() => {
        let filtered = [...activities]

        // Filtro de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(activity =>
                activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filtro de estado
        if (statusFilter !== 'all') {
            filtered = filtered.filter(activity =>
                statusFilter === 'published' ? activity.is_published : !activity.is_published
            )
        }

        // Filtro de tipo
        if (typeFilter !== 'all') {
            filtered = filtered.filter(activity => activity.activity_type === typeFilter)
        }

        setFilteredActivities(filtered)
    }, [activities, searchTerm, statusFilter, typeFilter])

    // Refrescar
    const handleRefresh = async () => {
        setIsRefreshing(true)
        await loadActivities()
        setIsRefreshing(false)
    }

    // Toggle publicación
    const handleTogglePublish = async (activityId: number) => {
        try {
            setActioningActivity(activityId)
            const result = await toggleActivityPublish(activityId, teacherId)
            if (result.success) {
                setActivities(prev =>
                    prev.map(activity =>
                        activity.id === activityId
                            ? { ...activity, is_published: result.is_published! }
                            : activity
                    )
                )
            }
        } catch (error) {
            console.error('Error toggling publish:', error)
        } finally {
            setActioningActivity(null)
            setShowMenu(null)
        }
    }

    // Eliminar actividad
    const handleDeleteRequest = (activity: CourseActivityWithDetails) => {
        setActivityToDelete(activity)
        setShowDeleteModal(true)
        setShowMenu(null)
    }

    const handleDeleteConfirm = async () => {
        if (!activityToDelete) return

        try {
            setActioningActivity(activityToDelete.id)
            const result = await deleteActivity(activityToDelete.id, teacherId)
            if (result.success) {
                setActivities(prev => prev.filter(a => a.id !== activityToDelete.id))
                setShowDeleteModal(false)
                setActivityToDelete(null)
            }
        } catch (error) {
            console.error('Error deleting activity:', error)
        } finally {
            setActioningActivity(null)
        }
    }

    // Formatear fecha
    const formatDate = (date: Date | null) => {
        if (!date) return 'Sin fecha límite'
        const d = new Date(date)
        return d.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    // Verificar si está vencida
    const isOverdue = (date: Date | null | undefined) => {
        if (!date) return false
        return new Date(date) < new Date()
    }

    // Estadísticas generales
    const stats = {
        total: activities.length,
        published: activities.filter(a => a.is_published).length,
        unpublished: activities.filter(a => !a.is_published).length,
        totalSubmissions: activities.reduce((sum, a) => sum + (a._count?.submissions || 0), 0)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 sm:w-12 sm:h-12 animate-spin mx-auto mb-4 text-[#00246a]" />
                    <p className="text-sm sm:text-base text-gray-600">Cargando actividades...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#00246a]">Actividades</h1>
                    <p className="text-xs sm:text-sm text-gray-600">Curso: {courseName}</p>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 sm:flex-none text-sm sm:text-base"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Actualizar</span>
                    </button>

                    <button
                        onClick={onCreateNew}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700 flex-1 sm:flex-none text-sm sm:text-base"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Actividad
                    </button>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 sm:p-4 text-white">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 opacity-80" />
                        <div>
                            <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                            <p className="text-xs sm:text-sm opacity-90">Total</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 sm:p-4 text-white">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 opacity-80" />
                        <div>
                            <p className="text-xl sm:text-2xl font-bold">{stats.published}</p>
                            <p className="text-xs sm:text-sm opacity-90">Publicadas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3 sm:p-4 text-white">
                    <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 opacity-80" />
                        <div>
                            <p className="text-xl sm:text-2xl font-bold">{stats.unpublished}</p>
                            <p className="text-xs sm:text-sm opacity-90">Borradores</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 sm:p-4 text-white col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 opacity-80" />
                        <div>
                            <p className="text-xl sm:text-2xl font-bold">{stats.totalSubmissions}</p>
                            <p className="text-xs sm:text-sm opacity-90">Entregas Totales</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4 sm:p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    {/* Búsqueda */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Buscar actividades..."
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
                            onChange={(e) => setStatusFilter(e.target.value as FilterType)}
                            className="flex-1 px-4 py-3 text-sm sm:text-base bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00246a] focus:border-[#00246a] text-gray-900 font-medium transition-all duration-200 shadow-sm hover:border-gray-400 appearance-none cursor-pointer"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="published">Publicadas</option>
                            <option value="unpublished">Borradores</option>
                        </select>
                    </div>

                    {/* Filtro de tipo */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="flex-1 px-4 py-3 text-sm sm:text-base bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00246a] focus:border-[#00246a] text-gray-900 font-medium transition-all duration-200 shadow-sm hover:border-gray-400 appearance-none cursor-pointer"
                        >
                            <option value="all">Todos los tipos</option>
                            {Object.entries(ActivityTypeConfig).map(([key, config]) => (
                                <option key={key} value={key}>
                                    {config.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Toggle de vista */}
                <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                    <div className="inline-flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-white text-[#00246a] shadow-sm font-semibold'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Grid3x3 className="w-4 h-4" />
                            <span className="text-sm">Tarjetas</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                                viewMode === 'list'
                                    ? 'bg-white text-[#00246a] shadow-sm font-semibold'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <List className="w-4 h-4" />
                            <span className="text-sm">Lista</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de actividades */}
            {filteredActivities.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">
                        {activities.length === 0 ? 'No hay actividades' : 'No se encontraron actividades'}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 mb-6">
                        {activities.length === 0
                            ? 'Crea tu primera actividad para comenzar'
                            : 'Intenta ajustar los filtros de búsqueda'}
                    </p>
                    {activities.length === 0 && (
                        <button
                            onClick={onCreateNew}
                            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#00246a] text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                        >
                            <Plus className="w-5 h-5" />
                            Crear Primera Actividad
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                // Vista de Tarjetas (Grid)
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredActivities.map((activity) => {
                        const typeConfig = ActivityTypeConfig[activity.activity_type as keyof typeof ActivityTypeConfig]
                        const colors = colorClasses[typeConfig.color as keyof typeof colorClasses] || colorClasses.blue
                        const overdue = isOverdue(activity.due_date)
                        const submissionsCount = activity._count?.submissions || 0

                        return (
                            <div
                                key={activity.id}
                                className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group ${
                                    showMenu === activity.id ? 'overflow-visible' : 'overflow-hidden'
                                }`}
                            >
                                {/* Header con color según tipo */}
                                <div className={`h-24 relative ${
                                    typeConfig.color === 'blue' ? 'bg-sky-400' :
                                    typeConfig.color === 'purple' ? 'bg-purple-400' :
                                    typeConfig.color === 'green' ? 'bg-emerald-400' :
                                    typeConfig.color === 'orange' ? 'bg-orange-400' :
                                    typeConfig.color === 'red' ? 'bg-rose-400' :
                                    typeConfig.color === 'yellow' ? 'bg-amber-400' :
                                    typeConfig.color === 'indigo' ? 'bg-indigo-400' :
                                    typeConfig.color === 'pink' ? 'bg-pink-400' :
                                    'bg-sky-400'
                                } ${!activity.is_published ? 'opacity-60' : ''}`}>
                                    {/* Pattern decorativo */}
                                    <svg className="absolute inset-0 w-full h-full opacity-10">
                                        <defs>
                                            <pattern id={`grid-${activity.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                                                <circle cx="10" cy="10" r="1" fill="white" />
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill={`url(#grid-${activity.id})`} />
                                    </svg>

                                    {/* Menú de acciones */}
                                    <div className="absolute top-3 right-3 z-[30]">
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    e.preventDefault()
                                                    setShowMenu(showMenu === activity.id ? null : activity.id)
                                                }}
                                                className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-all border border-white/30 touch-manipulation"
                                                type="button"
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                                </div>
                                            </button>

                                            {showMenu === activity.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-[35] bg-black/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            e.preventDefault()
                                                            setShowMenu(null)
                                                        }}
                                                    />
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-1 z-[40] overflow-hidden">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                e.preventDefault()
                                                                onViewSubmissions(activity.id, activity.title, activity.total_points)
                                                                setShowMenu(null)
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2 transition-colors touch-manipulation"
                                                            type="button"
                                                        >
                                                            <Users className="w-4 h-4" />
                                                            Ver Entregas
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                e.preventDefault()
                                                                onEdit(activity.id)
                                                                setShowMenu(null)
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors touch-manipulation"
                                                            type="button"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            Editar Actividad
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                e.preventDefault()
                                                                handleTogglePublish(activity.id)
                                                            }}
                                                            disabled={actioningActivity === activity.id}
                                                            className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 transition-colors touch-manipulation ${
                                                                activity.is_published
                                                                    ? 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                                                                    : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                                                            }`}
                                                            type="button"
                                                        >
                                                            {activity.is_published ? (
                                                                <>
                                                                    <EyeOff className="w-4 h-4" />
                                                                    Despublicar
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye className="w-4 h-4" />
                                                                    Publicar
                                                                </>
                                                            )}
                                                        </button>
                                                        <div className="border-t border-gray-200 my-1"></div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                e.preventDefault()
                                                                handleDeleteRequest(activity)
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors touch-manipulation"
                                                            type="button"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Badge con icono flotante */}
                                    <div className="absolute -bottom-6 left-6">
                                        <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-white">
                                            <div className={`w-full h-full rounded-full ${colors.bg} flex items-center justify-center`}>
                                                <FileText className={`w-6 h-6 ${colors.text}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenido */}
                                <div className="pt-8 px-6 pb-4">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                                                {activity.title}
                                            </h3>
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                                                {typeConfig.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    {activity.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[2.5rem]">
                                            {activity.description}
                                        </p>
                                    )}

                                    {/* Estados */}
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        {activity.is_published ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Publicada
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                                                <Clock className="w-3.5 h-3.5" />
                                                Borrador
                                            </span>
                                        )}

                                        {activity.due_date && (
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    overdue
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}
                                            >
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(activity.due_date)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Stats mini-cards */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                                            <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-blue-600">{submissionsCount}</p>
                                            <p className="text-xs text-blue-700">Entregas</p>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-3 text-center">
                                            <BarChart3 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-green-600">{activity.total_points}</p>
                                            <p className="text-xs text-green-700">Puntos</p>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                                            <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-purple-600">{activity.max_attempts || 1}</p>
                                            <p className="text-xs text-purple-700">Intentos</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                                    <button
                                        onClick={() => onViewSubmissions(activity.id, activity.title, activity.total_points)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all text-sm font-semibold"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Ver Actividad
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                // Vista de Lista
                <div className="space-y-3">
                    {filteredActivities.map((activity) => {
                        const typeConfig = ActivityTypeConfig[activity.activity_type as keyof typeof ActivityTypeConfig]
                        const colors = colorClasses[typeConfig.color as keyof typeof colorClasses] || colorClasses.blue
                        const overdue = isOverdue(activity.due_date)
                        const submissionsCount = activity._count?.submissions || 0

                        return (
                            <div
                                key={activity.id}
                                className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
                                    showMenu === activity.id ? 'overflow-visible' : 'overflow-hidden'
                                }`}
                            >
                                <div className="flex flex-col lg:flex-row">
                                    {/* Barra lateral de color según tipo */}
                                    <div className={`w-full lg:w-2 ${
                                        typeConfig.color === 'blue' ? 'bg-sky-400' :
                                        typeConfig.color === 'purple' ? 'bg-purple-400' :
                                        typeConfig.color === 'green' ? 'bg-emerald-400' :
                                        typeConfig.color === 'orange' ? 'bg-orange-400' :
                                        typeConfig.color === 'red' ? 'bg-rose-400' :
                                        typeConfig.color === 'yellow' ? 'bg-amber-400' :
                                        typeConfig.color === 'indigo' ? 'bg-indigo-400' :
                                        typeConfig.color === 'pink' ? 'bg-pink-400' :
                                        'bg-sky-400'
                                    } ${!activity.is_published ? 'opacity-60' : ''}`} />

                                    {/* Contenido principal */}
                                    <div className="flex-1 p-4 sm:p-5">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                            {/* Icono y título */}
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                                    <FileText className={`w-7 h-7 ${colors.text}`} />
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-1">
                                                            {activity.title}
                                                        </h3>
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colors.badge}`}>
                                                            {typeConfig.label}
                                                        </span>
                                                    </div>
                                                    
                                                    {activity.description && (
                                                        <p className="text-sm text-gray-600 line-clamp-1 mb-3">
                                                            {activity.description}
                                                        </p>
                                                    )}

                                                    {/* Estados y fecha */}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {activity.is_published ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                                Publicada
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                Borrador
                                                            </span>
                                                        )}

                                                        {activity.due_date && (
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                    overdue
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-blue-100 text-blue-700'
                                                                }`}
                                                            >
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {formatDate(activity.due_date)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Estadísticas */}
                                            <div className="flex items-center gap-6 lg:gap-8 px-4 py-3 bg-gray-50 rounded-lg lg:bg-transparent lg:p-0">
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                                                        <Users className="w-4 h-4" />
                                                    </div>
                                                    <p className="text-xl font-bold text-gray-900">{submissionsCount}</p>
                                                    <p className="text-xs text-gray-600 font-medium">Entregas</p>
                                                </div>

                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                                                        <BarChart3 className="w-4 h-4" />
                                                    </div>
                                                    <p className="text-xl font-bold text-gray-900">{activity.total_points}</p>
                                                    <p className="text-xs text-gray-600 font-medium">Puntos</p>
                                                </div>

                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                                                        <TrendingUp className="w-4 h-4" />
                                                    </div>
                                                    <p className="text-xl font-bold text-gray-900">{activity.max_attempts || 1}</p>
                                                    <p className="text-xs text-gray-600 font-medium">Intentos</p>
                                                </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex items-center gap-2 lg:pl-4 lg:border-l border-gray-200">
                                                <button
                                                    onClick={() => onViewSubmissions(activity.id, activity.title, activity.total_points)}
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex-1 lg:flex-none shadow-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Ver</span>
                                                </button>
                                                
                                                <div className="relative z-[30]">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            e.preventDefault()
                                                            setShowMenu(showMenu === activity.id ? null : activity.id)
                                                        }}
                                                        className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                                                        type="button"
                                                    >
                                                        <MoreVertical className="w-5 h-5 text-gray-600" />
                                                    </button>

                                                    {showMenu === activity.id && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-[35] bg-black/10"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    e.preventDefault()
                                                                    setShowMenu(null)
                                                                }}
                                                            />
                                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-1 z-[40] overflow-hidden">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        e.preventDefault()
                                                                        onEdit(activity.id)
                                                                        setShowMenu(null)
                                                                    }}
                                                                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors touch-manipulation"
                                                                    type="button"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                    Editar
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        e.preventDefault()
                                                                        handleTogglePublish(activity.id)
                                                                    }}
                                                                    disabled={actioningActivity === activity.id}
                                                                    className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 transition-colors touch-manipulation ${
                                                                        activity.is_published
                                                                            ? 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                                                                            : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                                                                    }`}
                                                                    type="button"
                                                                >
                                                                    {activity.is_published ? (
                                                                        <>
                                                                            <EyeOff className="w-4 h-4" />
                                                                            Despublicar
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Eye className="w-4 h-4" />
                                                                            Publicar
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <div className="border-t border-gray-200 my-1"></div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        e.preventDefault()
                                                                        handleDeleteRequest(activity)
                                                                    }}
                                                                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors touch-manipulation"
                                                                    type="button"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Eliminar
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && activityToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Eliminar Actividad</h3>
                                <p className="text-xs sm:text-sm text-gray-500">Esta acción no se puede deshacer</p>
                            </div>
                        </div>

                        <p className="text-sm sm:text-base text-gray-700 mb-6">
                            ¿Estás seguro de que deseas eliminar la actividad{' '}
                            <strong>&ldquo;{activityToDelete.title}&rdquo;</strong>?
                            {activityToDelete._count && activityToDelete._count.submissions > 0 && (
                                <span className="block mt-2 text-red-600 font-medium">
                                    ⚠️ Esta actividad tiene {activityToDelete._count.submissions} entrega(s). Se eliminarán también.
                                </span>
                            )}
                        </p>

                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false)
                                    setActivityToDelete(null)
                                }}
                                className="px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                                disabled={actioningActivity === activityToDelete.id}
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={handleDeleteConfirm}
                                disabled={actioningActivity === activityToDelete.id}
                                className="flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {actioningActivity === activityToDelete.id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
