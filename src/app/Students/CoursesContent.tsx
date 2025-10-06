"use client"

import { motion } from "framer-motion"
import { BookOpen, Users, Clock, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import { CursoFromDB } from "@/types/courses"

interface CoursesContentProps {
    studentCourses?: CursoFromDB[]
    allCourses?: CursoFromDB[]
}

export default function CoursesContent({ studentCourses = [], allCourses = [] }: CoursesContentProps) {
    const router = useRouter()

    console.log("All Courses Available:", allCourses)

    const handleExploreCourses = () => {
        router.push("/Courses")
    }

    // Convertir los cursos de la BD al formato esperado
    const courses = studentCourses.map(curso => ({
        id: curso.id_curso,
        title: curso.nombre,
        progress: 65, // Progreso estático para evitar problemas de hidratación
        lessons: 12, // Valor por defecto
        completed: 6, // Completadas estáticas para evitar problemas de hidratación
        level: curso.imparte[0]?.nivel?.nombre || 'A1',
        instructor: curso.imparte[0] ? `${curso.imparte[0].profesor.usuario.nombre} ${curso.imparte[0].profesor.usuario.apellido}` : 'Sin instructor',
        students: (curso._count)?.inscripciones || 0,
        modalidad: curso.modalidad,
        inicio: curso.inicio ? new Date(curso.inicio).toLocaleDateString('es-ES') : 'Por definir',
        fin: curso.fin ? new Date(curso.fin).toLocaleDateString('es-ES') : 'Por definir',
    }))

    const getLevelColor = (level: string) => {
        const colors = {
            A1: "bg-green-100 text-green-800",
            A2: "bg-blue-100 text-blue-800",
            B1: "bg-yellow-100 text-yellow-800",
            B2: "bg-orange-100 text-orange-800",
            C1: "bg-purple-100 text-purple-800",
            C2: "bg-red-100 text-red-800",
        }
        return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800"
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-2xl font-bold text-[#00246a]">
                    Mis Cursos {courses.length > 0 && `(${courses.length})`}
                </div>
                <button 
                    className="bg-[#e30f28] hover:bg-[#e30f28]/90 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
                    onClick={handleExploreCourses}
                >
                    Explorar Cursos
                </button>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-600 mb-2">No tienes cursos inscritos</h3>
                    <p className="text-slate-500 mb-6">Explora nuestro catálogo y comienza tu aprendizaje</p>
                    <button 
                        className="bg-[#e30f28] hover:bg-[#e30f28]/90 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200"
                        onClick={handleExploreCourses}
                    >
                        Ver Cursos Disponibles
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
                                <BookOpen className="w-16 h-16 text-blue-400" />
                                <div className="absolute top-4 right-4">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getLevelColor(course.level)}`}>
                                        {course.level}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 left-4 text-blue-600">
                                    <div className="flex items-center gap-1 text-sm font-medium">
                                        <Award className="w-4 h-4" />
                                        {course.modalidad}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-slate-500">
                                        {course.instructor}
                                    </span>
                                    <span className="text-sm text-slate-500 flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {course.students}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-[#00246a] mb-3">{course.title}</h3>
                                
                                <div className="text-sm text-slate-600 mb-4">
                                    <div className="flex items-center gap-1 mb-1">
                                        <Clock className="w-3 h-3" />
                                        <span>Inicio: {course.inicio}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>Fin: {course.fin}</span>
                                    </div>
                                </div>

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
            )}
        </motion.div>
    )
}
