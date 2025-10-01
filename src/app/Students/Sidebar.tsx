"use client"

import { BookOpen, Home, GraduationCap, Calendar, LogOut, X, CheckSquare } from "lucide-react"
import Image from "next/image"

interface SidebarProps {
    activeSection: string
    setActiveSection: (section: string) => void
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    onLogout: () => void
}

export default function Sidebar({
    activeSection,
    setActiveSection,
    sidebarOpen,
    setSidebarOpen,
    onLogout,
}: SidebarProps) {
    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: Home },
        { id: "courses", label: "Mis Cursos", icon: BookOpen },
        { id: "schedule", label: "Mi Horario", icon: Calendar },
        { id: "payments", label: "Mis Pagos", icon: CheckSquare },
        { id: "exams", label: "Mis Exámenes", icon: GraduationCap },
    ]

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
                <nav className="flex-1 mt-6 px-3 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveSection(item.id)
                                setSidebarOpen(false)
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-all duration-200 mb-1 ${activeSection === item.id
                                ? "bg-[#e30f28]/10 text-[#e30f28] border-r-2 border-[#e30f28]"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-3 flex-shrink-0">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
