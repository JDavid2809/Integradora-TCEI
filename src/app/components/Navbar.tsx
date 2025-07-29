"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Menu, Search, X, Play, User, BookOpenText, GraduationCap, School, House } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"

const navigationItems = [
    { name: "Inicio", icon: <House className="ml-2"/>, href:"/" },
    { name: "Cursos", icon: <School className="ml-2"/>, href:"/Courses" },
    { name: "Recursos", icon: <BookOpenText className="ml-2"/>, href:"/recursos" },
    { name: "Certificaciones", icon: <GraduationCap className="ml-2"/>, href:"/certificaciones" },
]

const studentOptions = [
    { name: "Inscribirse ahora", href: "/inscribirse" },
    { name: "Iniciar sesión", href: "/Login" },
    { name: "Registrarse", href: "/Login" }
]

const platformOptions = [
    { name: "Mi perfil", href: "/perfil" },
    { name: "Mis cursos", href: "/mis-cursos" },
    { name: "Progreso", href: "/progreso" },
    { name: "Certificados", href: "/certificados" },
    { name: "Configuración", href: "/configuracion" }
]

function DropdownMenu({ label, options }: { label: string; options: { name: string; href: string }[] }) {
    const [isHovered, setIsHovered] = useState(false)
    const router = useRouter()

    const handleNavigation = (href: string) => {
        router.push(href)
    }

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`flex items-center px-4 py-2 font-medium rounded-full transition-all duration-200 ${isHovered ? "bg-[#e30f28] text-white" : "text-[#00246a] hover:bg-[#e30f28] hover:text-white"}`}
            >
                {label}
                <ChevronDown
                    className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out"
                    style={{ transform: isHovered ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </div>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-white rounded-3xl shadow-2xl p-4 z-50"
                    >
                        {options.map((item, i) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 cursor-pointer group"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleNavigation(item.href)}
                            >
                                <span className="text-[#00246a] font-medium">{item.name}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function AccountDropdown() {
    const [isHovered, setIsHovered] = useState(false)
    const router = useRouter()

    const handleNavigation = (href: string) => {
        router.push(href)
    }

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.button
                className="bg-[#e30f28] text-white hover:bg-[#00246a] font-semibold px-6 py-2.5 rounded-full shadow-lg flex items-center"
                whileHover={{ scale: 1.05 }}
            >
                Mi Cuenta
                <ChevronDown 
                    className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out" 
                    style={{ transform: isHovered ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </motion.button>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl p-2 z-50"
                    >
                        {platformOptions.map((option, i) => (
                            <motion.div 
                                key={option.name} 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="px-3 py-2 hover:bg-[#e30f28] hover:text-white rounded-lg cursor-pointer text-gray-700 transition-colors duration-200"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleNavigation(option.href)}
                            >
                                {option.name}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function NavBar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const router = useRouter()

    const handleNavigation = (href: string) => {
        router.push(href)
    }

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                // No ocultar la navbar si el menú móvil está abierto
                if (isMobileMenuOpen) {
                    return
                }
                
                if (window.scrollY > lastScrollY && window.scrollY > 100) {
                    setIsVisible(false)
                } else {
                    setIsVisible(true)
                }
                setLastScrollY(window.scrollY)
            }
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar)
            return () => {
                window.removeEventListener('scroll', controlNavbar)
            }
        }
    }, [lastScrollY, isMobileMenuOpen])

    return (
        <motion.header
            className="w-full px-4 pt-0 pb-0 fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md"
            initial={{ y: 0 }}
            animate={{ y: (isVisible || isMobileMenuOpen) ? 0 : -100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            <div className="max-w-7xl mx-auto pt-2 pb-2">
                <nav className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50">
                    <div className="px-4 md:px-8 py-4 flex items-center justify-between">
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
                        </div>

                        <div className="hidden lg:flex items-center space-x-6">
                            {navigationItems.map(({ name, icon, href }) => (
                                <motion.button
                                    key={name}
                                    className="text-[#00246a] hover:bg-[#e30f28] hover:text-white px-4 py-2 flex font-medium rounded-full transition-all duration-200"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleNavigation(href)}
                                >
                                    {name}
                                    {icon}
                                </motion.button>
                            ))}
                        </div>

                        <div className="hidden lg:flex items-center space-x-4">
                            <motion.button
                                className="text-[#00246a] hover:bg-[#e30f28] hover:text-white rounded-full p-2"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Search className="h-5 w-5" />
                            </motion.button>

                            <DropdownMenu label="Comenzar" options={studentOptions} />

                            <AccountDropdown />
                        </div>

                        <motion.button
                            className="lg:hidden text-[#00246a] hover:bg-[#e30f28] hover:text-white rounded-full p-2"
                            onClick={() => setIsMobileMenuOpen(true)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Menu className="h-6 w-6" />
                        </motion.button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.3 }}
                            className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white text-[#00246a] rounded-l-2xl z-[60] lg:hidden shadow-2xl"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="relative w-10 h-10">
                                        <Image
                                            src="/logos/logoIngles.jpg"
                                            alt="Triunfando con el Inglés Logo"
                                            fill
                                            className="object-contain rounded-lg"
                                        />
                                    </div>
                                    <motion.button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 hover:bg-[#e30f28] hover:text-white rounded-full"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <X className="h-6 w-6" />
                                    </motion.button>
                                </div>

                                <nav className="space-y-4">
                                    {navigationItems.map(({ name, icon, href }) => (
                                        <motion.div 
                                            key={name} 
                                            className="font-medium py-2 px-2 flex hover:bg-[#e30f28] hover:text-white rounded-lg cursor-pointer text-[#00246a] transition-colors duration-200"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleNavigation(href)}
                                        >
                                            {name}
                                            {icon}
                                        </motion.div>
                                    ))}
                                </nav>

                                <div className="mt-8 space-y-4 pt-6 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <motion.button 
                                            className="p-3 bg-[#e30f28] hover:bg-[#00246a] hover:text-white text-white rounded-full flex items-center justify-center"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Search className="h-5 w-5" />
                                        </motion.button>
                                        
                                        <motion.button 
                                            className="p-3 bg-[#e30f28] hover:bg-[#00246a] hover:text-white text-white rounded-full flex items-center justify-center"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Play className="h-5 w-5" />
                                        </motion.button>
                                        
                                        <motion.button 
                                            className="p-3 bg-[#e30f28] text-white hover:bg-[#00246a] rounded-full flex items-center justify-center transition-colors duration-200"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <User className="h-5 w-5" />
                                        </motion.button>
                                    </div>
                                    
                                    <div className="text-center space-y-1 text-xs text-gray-500">
                                        <div className="flex justify-between">
                                            <span>Buscar</span>
                                            <span>Comenzar</span>
                                            <span>Mi Cuenta</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.header>
    )
}
