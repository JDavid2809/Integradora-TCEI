"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import {
    Calendar,
    Clock,
    Search,
    Filter,
    Grid3x3,
    List,
    CheckCircle,
    AlertCircle,
    FileText,
    Video,
    PenTool,
    BookOpen,
    MessageSquare,
    ChevronDown,
    X,
    Download,
    Upload,
    Eye,
    Star,
    TrendingUp,
    Award,
    Target,
    Zap,
    RefreshCw,
    Loader2
} from 'lucide-react'
import { getAllStudentActivities, getStudentActivitiesStats, StudentActivityWithCourse } from '@/actions/student/allActivitiesActions'

// Tipos internos para manejo del estado
interface Activity {
    id: number
    title: string
    description: string
    due_date: string | null
    activity_type: string
    status: 'pending' | 'in_progress' | 'completed' | 'overdue'
    course: {
        id: number
        nombre: string
        nivel: string
        color: string
    }
    points: number
    total_points: number
    progress: number
}

// Configuración de tipos de actividades
const ACTIVITY_CONFIG = {
    ASSIGNMENT: { icon: FileText, label: 'Tarea', color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700' },
    QUIZ: { icon: CheckCircle, label: 'Quiz', color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-700' },
    PROJECT: { icon: PenTool, label: 'Proyecto', color: 'purple', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-700' },
    READING: { icon: BookOpen, label: 'Lectura', color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-700' },
    VIDEO: { icon: Video, label: 'Video', color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-700' },
    PRACTICE: { icon: Target, label: 'Práctica', color: 'yellow', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-700' },
    DISCUSSION: { icon: MessageSquare, label: 'Discusión', color: 'indigo', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', textColor: 'text-indigo-700' },
    EXAM: { icon: AlertCircle, label: 'Examen', color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-700' },
}

// Configuración de estados
const STATUS_CONFIG = {
    pending: { label: 'Pendiente', color: 'bg-gray-100 text-gray-700', icon: Clock },
    in_progress: { label: 'En Progreso', color: 'bg-blue-100 text-blue-700', icon: Zap },
    completed: { label: 'Completada', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    overdue: { label: 'Vencida', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

export default function Activitys() {
    const [activities, setActivities] = useState<Activity[]>([])
    const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [selectedType, setSelectedType] = useState<string>('all')
    const [selectedCourse, setSelectedCourse] = useState<string>('all')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Función para obtener color por modalidad
    const getColorByModalidad = (modalidad: string, nivel: string | null): string => {
        if (modalidad === 'ONLINE') {
            return 'bg-blue-500'
        }
        if (nivel) {
            if (nivel.includes('A1') || nivel.includes('A2')) return 'bg-blue-500'
            if (nivel.includes('B1') || nivel.includes('B2')) return 'bg-green-500'
            if (nivel.includes('C1') || nivel.includes('C2')) return 'bg-purple-500'
        }
        return 'bg-slate-500'
    }

    // Función para calcular el estado de la actividad
    const calculateActivityStatus = (activity: StudentActivityWithCourse): 'pending' | 'in_progress' | 'completed' | 'overdue' => {
        if (activity.submission) {
            if (activity.submission.status === 'GRADED') {
                return 'completed'
            }
            if (activity.submission.status === 'SUBMITTED' || activity.submission.status === 'RETURNED') {
                return 'in_progress'
            }
        }
        
        if (activity.due_date) {
            const now = new Date()
            const dueDate = new Date(activity.due_date)
            if (now > dueDate && !activity.submission) {
                return 'overdue'
            }
        }

        return 'pending'
    }

    // Función para calcular el progreso
    const calculateProgress = (activity: StudentActivityWithCourse): number => {
        if (!activity.submission) return 0
        if (activity.submission.status === 'GRADED' && activity.submission.score !== null) {
            return Math.round((activity.submission.score / activity.total_points) * 100)
        }
        if (activity.submission.status === 'SUBMITTED') {
            return 50 // Entregado pero no calificado
        }
        return 0
    }

    // Cargar actividades
    const loadActivities = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getAllStudentActivities()
            
            // Transformar datos de la BD al formato del componente
            const transformedActivities: Activity[] = data.map(act => ({
                id: act.id,
                title: act.title,
                description: act.description || '',
                due_date: act.due_date ? act.due_date.toISOString() : null,
                activity_type: act.activity_type,
                status: calculateActivityStatus(act),
                course: {
                    id: act.course.id,
                    nombre: act.course.nombre,
                    nivel: act.course.nivel_ingles || 'N/A',
                    color: getColorByModalidad(act.course.modalidad, act.course.nivel_ingles)
                },
                points: act.submission?.score || 0,
                total_points: act.total_points,
                progress: calculateProgress(act)
            }))

            setActivities(transformedActivities)
            setFilteredActivities(transformedActivities)
        } catch (err) {
            console.error('Error loading activities:', err)
            setError('Error al cargar las actividades. Por favor, intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }, [])

    // Cargar actividades al montar
    useEffect(() => {
        loadActivities()
    }, [loadActivities])

    // Tour con driver.js
    const startActivitiesTour = useCallback(() => {
        const steps = [
            {
                element: "#activities-header",
                popover: {
                    title: "Panel de Actividades",
                    description: "Bienvenido a tu panel de actividades. Aquí puedes ver todas tus tareas, quizzes, proyectos y más. Gestiona tu trabajo académico de manera eficiente.",
                    position: "bottom",
                },
            },
            {
                element: "#stats-cards",
                popover: {
                    title: "Estadísticas Rápidas",
                    description: "Obtén una vista general de tu progreso: actividades pendientes, completadas, puntos obtenidos y tu rendimiento general.",
                    position: "bottom",
                },
            },
            {
                element: "#search-bar",
                popover: {
                    title: "Búsqueda Rápida",
                    description: "Busca actividades específicas por nombre o descripción. Encuentra rápidamente lo que necesitas.",
                    position: "bottom",
                },
            },
            {
                element: "#filter-button",
                popover: {
                    title: "Filtros Avanzados",
                    description: "Filtra tus actividades por estado (pendiente, completada, etc.), tipo (tarea, quiz, proyecto) o curso específico.",
                    position: "left",
                },
            },
            {
                element: "#view-toggle",
                popover: {
                    title: "Cambiar Vista",
                    description: "Alterna entre vista de cuadrícula (cards) y vista de lista según tu preferencia.",
                    position: "left",
                },
            },
            {
                element: "#activities-container",
                popover: {
                    title: "Tus Actividades",
                    description: "Aquí están todas tus actividades. Haz clic en cualquiera para ver detalles completos, subir archivos o marcarla como completada.",
                    position: "top",
                },
            },
        ];

        const driverObj = driver({
            showProgress: true,
            allowClose: true,
            popoverClass: "driverjs-theme",
            steps,
        });

        driverObj.drive();
    }, []);

    // Ejecutar el tour solo una vez
    useEffect(() => {
        const hasSeenActivitiesTour = localStorage.getItem("hasSeenActivitiesTour");
        if (hasSeenActivitiesTour) return;

        const timeout = setTimeout(() => {
            startActivitiesTour();
            localStorage.setItem("hasSeenActivitiesTour", "true");
        }, 1000);

        return () => clearTimeout(timeout);
    }, [startActivitiesTour]);

    // Filtrar actividades
    useEffect(() => {
        let filtered = activities

        // Filtrar por búsqueda
        if (searchTerm) {
            filtered = filtered.filter(activity =>
                activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filtrar por estado
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(activity => activity.status === selectedStatus)
        }

        // Filtrar por tipo
        if (selectedType !== 'all') {
            filtered = filtered.filter(activity => activity.activity_type === selectedType)
        }

        // Filtrar por curso
        if (selectedCourse !== 'all') {
            filtered = filtered.filter(activity => activity.course.id.toString() === selectedCourse)
        }

        setFilteredActivities(filtered)
    }, [searchTerm, selectedStatus, selectedType, selectedCourse, activities])

    // Calcular estadísticas
    const stats = {
        total: activities.length,
        pending: activities.filter(a => a.status === 'pending').length,
        in_progress: activities.filter(a => a.status === 'in_progress').length,
        completed: activities.filter(a => a.status === 'completed').length,
        overdue: activities.filter(a => a.status === 'overdue').length,
        totalPoints: activities.reduce((sum, a) => sum + a.points, 0),
        maxPoints: activities.reduce((sum, a) => sum + a.total_points, 0),
        avgProgress: Math.round(activities.reduce((sum, a) => sum + a.progress, 0) / activities.length)
    }

    // Obtener cursos únicos
    const uniqueCourses = Array.from(new Set(activities.map(a => JSON.stringify(a.course))))
        .map(str => JSON.parse(str))

    // Obtener días hasta vencimiento
    const getDaysUntilDue = (dueDate: string | null) => {
        if (!dueDate) return 999 // Sin fecha límite
        const now = new Date()
        const due = new Date(dueDate)
        const diffTime = due.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    // Obtener color de urgencia
    const getUrgencyColor = (daysUntil: number, status: string) => {
        if (status === 'completed') return 'border-green-300'
        if (status === 'overdue') return 'border-red-500'
        if (daysUntil <= 1) return 'border-red-400'
        if (daysUntil <= 3) return 'border-orange-400'
        if (daysUntil <= 7) return 'border-yellow-400'
        return 'border-slate-200'
    }

    // Mostrar loader
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#00246a] animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-300">Cargando tus actividades...</p>
                </div>
            </div>
        )
    }

    // Mostrar error
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error al cargar actividades</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={loadActivities}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Header */}
            <div id="activities-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#00246a] dark:text-blue-100">Mis Actividades</h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base">Gestiona todas tus tareas y proyectos en un solo lugar</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600">
                        {filteredActivities.length} de {activities.length} actividades
                    </span>
                    <button
                        onClick={loadActivities}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Actualizar actividades"
                    >
                        <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div id="stats-cards" className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 md:p-6 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
                        <span className="text-xl md:text-3xl font-bold">{stats.pending}</span>
                    </div>
                    <p className="text-xs md:text-sm opacity-90">Pendientes</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 md:p-6 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
                        <span className="text-xl md:text-3xl font-bold">{stats.completed}</span>
                    </div>
                    <p className="text-xs md:text-sm opacity-90">Completadas</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 md:p-6 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Award className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
                        <span className="text-xl md:text-3xl font-bold">{stats.totalPoints}</span>
                    </div>
                    <p className="text-xs md:text-sm opacity-90">Puntos Obtenidos</p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 md:p-6 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-6 h-6 md:w-8 md:h-8 opacity-80" />
                        <span className="text-xl md:text-3xl font-bold">{stats.avgProgress}%</span>
                    </div>
                    <p className="text-xs md:text-sm opacity-90">Progreso Promedio</p>
                </motion.div>
            </div>

            {/* Search and Filters */}
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                    {/* Search */}
                    <div id="search-bar" className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar por título o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00246a] dark:focus:ring-blue-500 focus:border-[#00246a] dark:focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium transition-all hover:border-slate-400 dark:hover:border-slate-600"
                            />
                        </div>
                    </div>

                    {/* Filter Button */}
                    <button
                        id="filter-button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all min-w-[120px] ${
                            showFilters
                                ? 'bg-gradient-to-r from-[#00246a] to-[#003a8c] dark:from-blue-600 dark:to-blue-800 text-white shadow-lg transform scale-105'
                                : 'bg-white dark:bg-slate-800 text-[#00246a] dark:text-blue-400 border-2 border-[#00246a] dark:border-blue-400 hover:bg-[#00246a] dark:hover:bg-blue-600 hover:text-white shadow-md'
                        }`}
                    >
                        <Filter className="w-5 h-5" />
                        <span>Filtros</span>
                        {(selectedStatus !== 'all' || selectedType !== 'all' || selectedCourse !== 'all') && (
                            <span className="ml-1 px-2 py-0.5 bg-[#e30f28] text-white text-xs rounded-full font-bold">
                                {[selectedStatus !== 'all', selectedType !== 'all', selectedCourse !== 'all'].filter(Boolean).length}
                            </span>
                        )}
                    </button>

                    {/* View Toggle */}
                    <div id="view-toggle" className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1 shadow-inner">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-md transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-600 dark:to-slate-500 shadow-md text-[#00246a] dark:text-white scale-105'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            title="Vista de cuadrícula"
                        >
                            <Grid3x3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-md transition-all ${
                                viewMode === 'list'
                                    ? 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-600 dark:to-slate-500 shadow-md text-[#00246a] dark:text-white scale-105'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            title="Vista de lista"
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-5 pt-5 border-t-2 border-slate-300 dark:border-slate-700"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Estado */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-[#00246a] dark:text-blue-400 mb-3">
                                        <CheckCircle className="w-4 h-4" />
                                        Estado de la Actividad
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full px-4 py-3 pr-10 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00246a] dark:focus:ring-blue-500 focus:border-[#00246a] dark:focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold appearance-none cursor-pointer transition-all hover:border-slate-400 dark:hover:border-slate-600 shadow-sm"
                                        >
                                            <option value="all">Todos los estados</option>
                                            <option value="pending">Pendientes</option>
                                            <option value="in_progress">En Progreso</option>
                                            <option value="completed">Completadas</option>
                                            <option value="overdue">Vencidas</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#00246a] pointer-events-none" />
                                    </div>
                                </div>

                                {/* Tipo */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-[#00246a] dark:text-blue-400 mb-3">
                                        <FileText className="w-4 h-4" />
                                        Tipo de Actividad
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                            className="w-full px-4 py-3 pr-10 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00246a] dark:focus:ring-blue-500 focus:border-[#00246a] dark:focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold appearance-none cursor-pointer transition-all hover:border-slate-400 dark:hover:border-slate-600 shadow-sm"
                                        >
                                            <option value="all">Todos los tipos</option>
                                            {Object.entries(ACTIVITY_CONFIG).map(([key, config]) => (
                                                <option key={key} value={key}>
                                                    {config.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#00246a] pointer-events-none" />
                                    </div>
                                </div>

                                {/* Curso */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-[#00246a] dark:text-blue-400 mb-3">
                                        <BookOpen className="w-4 h-4" />
                                        Curso
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedCourse}
                                            onChange={(e) => setSelectedCourse(e.target.value)}
                                            className="w-full px-4 py-3 pr-10 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00246a] dark:focus:ring-blue-500 focus:border-[#00246a] dark:focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold appearance-none cursor-pointer transition-all hover:border-slate-400 dark:hover:border-slate-600 shadow-sm"
                                        >
                                            <option value="all">Todos los cursos</option>
                                            {uniqueCourses.map((course) => (
                                                <option key={course.id} value={course.id}>
                                                    {course.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#00246a] pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(selectedStatus !== 'all' || selectedType !== 'all' || selectedCourse !== 'all') && (
                                <div className="mt-5 flex items-center justify-between bg-gradient-to-r from-[#e30f28]/10 to-[#e30f28]/5 dark:from-red-900/20 dark:to-red-900/10 border-2 border-[#e30f28]/30 dark:border-red-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-[#e30f28] dark:text-red-400" />
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {[selectedStatus !== 'all', selectedType !== 'all', selectedCourse !== 'all'].filter(Boolean).length} filtro(s) activo(s)
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedStatus('all')
                                            setSelectedType('all')
                                            setSelectedCourse('all')
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#e30f28] text-white rounded-lg font-semibold hover:bg-[#c20d23] transition-all shadow-md hover:shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                        Limpiar Filtros
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Activities Container */}
            <div id="activities-container">
                {filteredActivities.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-12 text-center">
                        <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">No se encontraron actividades</h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            {searchTerm || selectedStatus !== 'all' || selectedType !== 'all' || selectedCourse !== 'all'
                                ? 'Intenta ajustar los filtros de búsqueda'
                                : '¡Genial! No tienes actividades pendientes'}
                        </p>
                    </div>
                ) : (
                    <div className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
                            : 'space-y-4'
                    }>
                        {filteredActivities.map((activity, index) => {
                            const config = ACTIVITY_CONFIG[activity.activity_type as keyof typeof ACTIVITY_CONFIG]
                            const statusConfig = STATUS_CONFIG[activity.status]
                            const ActivityIcon = config?.icon || FileText
                            const StatusIcon = statusConfig.icon
                            const daysUntil = getDaysUntilDue(activity.due_date)
                            const urgencyColor = getUrgencyColor(daysUntil, activity.status)

                            return (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setSelectedActivity(activity)}
                                    className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 ${urgencyColor} cursor-pointer transition-all hover:shadow-lg ${viewMode === 'list' ? 'p-4' : 'p-6'
                                        }`}
                                >
                                    {viewMode === 'grid' ? (
                                        // Grid View
                                        <div className="space-y-4">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className={`p-3 rounded-lg ${config?.bgColor}`}>
                                                    <ActivityIcon className={`w-6 h-6 ${config?.textColor}`} />
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <div>
                                                <h3 className="font-semibold text-slate-800 dark:text-white mb-1 line-clamp-2">
                                                    {activity.title}
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                                    {activity.description}
                                                </p>
                                            </div>

                                            {/* Course */}
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${activity.course.color}`} />
                                                <span className="text-sm text-slate-600 dark:text-slate-400">{activity.course.nombre}</span>
                                            </div>

                                            {/* Progress Bar */}
                                            {activity.progress > 0 && (
                                                <div>
                                                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                                                        <span>Progreso</span>
                                                        <span>{activity.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                                                            style={{ width: `${activity.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                                                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        {activity.status === 'overdue'
                                                            ? 'Vencida'
                                                            : activity.status === 'completed'
                                                                ? 'Completada'
                                                                : !activity.due_date
                                                                    ? 'Sin límite'
                                                                    : daysUntil === 0
                                                                        ? 'Hoy'
                                                                        : daysUntil === 1
                                                                            ? 'Mañana'
                                                                            : `${daysUntil} días`
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    <span>{activity.points}/{activity.total_points}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // List View
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${config?.bgColor} flex-shrink-0`}>
                                                <ActivityIcon className={`w-6 h-6 ${config?.textColor}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className="font-semibold text-slate-800 dark:text-white truncate">
                                                        {activity.title}
                                                    </h3>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusConfig.color}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">
                                                    {activity.description}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                    <div className="flex items-center gap-1">
                                                        <div className={`w-2 h-2 rounded-full ${activity.course.color}`} />
                                                        <span>{activity.course.nombre}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>
                                                            {activity.status === 'overdue'
                                                                ? 'Vencida'
                                                                : !activity.due_date
                                                                    ? 'Sin límite'
                                                                    : daysUntil === 0
                                                                        ? 'Hoy'
                                                                        : daysUntil === 1
                                                                            ? 'Mañana'
                                                                            : `${daysUntil} días`
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                        <span className="font-medium">{activity.points}/{activity.total_points} pts</span>
                                                    </div>
                                                    {activity.progress > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-blue-500 h-1.5 rounded-full"
                                                                    style={{ width: `${activity.progress}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs">{activity.progress}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Modal de Detalles */}
            <AnimatePresence>
                {selectedActivity && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedActivity(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`p-4 rounded-xl ${ACTIVITY_CONFIG[selectedActivity.activity_type as keyof typeof ACTIVITY_CONFIG]?.bgColor}`}>
                                        {React.createElement(
                                            ACTIVITY_CONFIG[selectedActivity.activity_type as keyof typeof ACTIVITY_CONFIG]?.icon || FileText,
                                            { className: `w-8 h-8 ${ACTIVITY_CONFIG[selectedActivity.activity_type as keyof typeof ACTIVITY_CONFIG]?.textColor}` }
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-[#00246a] dark:text-white mb-2">
                                            {selectedActivity.title}
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[selectedActivity.status].color}`}>
                                                {STATUS_CONFIG[selectedActivity.status].label}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${ACTIVITY_CONFIG[selectedActivity.activity_type as keyof typeof ACTIVITY_CONFIG]?.bgColor} ${ACTIVITY_CONFIG[selectedActivity.activity_type as keyof typeof ACTIVITY_CONFIG]?.textColor}`}>
                                                {ACTIVITY_CONFIG[selectedActivity.activity_type as keyof typeof ACTIVITY_CONFIG]?.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedActivity(null)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Descripción</h3>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedActivity.description}</p>
                                </div>

                                {/* Course Info */}
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full ${selectedActivity.course.color}`} />
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white">{selectedActivity.course.nombre}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Nivel {selectedActivity.course.nivel}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                                            <Calendar className="w-5 h-5" />
                                            <span className="font-medium">Fecha de Entrega</span>
                                        </div>
                                        <p className="text-slate-800 dark:text-slate-200 font-semibold">
                                            {selectedActivity.due_date 
                                                ? new Date(selectedActivity.due_date).toLocaleDateString('es-ES', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : 'Sin fecha límite'
                                            }
                                        </p>
                                    </div>

                                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                                            <Award className="w-5 h-5" />
                                            <span className="font-medium">Puntuación</span>
                                        </div>
                                        <p className="text-slate-800 dark:text-slate-200 font-semibold">
                                            {selectedActivity.points} / {selectedActivity.total_points} puntos
                                        </p>
                                    </div>
                                </div>

                                {/* Progress */}
                                {selectedActivity.progress > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-slate-800 dark:text-slate-200">Progreso</span>
                                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedActivity.progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                                                style={{ width: `${selectedActivity.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    {selectedActivity.status !== 'completed' && (
                                        <>
                                            <button 
                                                onClick={() => window.location.href = `/Students/courses/${selectedActivity.course.id}`}
                                                className="flex-1 bg-[#e30f28] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#e30f28]/90 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Upload className="w-5 h-5" />
                                                Ir al Curso
                                            </button>
                                            <button 
                                                onClick={() => window.location.href = `/Students/courses/${selectedActivity.course.id}`}
                                                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Eye className="w-5 h-5" />
                                                Ver Detalles
                                            </button>
                                        </>
                                    )}
                                    {selectedActivity.status === 'completed' && (
                                        <>
                                            <button 
                                                onClick={() => window.location.href = `/Students/courses/${selectedActivity.course.id}`}
                                                className="flex-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-6 py-3 rounded-xl font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                Ver en Curso
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
