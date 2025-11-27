"use client"

import { useEffect, useCallback, useState } from "react"
import { BookOpen, Home, GraduationCap, Calendar, X, CheckSquare, SquareActivity, CalendarDays, Sparkles } from "lucide-react"
import Image from "next/image"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

interface SidebarProps {
    activeSection: string
    setActiveSection: (section: string) => void
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    onLogout?: () => void
}

export default function Sidebar({
    activeSection,
    setActiveSection,
    sidebarOpen,
    setSidebarOpen,
    onLogout,
}: SidebarProps) {
    const [isDesktop, setIsDesktop] = useState(true)

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024)
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const menuItems = [
        { id: "dashboard", label: "Inicio", icon: Home },
        { id: "courses", label: "Gestión de Cursos", icon: BookOpen },
        { id: "students", label: "Mis Estudiantes", icon: GraduationCap },
        { id: "schedule", label: "Mi Horario", icon: CalendarDays },
        { id: "ia", label: "Asistente IA", icon: Sparkles },
        { id: "attendance", label: "Asistencia", icon: CheckSquare },
        { id: "exams", label: "Exámenes", icon: Calendar },
        { id: "activity", label: "Actividades", icon: SquareActivity }
    ]

    const startSidebarTour = useCallback(() => {
        const steps = [
            {
                element: "#teacher-navigation",
                popover: {
                    title: "Panel de Navegación del Profesor",
                    description:
                        "Bienvenido a tu panel de profesor. Aquí encontrarás todas las herramientas para gestionar tus cursos, estudiantes y actividades académicas.",
                    position: "right",
                },
            },
            {
                element: "#menu-dashboard",
                popover: {
                    title: "Panel de Inicio",
                    description: "Accede a tu dashboard principal con una vista general de tus cursos, estadísticas y actividad reciente.",
                    position: "right",
                },
            },
            {
                element: "#menu-courses",
                popover: {
                    title: "Gestión de Cursos",
                    description: "Administra todos tus cursos: crea contenido, organiza lecciones y gestiona materiales educativos.",
                    position: "right",
                },
            },
            {
                element: "#menu-students",
                popover: {
                    title: "Mis Estudiantes",
                    description: "Visualiza y gestiona la información de tus estudiantes, revisa su progreso y desempeño académico.",
                    position: "right",
                },
            },
            {
                element: "#menu-schedule",
                popover: {
                    title: "Mi Horario",
                    description: "Consulta tu horario de clases, planifica sesiones y gestiona tu calendario académico.",
                    position: "right",
                },
            },
            {
                element: "#menu-ia",
                popover: {
                    title: "Asistente IA",
                    description: "Genera presentaciones profesionales automáticamente con inteligencia artificial. Solo describe lo que necesitas y la IA creará slides completos con diseño profesional.",
                    position: "right",
                },
            },
            {
                element: "#menu-attendance",
                popover: {
                    title: "Asistencia",
                    description: "Registra y controla la asistencia de tus estudiantes en cada sesión de clase.",
                    position: "right",
                },
            },
            {
                element: "#menu-exams",
                popover: {
                    title: "Exámenes",
                    description: "Crea, programa y califica exámenes. Gestiona las evaluaciones de tus estudiantes.",
                    position: "right",
                },
            },
            {
                element: "#menu-activity",
                popover: {
                    title: "Actividades",
                    description: "Crea y gestiona actividades, tareas y proyectos para tus estudiantes. Revisa entregas y asigna calificaciones.",
                    position: "right",
                },
            },
        ]

        const driverObj = driver({
            showProgress: true,
            allowClose: true,
            popoverClass: "driverjs-theme",
            steps,
        })

        driverObj.drive()
    }, [])

    useEffect(() => {
        const hasSeenTeacherTour = localStorage.getItem("hasSeenTeacherSidebarTour")
        if (hasSeenTeacherTour || !isDesktop) return

        const timeout = setTimeout(() => {
            startSidebarTour()
            localStorage.setItem("hasSeenTeacherSidebarTour", "true")
        }, 600)

        return () => clearTimeout(timeout)
    }, [startSidebarTour, isDesktop])

    if (!isDesktop) return null

    return (
        <div
            className={`fixed top-[76px] bottom-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:top-0 lg:h-screen ${sidebarOpen ? "translate-x-0 z-[45]" : "-translate-x-full z-[-1]"
                } lg:z-auto overflow-y-auto`}
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12">
                            <Image
                                src="/logos/logoIngles.jpg"
                                alt="Triunfando con el Inglés Logo"
                                fill
                                className="object-contain rounded-lg"
                                priority
                            />
                        </div>
                        <h1 className="text-lg font-bold text-[#00246a]">EnglishPro</h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 mt-6 px-3 overflow-y-auto" id="teacher-navigation">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            id={`menu-${item.id}`}
                            onClick={() => {
                                setActiveSection(item.id)
                                setSidebarOpen(false)
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-all duration-200 mb-1 ${activeSection === item.id
                                ? "bg-blue-600/10 text-blue-600 border-r-2 border-blue-600"
                                : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    )
}
