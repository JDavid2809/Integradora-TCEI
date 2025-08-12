"use client"

import { motion } from "framer-motion"
import { BookOpen, Home, GraduationCap, CheckSquare } from "lucide-react"

interface BottomTabsProps {
    activeSection: string
    setActiveSection: (section: string) => void
}

export default function BottomTabs({ activeSection, setActiveSection }: BottomTabsProps) {
    const tabItems = [
        { id: "dashboard", label: "Inicio", icon: Home },
        { id: "courses", label: "Cursos", icon: BookOpen },
        { id: "classes", label: "Clases", icon: GraduationCap },
        { id: "tasks", label: "Tareas", icon: CheckSquare },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30">
            <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
                {tabItems.map((item) => {
                    const isActive = activeSection === item.id
                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-0 flex-1 ${isActive ? "text-blue-600" : "text-slate-500"
                                }`}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-blue-600/10 rounded-xl"
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
                                <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                            </div>

                            {/* Label */}
                            <span className={`text-xs font-medium relative z-10 ${isActive ? "text-blue-600" : "text-slate-500"}`}>
                                {item.label}
                            </span>

                            {/* Active dot */}
                            {isActive && (
                                <motion.div
                                    className="absolute -top-1 w-1 h-1 bg-blue-600 rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                />
                            )}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
