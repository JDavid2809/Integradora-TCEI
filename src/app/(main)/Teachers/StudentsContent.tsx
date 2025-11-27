"use client"

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, Mail, Phone, User, BookOpen } from 'lucide-react'
import { TeacherCourseStudent } from '@/types/api'
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export default function StudentsContent() {
    const [students, setStudents] = useState<TeacherCourseStudent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const startStudentsTour = useCallback(() => {
        const steps = [
            {
                element: "#students-header",
                popover: {
                    title: "Gestión de Estudiantes",
                    description: "Bienvenido a la sección de estudiantes. Aquí puedes ver todos los alumnos inscritos en tus cursos, su información de contacto y su desempeño académico.",
                    position: "bottom",
                },
            },
            {
                element: "#students-count",
                popover: {
                    title: "Contador de Estudiantes",
                    description: "Este indicador muestra el número total de estudiantes que tienes asignados en todos tus cursos.",
                    position: "bottom",
                },
            },
            {
                element: "#students-grid",
                popover: {
                    title: "Tarjetas de Estudiantes",
                    description: "Cada tarjeta muestra información completa del estudiante: datos personales, curso inscrito, nivel, y estadísticas de rendimiento como asistencia y promedio.",
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
        const hasSeenStudentsTour = localStorage.getItem("hasSeenTeacherStudentsTour");
        // Solo ejecutar si hay estudiantes cargados y no hay error
        if (hasSeenStudentsTour || loading || error || students.length === 0) return;

        const timeout = setTimeout(() => {
            startStudentsTour();
            localStorage.setItem("hasSeenTeacherStudentsTour", "true");
        }, 1000);

        return () => clearTimeout(timeout);
    }, [startStudentsTour, loading, error, students.length]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('/api/teacher/students')
                if (!response.ok) {
                    throw new Error('Error al cargar estudiantes')
                }
                const data = await response.json()
                setStudents(data.data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido')
            } finally {
                setLoading(false)
            }
        }

        fetchStudents()
    }, [])

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-48 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Error: {error}</p>
                </div>
            </div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6"
        >
            <div id="students-header" className="flex items-center mb-6">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-slate-800">Mis Estudiantes</h2>
                <span id="students-count" className="ml-4 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {students.length} estudiantes
                </span>
            </div>

            {students.length === 0 ? (
                <div className="text-center py-12">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No tienes estudiantes asignados</p>
                </div>
            ) : (
                <div id="students-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((student) => (
                        <motion.div
                            key={student.id_estudiante}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">
                                        {student.nombre} {student.paterno} {student.materno}
                                    </h3>
                                    <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                                        student.activo 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {student.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-slate-600">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {student.email}
                                </div>
                                
                                {student.telefono && (
                                    <div className="flex items-center text-slate-600">
                                        <Phone className="w-4 h-4 mr-2" />
                                        {student.telefono}
                                    </div>
                                )}

                                <div className="flex items-center text-slate-600">
                                    <User className="w-4 h-4 mr-2" />
                                    Edad: {student.edad} años
                                </div>

                                {student.categoria_edad && (
                                    <div className="flex items-center text-slate-600">
                                        <span className="w-4 h-4 mr-2"></span>
                                        Categoría: {student.categoria_edad}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center text-sm text-slate-600">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    <div>
                                        <p className="font-medium">{student.curso.nombre}</p>
                                        <p className="text-xs text-slate-500">
                                            {student.curso.modalidad} • Nivel {student.nivel}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {student.descripcion && (
                                <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-slate-600">
                                    {student.descripcion}
                                </div>
                            )}

                            {student.estadisticas && (
                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-blue-50 p-2 rounded">
                                        <div className="font-medium text-blue-800">Asistencia</div>
                                        <div className="text-blue-600">
                                            {student.estadisticas.asistencia.porcentaje}%
                                        </div>
                                    </div>
                                    <div className="bg-green-50 p-2 rounded">
                                        <div className="font-medium text-green-800">Promedio</div>
                                        <div className="text-green-600">
                                            {student.estadisticas.calificaciones.promedio}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    )
}
