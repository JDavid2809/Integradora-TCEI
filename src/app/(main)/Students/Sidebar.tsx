"use client";

import { useEffect, useCallback, useState } from "react";
import { BookOpen, Home, Calendar, X, CheckSquare, BrainCircuit, Sparkles, LogOut, Mic } from "lucide-react";
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
    const [showTourButton, setShowTourButton] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Verificar si el tour ya fue visto
    useEffect(() => {
        try {
            const hasSeenTour = localStorage.getItem("hasSeenSidebarTour");
            setShowTourButton(!hasSeenTour);
        } catch (error) {
            console.warn("localStorage no disponible:", error);
        }
    }, []);

    const menuItemsTop = [
        { id: "dashboard", label: "Inicio", icon: Home },
        { id: "courses", label: "Mis Cursos", icon: BookOpen },
        { id: "study-guide", label: "Guía de Estudio (IA)", icon: BookOpen },
    ];

    const menuItemsBottom = [
        { id: "activities", label: "Mis Actividades", icon: CheckSquare },  
        { id: "schedule", label: "Mi Horario", icon: Calendar },
        { id: "speaking", label: "Speaking Practice", icon: Mic },
    ];

    const startSidebarTour = useCallback(() => {
        const steps = [
            {
                element: "#Welcome",
                popover: {
                    title: "Bienvenido",
                    description:
                        "¡Bienvenido a tu panel de estudiante! Aquí podrás acceder a tus cursos, actividades y mucho más para mejorar tu aprendizaje del inglés.",
                    position: "right",
                },
            },
            {
                element: "#navegacion",
                popover: {
                    title: "Tu barra de navegación",
                    description:
                        "Aquí se encuentran las secciones principales. Usa esta barra para acceder fácilmente a tu panel, cursos, horario y actividades.",
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
                    title: "Asistente Virtual IA",
                    description: "Tu asistente inteligente que te ayudará a mejorar tu aprendizaje con recomendaciones personalizadas.",
                    position: "right",
                },
            },
            {
                element: "#menu-activities",
                popover: {
                    title: "Mis Actividades",
                    description: "Consulta tus actividades y tareas pendientes.",
                    position: "right",
                },
            },
            {
                element: "#menu-schedule",
                popover: {
                    title: "Mi Horario",
                    description: "Consulta tu horario de clases y actividades.",
                    position: "right",
                },
            },
        ];

        const driverObj = driver({
            showProgress: true,
            allowClose: true,
            popoverClass: "driverjs-theme",
            steps,
            onDestroyed: () => {
                try {
                    localStorage.setItem("hasSeenSidebarTour", "true");
                    setShowTourButton(false);
                    driverObj.destroy();
                } catch (error) {
                    console.warn("No se pudo guardar el estado del tour:", error);
                }
            },
        });

        driverObj.drive();
    }, []);

    useEffect(() => {
        try {
            const hasSeenTour = localStorage.getItem("hasSeenSidebarTour");
            if (hasSeenTour || !isDesktop) return;

            const timeout = setTimeout(() => {
                startSidebarTour();
            }, 600);

            return () => clearTimeout(timeout);
        } catch (error) {
            console.warn("Error al verificar tour:", error);
        }
    }, [startSidebarTour, isDesktop]);

    if (!isDesktop) return null;

    return (
        <div
            className={`fixed top-0 bottom-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out 
            lg:translate-x-0 lg:static lg:h-screen pt-[76px] lg:pt-0
            ${sidebarOpen ? "translate-x-0 z-[45]" : "-translate-x-full z-0"} 
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
                        <h1 className="text-lg font-bold text-[#00246a]">Bienvenido</h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                        aria-label="Cerrar menú"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 mt-6 px-3 overflow-y-auto" id="navegacion">
                    {/* Primeros 2 items */}
                    {menuItemsTop.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                id={`menu-${item.id}`}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 mb-2
                                    ${isActive 
                                        ? "bg-[#e30f28]/10 text-[#e30f28] shadow-sm" 
                                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "text-[#e30f28]" : ""}`} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}

                    {/* Asistente Virtual - Botón Especial en el MEDIO */}
                    <div className="my-2">
                        <button
                            id="menu-assistant"
                            onClick={() => {
                                setActiveSection("assistant");
                                setSidebarOpen(false);
                            }}
                            className={`w-full relative group overflow-hidden rounded-2xl p-[2px] transition-all duration-300
                                ${activeSection === "assistant" 
                                    ? "shadow-[0_8px_24px_rgba(0,194,168,0.25)]" 
                                    : "hover:shadow-[0_8px_20px_rgba(0,194,168,0.15)]"
                                }`}
                        >
                            {/* Gradient Border */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-[#00c2a8] via-[#06b6d4] to-[#8b5cf6] rounded-2xl transition-opacity duration-300
                                ${activeSection === "assistant" ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
                            />
                            
                            {/* Button Content - Fondo más claro cuando está activo */}
                            <div className={`relative flex items-center space-x-3 px-4 py-4 rounded-2xl transition-all duration-300
                                ${activeSection === "assistant" 
                                    ? "bg-white shadow-inner" 
                                    : "bg-white group-hover:bg-gradient-to-br group-hover:from-[#00c2a8]/5 group-hover:via-[#06b6d4]/5 group-hover:to-[#8b5cf6]/5"
                                }`}
                            >
                                {/* Icon with animated glow */}
                                <div className="relative flex-shrink-0">
                                    <div className={`absolute inset-0 bg-gradient-to-br from-[#00c2a8] to-[#06b6d4] rounded-lg blur-md transition-opacity duration-300
                                        ${activeSection === "assistant" ? "opacity-40" : "opacity-0 group-hover:opacity-30"}`}
                                    />
                                    <div className="relative bg-gradient-to-br from-[#ffffff] to-[#ffffff] p-2 rounded-lg shadow-sm">
                                        <div className="relative w-6 h-6">
                                            <Image
                                                src="/ChatBot.png"
                                                alt="Asistente IA"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Text */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    <span className={`font-semibold text-sm transition-colors duration-300
                                        ${activeSection === "assistant" 
                                            ? "text-[#00c2a8]" 
                                            : "text-slate-800 group-hover:text-[#00c2a8]"
                                        }`}
                                    >
                                        Asistente Virtual
                                    </span>
                                </div>

                                {/* Sparkles Icon */}
                                <Sparkles className={`w-4 h-4 flex-shrink-0 transition-all duration-300
                                    ${activeSection === "assistant" 
                                        ? "text-[#8b5cf6] animate-pulse" 
                                        : "text-slate-400 group-hover:text-[#00c2a8]"
                                    }`}
                                />

                                {/* Animated particles effect */}
                                {activeSection === "assistant" && (
                                    <>
                                        <div className="absolute top-2 right-8 w-1 h-1 bg-[#00c2a8] rounded-full animate-ping" />
                                        <div className="absolute bottom-3 right-12 w-1 h-1 bg-[#06b6d4] rounded-full animate-ping" style={{ animationDelay: "0.5s" }} />
                                        <div className="absolute top-1/2 right-6 w-1 h-1 bg-[#8b5cf6] rounded-full animate-ping" style={{ animationDelay: "1s" }} />
                                    </>
                                )}
                            </div>
                        </button>
                    </div>

                    {/* Últimos 2 items */}
                    {menuItemsBottom.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                id={`menu-${item.id}`}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 mb-2
                                    ${isActive 
                                        ? "bg-[#e30f28]/10 text-[#e30f28] shadow-sm" 
                                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "text-[#e30f28]" : ""}`} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
