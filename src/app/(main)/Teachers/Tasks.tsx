"use client"

import { motion } from "framer-motion"
import { CheckSquare, Clock, AlertCircle, Calendar, BookOpen, FileText } from "lucide-react"

export default function TasksContent() {
    const tasks = [
        {
            id: 1,
            title: "Completar ejercicios de gramática",
            course: "Grammar Fundamentals",
            dueDate: "Hoy",
            priority: "high",
            status: "pending",
            type: "exercise",
            description: "Ejercicios del capítulo 5: Present Perfect vs Past Simple",
        },
        {
            id: 2,
            title: "Ensayo sobre Business Communication",
            course: "Business English",
            dueDate: "Mañana",
            priority: "high",
            status: "pending",
            type: "essay",
            description: "Escribir un ensayo de 500 palabras sobre comunicación efectiva en el trabajo",
        },
        {
            id: 3,
            title: "Práctica de pronunciación",
            course: "Conversación Avanzada",
            dueDate: "En 3 días",
            priority: "medium",
            status: "pending",
            type: "practice",
            description: "Grabar audio practicando los sonidos /θ/ y /ð/",
        },
        {
            id: 4,
            title: "Quiz de vocabulario",
            course: "Business English",
            dueDate: "Completado",
            priority: "medium",
            status: "completed",
            type: "quiz",
            description: "Quiz sobre vocabulario de finanzas y contabilidad",
        },
        {
            id: 5,
            title: "Lectura: Chapter 3",
            course: "Grammar Fundamentals",
            dueDate: "Completado",
            priority: "low",
            status: "completed",
            type: "reading",
            description: "Leer y resumir el capítulo 3 sobre tiempos verbales",
        },
    ]

    const getTaskIcon = (type: string) => {
        switch (type) {
            case "exercise":
                return BookOpen
            case "essay":
                return FileText
            case "practice":
                return Clock
            case "quiz":
                return CheckSquare
            case "reading":
                return BookOpen
            default:
                return CheckSquare
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
            case "medium":
                return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
            case "low":
                return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
            default:
                return "text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700"
        }
    }

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case "high":
                return "Alta"
            case "medium":
                return "Media"
            case "low":
                return "Baja"
            default:
                return "Normal"
        }
    }

    const pendingTasks = tasks.filter((task) => task.status === "pending")
    const completedTasks = tasks.filter((task) => task.status === "completed")

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-slate-600 dark:text-slate-300">{pendingTasks.length} pendientes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-slate-600 dark:text-slate-300">{completedTasks.length} completadas</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Tareas Pendientes</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{pendingTasks.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Completadas</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                            <CheckSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Total de Tareas</p>
                            <p className="text-2xl font-bold text-[#00246a] dark:text-blue-400">{tasks.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Pending Tasks */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#00246a] dark:text-blue-400">Tareas Pendientes</h3>
                {pendingTasks.length > 0 ? (
                    <div className="space-y-4">
                        {pendingTasks.map((task, index) => {
                            const TaskIcon = getTaskIcon(task.type)
                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <TaskIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-semibold text-[#00246a] dark:text-blue-400 mb-1">{task.title}</h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{task.course}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <span
                                                        className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}
                                                    >
                                                        {getPriorityLabel(task.priority)}
                                                    </span>
                                                    <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{task.dueDate}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{task.description}</p>
                                            <div className="flex items-center space-x-3">
                                                <button className="bg-[#e30f28] hover:bg-[#e30f28]/90 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                                                    Completar
                                                </button>
                                                <button className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                                                    Ver Detalles
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                        <CheckSquare className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-[#00246a] dark:text-blue-400 mb-2">¡Todas las tareas completadas!</h3>
                        <p className="text-slate-600 dark:text-slate-300">No tienes tareas pendientes en este momento.</p>
                    </div>
                )}
            </div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#00246a] dark:text-blue-400">Tareas Completadas</h3>
                    <div className="space-y-4">
                        {completedTasks.map((task, index) => {
                            const TaskIcon = getTaskIcon(task.type)
                            console.log(TaskIcon)
                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 opacity-75"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <CheckSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-semibold text-[#00246a] dark:text-blue-400 mb-1 line-through">{task.title}</h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{task.course}</p>
                                                </div>
                                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Completada</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{task.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            )}
        </motion.div>
    )
}
