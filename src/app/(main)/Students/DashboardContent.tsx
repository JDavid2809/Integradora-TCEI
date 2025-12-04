"use client"

import { motion } from "framer-motion"
import { BookOpen, GraduationCap, Clock, Award, Play, Calendar, TrendingUp, ChevronRight, CheckCircle, Upload, UserPlus, Medal, Loader2, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { 
    getStudentDashboardStats, 
    getRecentActivities, 
    getNextClasses, 
    getNextPendingActivity,
    type StudentDashboardStats,
    type RecentActivity,
    type NextClass
} from "@/actions/student/dashboardActions"
import { useRouter } from "next/navigation"

export default function DashboardContent() {
    const router = useRouter()
    const [stats, setStats] = useState<StudentDashboardStats | null>(null)
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
    const [nextClasses, setNextClasses] = useState<NextClass[]>([])
    const [pendingActivity, setPendingActivity] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const [statsData, activitiesData, classesData, pendingData] = await Promise.all([
                getStudentDashboardStats(),
                getRecentActivities(),
                getNextClasses(),
                getNextPendingActivity()
            ])

            setStats(statsData)
            setRecentActivities(activitiesData)
            setNextClasses(classesData)
            setPendingActivity(pendingData)
        } catch (err) {
            console.error('Error loading dashboard:', err)
            setError('Error al cargar los datos del dashboard')
        } finally {
            setLoading(false)
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
    }

    // Función para formatear tiempo relativo
    const getRelativeTime = (date: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Hace un momento'
        if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
        if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
        return date.toLocaleDateString('es-ES')
    }

    // Iconos para tipos de actividad
    const activityIcons = {
        submission: Upload,
        grade: CheckCircle,
        enrollment: UserPlus,
        certificate: Medal
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#00246a] dark:text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-300">Cargando tu dashboard...</p>
                </div>
            </div>
        )
    }

    if (error || !stats) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error al cargar dashboard</h3>
                <p className="text-red-600 dark:text-red-300 mb-4">{error || 'Error desconocido'}</p>
                <button
                    onClick={loadDashboardData}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
                visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="space-y-6"
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { 
                        title: "Cursos Activos", 
                        value: stats.activeCourses.toString(), 
                        icon: BookOpen, 
                        color: "text-blue-600 dark:text-blue-300", 
                        bg: "bg-blue-100 dark:bg-blue-900/30",
                        subtitle: `${stats.completedCourses} completados`
                    },
                    { 
                        title: "Actividades Completadas", 
                        value: stats.completedActivities.toString(), 
                        icon: GraduationCap, 
                        color: "text-green-600 dark:text-green-300", 
                        bg: "bg-green-100 dark:bg-green-900/30",
                        subtitle: `De ${stats.totalActivities} totales`
                    },
                    { 
                        title: "Promedio General", 
                        value: stats.averageGrade !== null ? `${stats.averageGrade}%` : "N/A", 
                        icon: TrendingUp, 
                        color: "text-purple-600 dark:text-purple-300", 
                        bg: "bg-purple-100 dark:bg-purple-900/30",
                        subtitle: "Calificaciones"
                    },
                    { 
                        title: "Certificados", 
                        value: stats.certificates.toString(), 
                        icon: Award, 
                        color: "text-yellow-600 dark:text-yellow-300", 
                        bg: "bg-yellow-100 dark:bg-yellow-900/30",
                        subtitle: "Obtenidos"
                    },
                ].map((stat) => (
                    <motion.div
                        key={stat.title}
                        variants={itemVariants}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-[#00246a] dark:text-blue-100 mb-1">{stat.value}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-500">{stat.subtitle}</p>
                            </div>
                            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-[#00246a] dark:text-blue-100 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Actividad Reciente
                    </h3>
                    <div className="space-y-3">
                        {recentActivities.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">No hay actividad reciente</p>
                            </div>
                        ) : (
                            recentActivities.map((activity) => {
                                const IconComponent = activityIcons[activity.icon]
                                return (
                                    <div
                                        key={activity.id}
                                        className="flex items-start space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                                    >
                                        <div className="mt-0.5">
                                            <IconComponent className="w-5 h-5 text-[#e30f28] dark:text-red-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#00246a] dark:text-blue-100 truncate">{activity.action}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{activity.course}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{getRelativeTime(new Date(activity.time))}</p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-[#00246a] dark:text-blue-100 mb-4 flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        Acciones Rápidas
                    </h3>
                    <div className="space-y-3">
                        {/* Actividad Pendiente */}
                        {pendingActivity && (
                            <button
                                onClick={() => router.push(`/Students/courses/${pendingActivity.courseId}`)}
                                className="w-full flex items-center space-x-4 p-4 hover:bg-gradient-to-r hover:from-[#e30f28]/10 hover:to-transparent dark:hover:from-red-900/20 rounded-xl transition-all duration-200 text-left group border-2 border-[#e30f28]/20 dark:border-red-500/20"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-[#e30f28] to-[#c20d23] rounded-lg flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[#00246a] dark:text-blue-100">Actividad Pendiente</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{pendingActivity.courseName}</p>
                                    {pendingActivity.dueDate && (
                                        <p className="text-xs text-[#e30f28] dark:text-red-400 mt-0.5">
                                            Vence: {new Date(pendingActivity.dueDate).toLocaleDateString('es-ES')}
                                        </p>
                                    )}
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-[#e30f28] dark:group-hover:text-red-400 transition-colors duration-200" />
                            </button>
                        )}

                        {/* Próximas Clases */}
                        {nextClasses.length > 0 && (
                            <>
                                {nextClasses.slice(0, 2).map((classItem, index) => (
                                    <button
                                        key={index}
                                        onClick={() => router.push(`/Students/courses/${classItem.courseId}`)}
                                        className="w-full flex items-center space-x-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 text-left group"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#00246a] to-[#003a8c] dark:from-blue-600 dark:to-blue-800 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-[#00246a] dark:text-blue-100 truncate">{classItem.courseName}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{classItem.day} - {classItem.time}</p>
                                            {classItem.classroom && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Aula: {classItem.classroom}</p>
                                            )}
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-200" />
                                    </button>
                                ))}
                            </>
                        )}

                        {/* Ver Mis Cursos */}
                        <button
                            onClick={() => router.push('/Students/courses')}
                            className="w-full flex items-center space-x-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 text-left group"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-[#00246a] dark:text-blue-100">Ver Mis Cursos</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{stats.activeCourses} curso{stats.activeCourses !== 1 ? 's' : ''} activo{stats.activeCourses !== 1 ? 's' : ''}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-200" />
                        </button>

                        {/* Mensaje si no hay acciones */}
                        {!pendingActivity && nextClasses.length === 0 && stats.activeCourses === 0 && (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">No hay acciones pendientes</p>
                                <button
                                    onClick={() => router.push('/Courses')}
                                    className="mt-3 text-sm text-[#00246a] dark:text-blue-400 font-medium hover:underline"
                                >
                                    Explorar cursos disponibles
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
                visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="space-y-6"
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { 
                        title: "Cursos Activos", 
                        value: stats.activeCourses.toString(), 
                        icon: BookOpen, 
                        color: "text-blue-600", 
                        bg: "bg-blue-100",
                        subtitle: `${stats.completedCourses} completados`
                    },
                    { 
                        title: "Actividades Completadas", 
                        value: stats.completedActivities.toString(), 
                        icon: GraduationCap, 
                        color: "text-green-600", 
                        bg: "bg-green-100",
                        subtitle: `De ${stats.totalActivities} totales`
                    },
                    { 
                        title: "Promedio General", 
                        value: stats.averageGrade !== null ? `${stats.averageGrade}%` : "N/A", 
                        icon: TrendingUp, 
                        color: "text-purple-600", 
                        bg: "bg-purple-100",
                        subtitle: "Calificaciones"
                    },
                    { 
                        title: "Certificados", 
                        value: stats.certificates.toString(), 
                        icon: Award, 
                        color: "text-yellow-600", 
                        bg: "bg-yellow-100",
                        subtitle: "Obtenidos"
                    },
                ].map((stat) => (
                    <motion.div
                        key={stat.title}
                        variants={itemVariants}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-[#00246a] dark:text-blue-100 mb-1">{stat.value}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-500">{stat.subtitle}</p>
                            </div>
                            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-[#00246a] dark:text-blue-100 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Actividad Reciente
                    </h3>
                    <div className="space-y-3">
                        {recentActivities.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">No hay actividad reciente</p>
                            </div>
                        ) : (
                            recentActivities.map((activity) => {
                                const IconComponent = activityIcons[activity.icon]
                                return (
                                    <div
                                        key={activity.id}
                                        className="flex items-start space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                                    >
                                        <div className="mt-0.5">
                                            <IconComponent className="w-5 h-5 text-[#e30f28] dark:text-red-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#00246a] dark:text-blue-100 truncate">{activity.action}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{activity.course}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{getRelativeTime(new Date(activity.time))}</p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-[#00246a] dark:text-blue-100 mb-4 flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        Acciones Rápidas
                    </h3>
                    <div className="space-y-3">
                        {/* Actividad Pendiente */}
                        {pendingActivity && (
                            <button
                                onClick={() => router.push(`/Students/courses/${pendingActivity.courseId}`)}
                                className="w-full flex items-center space-x-4 p-4 hover:bg-gradient-to-r hover:from-[#e30f28]/10 hover:to-transparent dark:hover:from-red-900/20 rounded-xl transition-all duration-200 text-left group border-2 border-[#e30f28]/20 dark:border-red-500/20"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-[#e30f28] to-[#c20d23] rounded-lg flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[#00246a] dark:text-blue-100">Actividad Pendiente</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{pendingActivity.courseName}</p>
                                    {pendingActivity.dueDate && (
                                        <p className="text-xs text-[#e30f28] dark:text-red-400 mt-0.5">
                                            Vence: {new Date(pendingActivity.dueDate).toLocaleDateString('es-ES')}
                                        </p>
                                    )}
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-[#e30f28] dark:group-hover:text-red-400 transition-colors duration-200" />
                            </button>
                        )}

                        {/* Próximas Clases */}
                        {nextClasses.length > 0 && (
                            <>
                                {nextClasses.slice(0, 2).map((classItem, index) => (
                                    <button
                                        key={index}
                                        onClick={() => router.push(`/Students/courses/${classItem.courseId}`)}
                                        className="w-full flex items-center space-x-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 text-left group"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#00246a] to-[#003a8c] dark:from-blue-600 dark:to-blue-800 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-[#00246a] dark:text-blue-100 truncate">{classItem.courseName}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{classItem.day} - {classItem.time}</p>
                                            {classItem.classroom && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Aula: {classItem.classroom}</p>
                                            )}
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-200" />
                                    </button>
                                ))}
                            </>
                        )}

                        {/* Ver Mis Cursos */}
                        <button
                            onClick={() => router.push('/Students/courses')}
                            className="w-full flex items-center space-x-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 text-left group"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-[#00246a] dark:text-blue-100">Ver Mis Cursos</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{stats.activeCourses} curso{stats.activeCourses !== 1 ? 's' : ''} activo{stats.activeCourses !== 1 ? 's' : ''}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-200" />
                        </button>

                        {/* Mensaje si no hay acciones */}
                        {!pendingActivity && nextClasses.length === 0 && stats.activeCourses === 0 && (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">No hay acciones pendientes</p>
                                <button
                                    onClick={() => router.push('/Courses')}
                                    className="mt-3 text-sm text-[#00246a] dark:text-blue-400 font-medium hover:underline"
                                >
                                    Explorar cursos disponibles
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
