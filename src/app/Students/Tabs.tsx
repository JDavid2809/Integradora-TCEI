"use client";

import { useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Home, GraduationCap, CheckSquare, Calendar, BrainCircuit } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

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

    const tabItems = [
        { id: "dashboard", label: "Inicio", icon: Home },
        { id: "courses", label: "Cursos", icon: BookOpen },
        { id: "activities", label: "Actividades", icon: CheckSquare },
        { id: "assistant", label: "Asistente virtual", icon: BrainCircuit },
        { id: "schedule", label: "Horario", icon: Calendar },
        { id: "exams", label: "Exámenes", icon: GraduationCap },
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
                element: "#tab-activities",
                popover: {
                    title: "Actividades",
                    description: "Consulta tus actividades y tareas aquí.",
                    position: "top",
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
                element: "#tab-schedule",
                popover: {
                    title: "Horario",
                    description: "Consulta tus clases y actividades programadas.",
                    position: "top",
                },
            },
            {
                element: "#tab-exams",
                popover: {
                    title: "Exámenes",
                    description: "Consulta tus exámenes y resultados aquí.",
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
        const hasSeenTour = localStorage.getItem("hasSeenBottomTabsTour");
        if (hasSeenTour || !isMobile) return;

        const timeout = setTimeout(() => {
            startBottomTabsTour();
            localStorage.setItem("hasSeenBottomTabsTour", "true");
        }, 800);

        return () => clearTimeout(timeout);
    }, [startBottomTabsTour, isMobile]);

    return (
        <div
            id="bottom-tabs"
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30"
        >
            <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
                {tabItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <motion.button
                            key={item.id}
                            id={`tab-${item.id}`}
                            onClick={() => setActiveSection(item.id)}
                            className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${isActive ? "text-[#e30f28]" : "text-slate-500"
                                }`}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-[#e30f28]/10 rounded-xl"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30,
                                    }}
                                />
                            )}

                            {/* Icon */}
                            <div className="relative z-10 mb-1">
                                <item.icon
                                    className={`w-5 h-5 ${isActive ? "text-[#e30f28]" : "text-slate-500"
                                        }`}
                                />
                            </div>

                            {/* Label */}
                            <span
                                className={`text-xs font-medium relative z-10 ${isActive ? "text-[#e30f28]" : "text-slate-500"
                                    }`}
                            >
                                {item.label}
                            </span>

                            {/* Active dot */}
                            {isActive && (
                                <motion.div
                                    className="absolute -top-1 w-1 h-1 bg-[#e30f28] rounded-full"
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
