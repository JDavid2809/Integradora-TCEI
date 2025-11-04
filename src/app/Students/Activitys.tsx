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
    Zap
} from 'lucide-react'

// Tipos
interface Activity {
    id: number
    title: string
    description: string
    due_date: string
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

// Datos de ejemplo (luego se reemplazará con llamada a API)
const mockActivities: Activity[] = [
    {
        id: 1,
        title: "Essay: My Daily Routine",
        description: "Write a 300-word essay describing your daily routine using present simple tense.",
        due_date: "2025-11-05T23:59:00",
        activity_type: "ASSIGNMENT",
        status: "pending",
        course: { id: 1, nombre: "English Basic A1", nivel: "A1", color: "bg-blue-500" },
        points: 0,
        total_points: 100,
        progress: 0
    },
    {
        id: 2,
        title: "Grammar Quiz: Present Perfect",
        description: "Complete the quiz about present perfect tense. 20 questions, 60 minutes.",
        due_date: "2025-11-04T18:00:00",
        activity_type: "QUIZ",
        status: "pending",
        course: { id: 2, nombre: "English Intermediate B1", nivel: "B1", color: "bg-green-500" },
        points: 0,
        total_points: 50,
        progress: 0
    },
    {
        id: 3,
        title: "Watch: TED Talk - Climate Change",
        description: "Watch the assigned TED Talk and take notes on key vocabulary and main ideas.",
        due_date: "2025-11-06T23:59:00",
        activity_type: "VIDEO",
        status: "in_progress",
        course: { id: 2, nombre: "English Intermediate B1", nivel: "B1", color: "bg-green-500" },
        points: 30,
        total_points: 40,
        progress: 75
    },
    {
        id: 4,
        title: "Reading: Short Story Analysis",
        description: "Read 'The Gift of the Magi' and answer comprehension questions.",
        due_date: "2025-11-08T23:59:00",
        activity_type: "READING",
        status: "pending",
        course: { id: 3, nombre: "English Advanced C1", nivel: "C1", color: "bg-purple-500" },
        points: 0,
        total_points: 80,
        progress: 0
    },
    {
        id: 5,
        title: "Final Project: Business Presentation",
        description: "Prepare a 10-minute presentation about a business topic of your choice.",
        due_date: "2025-11-15T23:59:00",
        activity_type: "PROJECT",
        status: "in_progress",
        course: { id: 3, nombre: "English Advanced C1", nivel: "C1", color: "bg-purple-500" },
        points: 45,
        total_points: 150,
        progress: 30
    },
    {
        id: 6,
        title: "Vocabulary Practice: Business Terms",
        description: "Complete the flashcard set and practice exercises on business vocabulary.",
        due_date: "2025-11-03T23:59:00",
        activity_type: "PRACTICE",
        status: "overdue",
        course: { id: 1, nombre: "English Basic A1", nivel: "A1", color: "bg-blue-500" },
        points: 0,
        total_points: 30,
        progress: 0
    },
    {
        id: 7,
        title: "Speaking Practice: Job Interview",
        description: "Record yourself answering common job interview questions.",
        due_date: "2025-11-10T23:59:00",
        activity_type: "PRACTICE",
        status: "pending",
        course: { id: 2, nombre: "English Intermediate B1", nivel: "B1", color: "bg-green-500" },
        points: 0,
        total_points: 60,
        progress: 0
    },
    {
        id: 8,
        title: "Discussion Forum: Travel Experiences",
        description: "Share your travel experiences and respond to at least 2 classmates.",
        due_date: "2025-11-07T23:59:00",
        activity_type: "DISCUSSION",
        status: "completed",
        course: { id: 1, nombre: "English Basic A1", nivel: "A1", color: "bg-blue-500" },
        points: 45,
        total_points: 45,
        progress: 100
    },
]

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
    const [activities, setActivities] = useState<Activity[]>(mockActivities)
    const [filteredActivities, setFilteredActivities] = useState<Activity[]>(mockActivities)
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [selectedType, setSelectedType] = useState<string>('all')
    const [selectedCourse, setSelectedCourse] = useState<string>('all')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

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
    const getDaysUntilDue = (dueDate: string) => {
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
                    <h2 className="text-2xl md:text-3xl font-bold text-[#00246a]">Mis Actividades</h2>
                    <p className="text-slate-600 text-sm md:text-base">Gestiona todas tus tareas y proyectos en un solo lugar</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">
                        {filteredActivities.length} de {activities.length} actividades
                    </span>
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                    {/* Search */}
                    <div id="search-bar" className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar actividades..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e30f28] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Filter Button */}
                    <button
                        id="filter-button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${showFilters
                                ? 'bg-[#e30f28] text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        <Filter className="w-5 h-5" />
                        <span className="hidden md:inline">Filtros</span>
                    </button>

                    {/* View Toggle */}
                    <div id="view-toggle" className="flex bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                                }`}
                        >
                            <Grid3x3 className="w-5 h-5 text-slate-700" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                                }`}
                        >
                            <List className="w-5 h-5 text-slate-700" />
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
                            className="mt-4 pt-4 border-t border-slate-200"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Estado */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e30f28]"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="pending">Pendientes</option>
                                        <option value="in_progress">En Progreso</option>
                                        <option value="completed">Completadas</option>
                                        <option value="overdue">Vencidas</option>
                                    </select>
                                </div>

                                {/* Tipo */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e30f28]"
                                    >
                                        <option value="all">Todos</option>
                                        {Object.entries(ACTIVITY_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Curso */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Curso</label>
                                    <select
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e30f28]"
                                    >
                                        <option value="all">Todos</option>
                                        {uniqueCourses.map((course) => (
                                            <option key={course.id} value={course.id}>{course.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(selectedStatus !== 'all' || selectedType !== 'all' || selectedCourse !== 'all') && (
                                <button
                                    onClick={() => {
                                        setSelectedStatus('all')
                                        setSelectedType('all')
                                        setSelectedCourse('all')
                                    }}
                                    className="mt-3 text-sm text-[#e30f28] hover:text-[#e30f28]/80 font-medium"
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Activities Container */}
            <div id="activities-container">
                {filteredActivities.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No se encontraron actividades</h3>
                        <p className="text-slate-500">
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
                                    className={`bg-white rounded-xl shadow-sm border-2 ${urgencyColor} cursor-pointer transition-all hover:shadow-lg ${viewMode === 'list' ? 'p-4' : 'p-6'
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
                                                <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2">
                                                    {activity.title}
                                                </h3>
                                                <p className="text-sm text-slate-600 line-clamp-2">
                                                    {activity.description}
                                                </p>
                                            </div>

                                            {/* Course */}
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${activity.course.color}`} />
                                                <span className="text-sm text-slate-600">{activity.course.nombre}</span>
                                            </div>

                                            {/* Progress Bar */}
                                            {activity.progress > 0 && (
                                                <div>
                                                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                                                        <span>Progreso</span>
                                                        <span>{activity.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                                                            style={{ width: `${activity.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        {activity.status === 'overdue'
                                                            ? 'Vencida'
                                                            : activity.status === 'completed'
                                                                ? 'Completada'
                                                                : daysUntil === 0
                                                                    ? 'Hoy'
                                                                    : daysUntil === 1
                                                                        ? 'Mañana'
                                                                        : `${daysUntil} días`
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
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
                                                    <h3 className="font-semibold text-slate-800 truncate">
                                                        {activity.title}
                                                    </h3>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusConfig.color}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-2 line-clamp-1">
                                                    {activity.description}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                                    <div className="flex items-center gap-1">
                                                        <div className={`w-2 h-2 rounded-full ${activity.course.color}`} />
                                                        <span>{activity.course.nombre}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>
                                                            {activity.status === 'overdue'
                                                                ? 'Vencida'
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
                                                            <div className="w-20 bg-slate-200 rounded-full h-1.5">
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
                            className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
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
                                        <h2 className="text-2xl font-bold text-[#00246a] mb-2">
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
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <X className="w-6 h-6 text-slate-600" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-2">Descripción</h3>
                                    <p className="text-slate-600 leading-relaxed">{selectedActivity.description}</p>
                                </div>

                                {/* Course Info */}
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full ${selectedActivity.course.color}`} />
                                        <div>
                                            <p className="font-medium text-slate-800">{selectedActivity.course.nombre}</p>
                                            <p className="text-sm text-slate-600">Nivel {selectedActivity.course.nivel}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                                            <Calendar className="w-5 h-5" />
                                            <span className="font-medium">Fecha de Entrega</span>
                                        </div>
                                        <p className="text-slate-800 font-semibold">
                                            {new Date(selectedActivity.due_date).toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    <div className="bg-purple-50 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-purple-600 mb-1">
                                            <Award className="w-5 h-5" />
                                            <span className="font-medium">Puntuación</span>
                                        </div>
                                        <p className="text-slate-800 font-semibold">
                                            {selectedActivity.points} / {selectedActivity.total_points} puntos
                                        </p>
                                    </div>
                                </div>

                                {/* Progress */}
                                {selectedActivity.progress > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-slate-800">Progreso</span>
                                            <span className="text-lg font-bold text-blue-600">{selectedActivity.progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                                                style={{ width: `${selectedActivity.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                                    {selectedActivity.status !== 'completed' && (
                                        <>
                                            <button className="flex-1 bg-[#e30f28] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#e30f28]/90 transition-all flex items-center justify-center gap-2">
                                                <Upload className="w-5 h-5" />
                                                Subir Trabajo
                                            </button>
                                            <button className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                                                <Eye className="w-5 h-5" />
                                                Ver Detalles
                                            </button>
                                        </>
                                    )}
                                    {selectedActivity.status === 'completed' && (
                                        <button className="flex-1 bg-green-100 text-green-700 px-6 py-3 rounded-xl font-medium hover:bg-green-200 transition-all flex items-center justify-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            Actividad Completada
                                        </button>
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
