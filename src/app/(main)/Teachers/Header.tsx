"use client"

import { Menu, Settings } from "lucide-react"
import { Session } from "next-auth"

interface HeaderProps {
    activeSection: string
    setSidebarOpen: (open: boolean) => void
    user: Session
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
    return (
      <div></div>
    )
}
