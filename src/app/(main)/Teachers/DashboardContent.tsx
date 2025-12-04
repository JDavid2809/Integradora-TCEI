"use client"

import { motion } from "framer-motion"
import { BookOpen, GraduationCap, Clock, Award, Play, Calendar, TrendingUp, ChevronRight } from "lucide-react"

export default function DashboardContent() {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
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
                    { title: "Cursos Activos", value: "3", icon: BookOpen, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
                    { title: "Clases Completadas", value: "24", icon: GraduationCap, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
                    { title: "Horas de Estudio", value: "48", icon: Clock, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
                    { title: "Certificados", value: "2", icon: Award, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
                ].map((stat) => (
                    <motion.div
                        key={stat.title}
                        variants={itemVariants}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</p>
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
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">Actividad Reciente</h3>
                    <div className="space-y-4">
                        {[
                            { action: "Completaste la lección", course: "Business English", time: "Hace 2 horas" },
                            { action: "Nueva clase programada", course: "Conversación Avanzada", time: "Hace 1 día" },
                            { action: "Certificado obtenido", course: "Grammar Fundamentals", time: "Hace 3 días" },
                        ].map((activity, index) => (
                            <div
                                key={index}
                                className="flex items-start space-x-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                            >
                                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{activity.action}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{activity.course}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">Acciones Rápidas</h3>
                    <div className="space-y-3">
                        {[
                            { title: "Continuar Curso", subtitle: "Business English - Lección 5", icon: Play, color: "bg-blue-500" },
                            { title: "Próxima Clase", subtitle: "Hoy a las 3:00 PM", icon: Calendar, color: "bg-blue-600" },
                            { title: "Ver Progreso", subtitle: "Revisa tu avance semanal", icon: TrendingUp, color: "bg-blue-700" },
                        ].map((action, index) => (
                            <button
                                key={index}
                                className="w-full flex items-center space-x-4 p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 text-left group"
                            >
                                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                                    <action.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-blue-600 dark:text-blue-400">{action.title}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{action.subtitle}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
