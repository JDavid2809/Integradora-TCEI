"use client";

import { useEffect, useCallback, useState } from "react";
import { BookOpen, Home, GraduationCap, Calendar, X, CheckSquare, BrainCircuit } from "lucide-react";
import Image from "next/image";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface SidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    onLogout: () => void;
}

export default function Sidebar({
    activeSection,
    setActiveSection,
    sidebarOpen,
    setSidebarOpen,
    onLogout,
}: SidebarProps) {
    const [isDesktop, setIsDesktop] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const menuItems = [
        { id: "dashboard", label: "Inicio", icon: Home },
        { id: "courses", label: "Mis Cursos", icon: BookOpen },
        { id: "activities", label: "Mis Actividades", icon: CheckSquare },
        { id: "exams", label: "Mis Exámenes", icon: GraduationCap },
        { id: "assistant", label: "Asistente virtual", icon: BrainCircuit },
        { id: "schedule", label: "Mi Horario", icon: Calendar },
        
    ];

    const startSidebarTour = useCallback(() => {
        const steps = [
            {
                element: "#navegacion",
                popover: {
                    title: "Tu barra de navegación",
                    description:
                        "Aquí se encuentran las secciones principales. Usa esta barra para acceder fácilmente a tu panel, cursos, horario, pagos y exámenes.",
                    position: "right",
                },
            },
            {
                element: "#menu-dashboard",
                popover: {
                    title: "Inicio",
                    description: "Aquí puedes acceder a tu panel principal.",
                    position: "right",
                },
            },
            {
                element: "#menu-courses",
                popover: {
                    title: "Mis Cursos",
                    description: "Accede a los cursos en los que estás inscrito.",
                    position: "right",
                },
            },
            {
                element: "#menu-assistant",
                popover: {
                    title: "Tu asistente virtual",
                    description: "El es tu asistente virtual la cual te ayudara a mejorar tu aprendizaje.",
                    position: "right",
                },
            },
            {
                element: "#menu-exams",
                popover: {
                    title: "Mis Exámenes",
                    description: "Consulta tus evaluaciones y resultados.",
                    position: "right",
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
        const hasSeenTour = localStorage.getItem("hasSeenSidebarTour");
        if (hasSeenTour || !isDesktop) return; 

        const timeout = setTimeout(() => {
            startSidebarTour();
            localStorage.setItem("hasSeenSidebarTour", "true");
        }, 600);

        return () => clearTimeout(timeout);
    }, [startSidebarTour, isDesktop]);

    if (!isDesktop) return null;

    return (
        <div
            className={`fixed top-[76px] bottom-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out 
            lg:translate-x-0 lg:static lg:top-0 lg:h-screen 
            ${sidebarOpen ? "translate-x-0 z-[45]" : "-translate-x-full z-[-1]"} 
            lg:z-auto overflow-y-auto`}
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
                <nav className="flex-1 mt-6 px-3 overflow-y-auto" id="navegacion">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            id={`menu-${item.id}`}
                            onClick={() => {
                                setActiveSection(item.id);
                                setSidebarOpen(false);
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
            </div>
        </div>
    );
}
