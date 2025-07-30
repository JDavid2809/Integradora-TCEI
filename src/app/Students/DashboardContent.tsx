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
                    { title: "Cursos Activos", value: "3", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
                    { title: "Clases Completadas", value: "24", icon: GraduationCap, color: "text-green-600", bg: "bg-green-50" },
                    { title: "Horas de Estudio", value: "48", icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
                    { title: "Certificados", value: "2", icon: Award, color: "text-yellow-600", bg: "bg-yellow-50" },
                ].map((stat) => (
                    <motion.div
                        key={stat.title}
                        variants={itemVariants}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold text-[#00246a]">{stat.value}</p>
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
                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-[#00246a] mb-4">Actividad Reciente</h3>
                    <div className="space-y-4">
                        {[
                            { action: "Completaste la lección", course: "Business English", time: "Hace 2 horas" },
                            { action: "Nueva clase programada", course: "Conversación Avanzada", time: "Hace 1 día" },
                            { action: "Certificado obtenido", course: "Grammar Fundamentals", time: "Hace 3 días" },
                        ].map((activity, index) => (
                            <div
                                key={index}
                                className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors duration-200"
                            >
                                <div className="w-2 h-2 bg-[#e30f28] rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-[#00246a]">{activity.action}</p>
                                    <p className="text-sm text-slate-600">{activity.course}</p>
                                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-[#00246a] mb-4">Acciones Rápidas</h3>
                    <div className="space-y-3">
                        {[
                            { title: "Continuar Curso", subtitle: "Business English - Lección 5", icon: Play, color: "bg-[#e30f28]" },
                            { title: "Próxima Clase", subtitle: "Hoy a las 3:00 PM", icon: Calendar, color: "bg-[#00246a]" },
                            { title: "Ver Progreso", subtitle: "Revisa tu avance semanal", icon: TrendingUp, color: "bg-green-500" },
                        ].map((action, index) => (
                            <button
                                key={index}
                                className="w-full flex items-center space-x-4 p-4 hover:bg-slate-50 rounded-xl transition-all duration-200 text-left group"
                            >
                                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                                    <action.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-[#00246a]">{action.title}</p>
                                    <p className="text-sm text-slate-600">{action.subtitle}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors duration-200" />
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
