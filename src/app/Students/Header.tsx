"use client"

import { Menu, Settings } from "lucide-react"
import { Session } from "next-auth"

interface HeaderProps {
    activeSection: string
    setSidebarOpen: (open: boolean) => void
    user?: Session
}

const sectionTitles: Record<string, string> = {
    dashboard: "Dashboard",
    courses: "Mis Cursos",
    classes: "Mis Clases",
    tasks: "Tareas",
    schedule: "Mi Horario",
    progress: "Mi Progreso",
    settings: "Configuración",
}

export default function Header({ activeSection, setSidebarOpen, user }: HeaderProps) {
    const userName = user?.user?.name || "Estudiante"
    const userLastName = user?.user?.apellido || ""
    const userInitials = `${userName.charAt(0)}${userLastName.charAt(0)}`.toUpperCase()
    
    return (
        <header className="bg-white shadow-sm border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-6 mt-2 lg:mt-0">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                >
                    <Menu className="w-5 h-5 text-slate-600" />
                </button>
                <h2 className="text-lg lg:text-xl font-semibold text-[#00246a]">
                    {sectionTitles[activeSection] || "Dashboard"}
                </h2>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4">
                {/* Settings button for mobile */}
                <button className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200">
                    <Settings className="w-5 h-5 text-slate-600" />
                </button>

                {/* User info - hidden on small screens, visible on larger */}
                <div className="hidden sm:flex items-center space-x-3">
                    <div className="text-right">
                        <p className="text-sm font-medium text-[#00246a]">{userName} {userLastName}</p>
                        <p className="text-xs text-slate-500">Estudiante</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#e30f28] to-[#00246a] rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">{userInitials}</span>
                    </div>
                </div>

                {/* User avatar only for mobile */}
                <div className="sm:hidden w-8 h-8 bg-gradient-to-br from-[#e30f28] to-[#00246a] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xs">JP</span>
                </div>
            </div>
        </header>
    )
}
