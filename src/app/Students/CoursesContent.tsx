"use client"

import { motion } from "framer-motion"
import { BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CoursesContent() {
    const router = useRouter()

    const handleExploreCourses = () => {
        router.push("/Courses")
    }

    const courses = [
        {
            title: "Business English",
            progress: 75,
            lessons: 12,
            completed: 9,
            level: "Intermedio",
            image: "/placeholder.svg?height=200&width=300&text=Business+English",
        },
        {
            title: "Conversación Avanzada",
            progress: 45,
            lessons: 16,
            completed: 7,
            level: "Avanzado",
            image: "/placeholder.svg?height=200&width=300&text=Conversación+Avanzada",
        },
        {
            title: "Grammar Fundamentals",
            progress: 100,
            lessons: 8,
            completed: 8,
            level: "Básico",
            image: "/placeholder.svg?height=200&width=300&text=Grammar+Fundamentals",
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-2xl font-bold text-[#00246a]"></div>
                <button className="bg-[#e30f28] hover:bg-[#e30f28]/90 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
                onClick={handleExploreCourses}>
                    Explorar Cursos
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                    <motion.div
                        key={course.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-slate-400" />
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-[#e30f28] bg-[#e30f28]/10 px-2 py-1 rounded-full">
                                    {course.level}
                                </span>
                                <span className="text-sm text-slate-500">
                                    {course.completed}/{course.lessons} lecciones
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-[#00246a] mb-3">{course.title}</h3>
                            <div className="mb-4">
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-slate-600">Progreso</span>
                                    <span className="font-medium text-[#00246a]">{course.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className="bg-[#e30f28] h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                            <button className="w-full bg-slate-100 hover:bg-slate-200 text-[#00246a] font-medium py-3 rounded-xl transition-colors duration-200">
                                {course.progress === 100 ? "Revisar Curso" : "Continuar"}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
