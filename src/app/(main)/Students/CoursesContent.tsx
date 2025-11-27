"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Clock, Award, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { CursoFromDB } from "@/types/courses";

interface ActivityProgress {
    total: number;
    passed: number;
    percentage: number;
}

interface CursoWithProgress extends CursoFromDB {
    activityProgress?: ActivityProgress;
}

interface CoursesContentProps {
    studentCourses?: CursoWithProgress[];
    allCourses?: CursoFromDB[];
}

export default function CoursesContent({ studentCourses = [], allCourses = [] }: CoursesContentProps) {
    const router = useRouter();

    // --- Lógica original intacta ---
    const handleExploreCourses = () => {
        router.push("/Courses");
    };

    const courses = studentCourses.map((curso) => ({
        id: curso.id_curso,
        title: curso.nombre,
        // Usar el progreso real de actividades
        progress: curso.activityProgress?.percentage || 0,
        totalActivities: curso.activityProgress?.total || 0,
        passedActivities: curso.activityProgress?.passed || 0,
        level: curso.imparte[0]?.nivel?.nombre || "A1",
        instructor: curso.imparte[0]
            ? `${curso.imparte[0].profesor.usuario.nombre} ${curso.imparte[0].profesor.usuario.apellido}`
            : "Sin instructor",
        students: curso._count?.inscripciones || 0,
        modalidad: curso.modalidad,
        inicio: curso.inicio ? new Date(curso.inicio).toLocaleDateString("es-ES") : "Por definir",
        fin: curso.fin ? new Date(curso.fin).toLocaleDateString("es-ES") : "Por definir",
    }));

    const getLevelColor = (level: string) => {
        const colors = {
            A1: "bg-green-100 text-green-800",
            A2: "bg-blue-100 text-blue-800",
            B1: "bg-yellow-100 text-yellow-800",
            B2: "bg-orange-100 text-orange-800",
            C1: "bg-purple-100 text-purple-800",
            C2: "bg-red-100 text-red-800",
        };
        return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
    };

    // Implementación Driver.js (tour interactivo)
    const startCoursesTour = useCallback(() => {
        const steps = [
            {
                element: "#courses-header",
                popover: {
                    title: "Mis Cursos",
                    description:
                        "Aquí puedes ver todos los cursos en los que estás inscrito. Desde aquí puedes revisar tu progreso, nivel, y fechas importantes.",
                    position: "bottom",
                },
            },
            {
                element: "#explore-courses-btn",
                popover: {
                    title: "Explorar cursos",
                    description:
                        "Haz clic aquí para ver el catálogo completo de cursos disponibles y unirte a nuevos programas.",
                    position: "left",
                },
            },
            {
                element: "#courses-grid",
                popover: {
                    title: "Tarjetas de cursos",
                    description:
                        "Cada tarjeta muestra información clave del curso: instructor, modalidad, fechas, nivel y progreso.",
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

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("hasSeenCoursesTour");
        if (hasSeenTour) return;

        const timeout = setTimeout(() => {
            startCoursesTour();
            localStorage.setItem("hasSeenCoursesTour", "true");
        }, 800);

        return () => clearTimeout(timeout);
    }, [startCoursesTour]);

    // 🎨 --- Renderizado original sin cambios ---
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div
                id="courses-header"
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="text-2xl font-bold text-[#00246a]">
                    Mis Cursos {courses.length > 0 && `(${courses.length})`}
                </div>
                <button
                    id="explore-courses-btn"
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
                <div id="courses-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                    <span
                                        className={`text-xs font-medium px-2 py-1 rounded-full ${getLevelColor(
                                            course.level
                                        )}`}
                                    >
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
                                        <span className="text-slate-600">
                                            Progreso {course.totalActivities > 0 && `(${course.passedActivities}/${course.totalActivities})`}
                                        </span>
                                        <span className="font-medium text-[#00246a]">{course.progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                course.progress >= 100 
                                                    ? 'bg-green-500' 
                                                    : course.progress >= 50 
                                                        ? 'bg-blue-500' 
                                                        : course.progress > 0 
                                                            ? 'bg-yellow-500' 
                                                            : 'bg-slate-300'
                                            }`}
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push(`/Students/courses/${course.id}`)}
                                    className="w-full bg-[#00246a] hover:bg-[#001a4d] text-white font-medium py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    <span>Ingresar</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
