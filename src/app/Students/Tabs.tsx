"use client";

import { useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Home, GraduationCap, CheckSquare, Calendar, BrainCircuit, Sparkles } from "lucide-react";
import Image from "next/image";
import { driver } from "driver.js";

interface BottomTabsProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
}

export default function BottomTabs({ activeSection, setActiveSection }: BottomTabsProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const tabItemsTop = [
        { id: "dashboard", label: "Inicio", icon: Home },
        { id: "courses", label: "Cursos", icon: BookOpen },
    ];

    const tabItemsBottom = [
        { id: "activities", label: "Actividades", icon: CheckSquare },
        { id: "schedule", label: "Horario", icon: Calendar },
    ];

    const startBottomTabsTour = useCallback(() => {
        const steps = [
            {
                element: "#bottom-tabs",
                popover: {
                    title: "Navegación inferior",
                    description:
                        "Aquí puedes acceder rápidamente a las secciones principales de la app desde tu dispositivo móvil.",
                    position: "top",
                },
            },
            {
                element: "#tab-dashboard",
                popover: {
                    title: "Inicio",
                    description: "Accede a tu panel principal desde aquí.",
                    position: "top",
                },
            },
            {
                element: "#tab-courses",
                popover: {
                    title: "Cursos",
                    description: "Visualiza y entra a tus cursos disponibles.",
                    position: "top",
                },
            },
            {
                element: "#tab-assistant",
                popover: {
                    title: "Asistente Virtual IA",
                    description: "Tu asistente inteligente que te ayudará a mejorar tu aprendizaje con recomendaciones personalizadas.",
                    position: "top",
                },
            },
            {
                element: "#tab-activities",
                popover: {
                    title: "Actividades",
                    description: "Consulta tus actividades y tareas aquí.",
                    position: "top",
                },
            },
            {
                element: "#tab-schedule",
                popover: {
                    title: "Horario",
                    description: "Consulta tus clases y actividades programadas.",
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
        try {
            const hasSeenTour = localStorage.getItem("hasSeenBottomTabsTour");
            if (hasSeenTour || !isMobile) return;

            const timeout = setTimeout(() => {
                startBottomTabsTour();
                localStorage.setItem("hasSeenBottomTabsTour", "true");
            }, 800);

            return () => clearTimeout(timeout);
        } catch (error) {
            console.warn("Error al verificar tour móvil:", error);
        }
    }, [startBottomTabsTour, isMobile]);

    return (
        <div
            id="bottom-tabs"
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30"
        >
            <div className="flex items-center justify-around px-1 py-1.5 safe-area-pb">
                {/* Primeros 2 tabs */}
                {tabItemsTop.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <motion.button
                            key={item.id}
                            id={`tab-${item.id}`}
                            onClick={() => setActiveSection(item.id)}
                            className={`relative flex flex-col items-center justify-center p-1.5 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                                isActive ? "text-[#e30f28]" : "text-slate-500"
                            }`}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-[#e30f28]/10 rounded-lg"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30,
                                    }}
                                />
                            )}

                            {/* Icon */}
                            <div className="relative z-10 mb-0.5">
                                <item.icon
                                    className={`w-4.5 h-4.5 ${
                                        isActive ? "text-[#e30f28]" : "text-slate-500"
                                    }`}
                                />
                            </div>

                            {/* Label */}
                            <span
                                className={`text-[10px] font-medium relative z-10 ${
                                    isActive ? "text-[#e30f28]" : "text-slate-500"
                                }`}
                            >
                                {item.label}
                            </span>

                            {/* Active dot */}
                            {isActive && (
                                <motion.div
                                    className="absolute -top-0.5 w-1 h-1 bg-[#e30f28] rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                />
                            )}
                        </motion.button>
                    );
                })}

                {/* Botón especial del Asistente IA - EN MEDIO */}
                <motion.button
                    id="tab-assistant"
                    onClick={() => setActiveSection("assistant")}
                    className="relative flex flex-col items-center justify-center min-w-0 flex-1 px-0.5"
                    whileTap={{ scale: 0.95 }}
                >
                    <div
                        className={`relative overflow-hidden rounded-xl p-[1.5px] transition-all duration-300 ${
                            activeSection === "assistant"
                                ? "shadow-[0_2px_12px_rgba(0,194,168,0.3)]"
                                : ""
                        }`}
                    >
                        {/* Gradient Border */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-br from-[#00c2a8] via-[#06b6d4] to-[#8b5cf6] rounded-xl transition-opacity duration-300 ${
                                activeSection === "assistant" ? "opacity-100" : "opacity-60"
                            }`}
                        />

                        {/* Button Content */}
                        <div className="relative bg-white rounded-xl px-2 py-1.5 flex flex-col items-center">
                            {/* Icon with glow */}
                            <div className="relative mb-0.5">
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br from-[#00c2a8] to-[#06b6d4] rounded-md blur-sm transition-opacity duration-300 ${
                                        activeSection === "assistant" ? "opacity-40" : "opacity-0"
                                    }`}
                                />
                                <div className="relative bg-gradient-to-br from-[#ffffff] to-[#ffffff] p-1 rounded-md">
                                    <div className="relative w-3.5 h-3.5">
                                        <Image
                                            src="/ChatBot.png"
                                            alt="Asistente IA"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Label with gradient */}
                            <span
                                className={`text-[9px] font-semibold transition-colors duration-300 text-center leading-tight ${
                                    activeSection === "assistant"
                                        ? "text-[#00c2a8]"
                                        : "text-slate-600"
                                }`}
                            >
                                Asistente
                            </span>

                            {/* AI Badge */}
                            <div className="flex items-center gap-0.5">
                                <Sparkles
                                    className={`w-2 h-2 transition-all duration-300 ${
                                        activeSection === "assistant"
                                            ? "text-[#8b5cf6] animate-pulse"
                                            : "text-slate-400"
                                    }`}
                                />
                                <span
                                    className={`text-[7px] font-medium transition-colors duration-300 ${
                                        activeSection === "assistant"
                                            ? "text-[#06b6d4]"
                                            : "text-slate-400"
                                    }`}
                                >
                                    IA
                                </span>
                            </div>

                            {/* Animated particles */}
                            {activeSection === "assistant" && (
                                <>
                                    <div className="absolute top-0.5 right-1.5 w-0.5 h-0.5 bg-[#00c2a8] rounded-full animate-ping" />
                                    <div
                                        className="absolute bottom-1.5 left-1.5 w-0.5 h-0.5 bg-[#06b6d4] rounded-full animate-ping"
                                        style={{ animationDelay: "0.5s" }}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Active dot on top */}
                    {activeSection === "assistant" && (
                        <motion.div
                            className="absolute -top-0.5 w-1 h-1 bg-[#00c2a8] rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                        />
                    )}
                </motion.button>

                {/* Últimos 2 tabs */}
                {tabItemsBottom.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <motion.button
                            key={item.id}
                            id={`tab-${item.id}`}
                            onClick={() => setActiveSection(item.id)}
                            className={`relative flex flex-col items-center justify-center p-1.5 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                                isActive ? "text-[#e30f28]" : "text-slate-500"
                            }`}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-[#e30f28]/10 rounded-lg"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30,
                                    }}
                                />
                            )}

                            {/* Icon */}
                            <div className="relative z-10 mb-0.5">
                                <item.icon
                                    className={`w-4.5 h-4.5 ${
                                        isActive ? "text-[#e30f28]" : "text-slate-500"
                                    }`}
                                />
                            </div>

                            {/* Label */}
                            <span
                                className={`text-[10px] font-medium relative z-10 ${
                                    isActive ? "text-[#e30f28]" : "text-slate-500"
                                }`}
                            >
                                {item.label}
                            </span>

                            {/* Active dot */}
                            {isActive && (
                                <motion.div
                                    className="absolute -top-0.5 w-1 h-1 bg-[#e30f28] rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
