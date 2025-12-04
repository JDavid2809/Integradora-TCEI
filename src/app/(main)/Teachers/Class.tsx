"use client"

import { motion } from "framer-motion"
import { Clock, Users } from "lucide-react"

export default function ClassesContent() {
    const classes = [
        {
            title: "Conversación de Negocios",
            instructor: "Sarah Johnson",
            time: "Hoy, 3:00 PM",
            duration: "60 min",
            students: 8,
            status: "upcoming",
        },
        {
            title: "Pronunciación Avanzada",
            instructor: "Michael Brown",
            time: "Mañana, 10:00 AM",
            duration: "45 min",
            students: 12,
            status: "upcoming",
        },
        {
            title: "Grammar Workshop",
            instructor: "Emma Wilson",
            time: "Ayer, 2:00 PM",
            duration: "90 min",
            students: 15,
            status: "completed",
        },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="space-y-4">
                {classes.map((classItem, index) => (
                    <motion.div
                        key={classItem.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-lg font-semibold text-[#00246a] dark:text-blue-400">{classItem.title}</h3>
                                    <span
                                        className={`text-xs font-medium px-2 py-1 rounded-full ${classItem.status === "upcoming" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300"
                                            }`}
                                    >
                                        {classItem.status === "upcoming" ? "Próxima" : "Completada"}
                                    </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mb-1">Instructor: {classItem.instructor}</p>
                                <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{classItem.time}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <Users className="w-4 h-4" />
                                        <span>{classItem.students} estudiantes</span>
                                    </span>
                                    <span>{classItem.duration}</span>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                {classItem.status === "upcoming" ? (
                                    <button className="bg-[#e30f28] hover:bg-[#e30f28]/90 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200">
                                        Unirse
                                    </button>
                                ) : (
                                    <button className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-[#00246a] dark:text-blue-300 px-6 py-2 rounded-xl font-medium transition-colors duration-200">
                                        Ver Grabación
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
