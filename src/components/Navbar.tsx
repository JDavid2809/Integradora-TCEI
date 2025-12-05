"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Menu, Search, X, Play, User, BookOpenText, GraduationCap, School, House, LogOut, MessageCircle, Settings, Activity, Users, CreditCard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession, signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import { useSearch } from '../contexts/SearchContext'
import SearchResults from './SearchResults'
import ChatWindow from './ChatWindow'
import { ChatProvider } from '@/contexts/ChatContext'
import { ThemeToggle } from './ThemeToggle'

// Navegación para usuarios no autenticados
const guestNavigationItems = [
    { name: "Cursos", icon: <School className="ml-2" />, href: "/Courses" },
    { name: "Recursos", icon: <BookOpenText className="ml-2" />, href: "/recursos" },
]

// Navegación para estudiantes - Enlaces externos al dashboard
const studentNavigationItems = [
    { name: "Explorar Cursos", icon: <School className="ml-2" />, href: "/Courses" },
    { name: "Recursos", icon: <BookOpenText className="ml-2" />, href: "/recursos" },
]

// Navegación para profesores - Enlaces externos al dashboard
const teacherNavigationItems = [
    { name: "Ver Cursos", icon: <School className="ml-2" />, href: "/Courses" },
    { name: "Explorar Recursos", icon: <BookOpenText className="ml-2" />, href: "/recursos" },
]

// Navegación para administradores - Enlaces externos al panel admin
const adminNavigationItems = [
    { name: "Ver Sitio", icon: <House className="ml-2" />, href: "/" },
    { name: "Ver Cursos", icon: <School className="ml-2" />, href: "/Courses" },
    { name: "Recursos", icon: <BookOpenText className="ml-2" />, href: "/recursos" },
]

// Función para obtener los elementos de navegación según el rol del usuario
const getNavigationItems = (userRole?: string) => {
    switch (userRole) {
        case 'ESTUDIANTE':
            return studentNavigationItems
        case 'PROFESOR':
            return teacherNavigationItems
        case 'ADMIN':
            return adminNavigationItems
        default:
            return guestNavigationItems
    }
}

const studentOptions = [
    { name: "Inscribirse ahora", href: "/inscribirse" },
]

const platformOptions = [
    { name: "Iniciar sesión", href: "/Login" },
    { name: "Registrarse", href: "/Login" },
    { name: "Solicitar ser profesor", href: "/solicitud-profesor" },
]

// Dynamic account options based on user role
const getAccountOptions = (userRole?: string) => {
    const baseOptions = [
        { name: "Mis cursos", href: "/mis-cursos" },
        { name: "Progreso", href: "/progreso" },
        { name: "Certificados", href: "/certificados" },
    ]

    // Add role-specific profile option
    if (userRole === 'ESTUDIANTE') {
        return [
            { name: "Mi perfil", href: "/Students/profileS" },
            ...baseOptions
        ]
    } else if (userRole === 'PROFESOR') {
        return [
            { name: "Mi perfil", href: "/Teachers/profileT" },
            ...baseOptions
        ]
    } else if (userRole === 'ADMIN') {
        return [
            { name: "Mi perfil", href: "/Admin/profile" },
            ...baseOptions
        ]
    }

    // Default options for users without specific roles
    return [
        { name: "Mi perfil", href: "/perfil" },
        ...baseOptions
    ]
}

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
                className={`flex items-center px-4 py-2 font-medium rounded-full transition-all duration-200 ${isHovered ? "bg-[#e30f28] text-white dark:bg-red-600" : "text-[#00246a] hover:bg-[#e30f28] hover:text-white dark:text-blue-100 dark:hover:bg-red-600"}`}
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
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-4 z-50"
                    >
                        {options.map((item, i) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer group"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleNavigation(item.href)}
                            >
                                <span className="text-[#00246a] dark:text-blue-100 font-medium">{item.name}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function UserMenu({ user }: { user: NonNullable<Session['user']> }) {
    const [isHovered, setIsHovered] = useState(false)
    const router = useRouter()

    const handleLogout = async () => {
        try {
            // Limpiar cualquier dato local antes de cerrar sesión
            if (typeof window !== 'undefined') {
                // Limpiar localStorage si hay datos de sesión
                localStorage.removeItem('lastVisitedPage')
                sessionStorage.clear()
            }

            // Cerrar sesión con NextAuth - Usar redirect true para limpieza completa
            await signOut({
                redirect: true,
                callbackUrl: '/Login'
            })
        } catch (error) {
            console.error('Error during logout:', error)
            // Forzar navegación en caso de error
            window.location.href = '/Login'
        }
    }

    const handleDashboard = () => {
        switch (user.rol) {
            case 'PROFESOR':
                router.push('/Teachers')
                break
            case 'ESTUDIANTE':
                router.push('/Students')
                break
            case 'ADMIN':
                router.push('/Admin')
                break
            default:
                router.push('/')
        }
    }

    const handleProfile = () => {
        switch (user.rol) {
            case 'PROFESOR':
                router.push('/Teachers/profileT')
                break
            case 'ESTUDIANTE':
                router.push('/Students/profileS')
                break
            case 'ADMIN':
                router.push('/Admin/profile')
                break
            default:
                router.push('/perfil')
        }
    }

    const userInitials = `${user.name?.charAt(0) || ''}${user.apellido?.charAt(0) || ''}`.toUpperCase()
    const userColor = user.rol === 'PROFESOR' ? 'from-blue-500 to-blue-700' :
        user.rol === 'ESTUDIANTE' ? 'from-green-500 to-green-700' :
            'from-purple-500 to-purple-700'

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.button
                className="flex items-center space-x-3 px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
            >
                <div className={`w-8 h-8 bg-gradient-to-br ${userColor} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-medium text-sm">{userInitials}</span>
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-[#00246a] dark:text-blue-100">{user.name} {user.apellido}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.rol?.toLowerCase()}</p>
                </div>
                <ChevronDown
                    className="ml-2 h-4 w-4 text-slate-600 dark:text-slate-400 transition-transform duration-300 ease-in-out"
                    style={{ transform: isHovered ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </motion.button>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50"
                    >
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                            <p className="text-sm font-medium text-[#00246a] dark:text-blue-100">{user.name} {user.apellido}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1 capitalize">{user.rol?.toLowerCase()}</p>
                        </div>

                        <motion.button
                            onClick={handleDashboard}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors duration-200 group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <House className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
                            <span className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">Mi Dashboard</span>
                        </motion.button>

                        <motion.button
                            onClick={handleProfile}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 rounded-lg transition-colors duration-200 group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <User className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200" />
                            <span className="text-slate-700 dark:text-slate-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">Mi Perfil</span>
                        </motion.button>

                        <motion.button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors duration-200 group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <LogOut className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200" />
                            <span className="text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">Cerrar Sesión</span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

    )
}

function AccountDropdown() {
    const [isHovered, setIsHovered] = useState(false)
    const router = useRouter()
    const { data: session } = useSession()

    const handleNavigation = (href: string) => {
        router.push(href)
    }

    // Determinar qué opciones mostrar según el estado de la sesión
    const menuOptions = session?.user ? getAccountOptions(session.user.rol) : platformOptions

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.button
                className="bg-[#e30f28] text-white hover:bg-[#00246a] dark:hover:bg-blue-900 font-semibold px-6 py-2.5 rounded-full shadow-lg flex items-center"
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
                        className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl p-2 z-50"
                    >
                        {menuOptions.map((option: { name: string; href: string }, i: number) => (
                            <motion.div
                                key={option.name}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="px-3 py-2 hover:bg-[#e30f28] hover:text-white rounded-lg cursor-pointer text-gray-700 dark:text-gray-300 transition-colors duration-200"
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
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [isChatMinimized, setIsChatMinimized] = useState(false)
    const { data: session, status } = useSession()
    const { searchQuery, setSearchQuery, performSearch, clearSearch, currentPage } = useSearch()
    const router = useRouter()

    // Obtener elementos de navegación dinámicamente basados en el rol del usuario
    const navigationItems = getNavigationItems(session?.user?.rol)

    const handleNavigation = (href: string) => {
        router.push(href)
    }

    const handleLogout = async () => {
        try {
            // Cerrar menú móvil
            setIsMobileMenuOpen(false)

            // Limpiar datos locales
            if (typeof window !== 'undefined') {
                localStorage.removeItem('lastVisitedPage')
                sessionStorage.clear()
            }

            // Cerrar sesión con redirección automática
            await signOut({
                redirect: true,
                callbackUrl: '/Login'
            })
        } catch (error) {
            console.error('Error during logout:', error)
            window.location.href = '/Login'
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            performSearch(searchQuery)
            setIsSearchOpen(false)
            // Mostrar resultados globales solo si NO estamos en la página de cursos
            if (!currentPage.includes('/Courses')) {
                setShowSearchResults(true)
            }
        }
    }

    const handleClearSearch = () => {
        clearSearch()
        setIsSearchOpen(false)
        setShowSearchResults(false)
    }

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen)
        if (!isChatOpen) {
            setIsChatMinimized(false)
        }
    }

    const closeChat = () => {
        setIsChatOpen(false)
        setIsChatMinimized(false)
    }

    const toggleChatMinimize = () => {
        setIsChatMinimized(!isChatMinimized)
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

    // Revalidar sesión cuando el usuario navega con botones del navegador
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Revalidar sesión cuando la página vuelve a ser visible
                if (session?.user) {
                    // La sesión se revalidará automáticamente con useSession
                    console.log('📍 Page visible, session will revalidate')
                }
            }
        }

        const handlePopState = () => {
            // Cuando el usuario presiona atrás/adelante
            console.log('⬅️ Browser back/forward detected')
            // Forzar recarga si estamos en una ruta protegida sin sesión válida
            if (typeof window !== 'undefined' && !session?.user) {
                const protectedPaths = ['/Teachers', '/Students', '/Admin']
                const currentPath = window.location.pathname
                if (protectedPaths.some(path => currentPath.startsWith(path))) {
                    console.log('🔒 Protected route without session, redirecting to login')
                    window.location.href = '/Login'
                }
            }
        }

        if (typeof window !== 'undefined') {
            document.addEventListener('visibilitychange', handleVisibilityChange)
            window.addEventListener('popstate', handlePopState)

            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange)
                window.removeEventListener('popstate', handlePopState)
            }
        }
    }, [session])

    return (
        <>
            <motion.header
                className="w-full px-4 pt-0 pb-0 fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-950"
                initial={{ y: 0 }}
                animate={{ y: (isVisible || isMobileMenuOpen) ? 0 : -100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <div className="max-w-7xl mx-auto pt-2 pb-2">
                    <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 dark:border-slate-800/50">
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
                                {navigationItems.map((item) => (
                                    <motion.button
                                        key={item.name}
                                        className="text-[#00246a] dark:text-blue-100 hover:bg-[#e30f28] hover:text-white dark:hover:bg-red-600 px-4 py-2 flex font-medium rounded-full transition-all duration-200"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleNavigation(item.href)}
                                    >
                                        {item.name}
                                        {item.icon}
                                    </motion.button>
                                ))}
                            </div>

                            <div className="hidden lg:flex items-center space-x-4 relative">
                                <ThemeToggle />
                                {/* Barra de búsqueda expandible */}
                                <div className="relative">
                                    <AnimatePresence>
                                        {isSearchOpen && (
                                            <motion.div
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: "300px", opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="absolute right-12 top-1/2 transform -translate-y-1/2 z-50"
                                            >
                                                <form onSubmit={handleSearch} className="relative">
                                                    <input
                                                        type="text"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        placeholder="Buscar cursos, recursos..."
                                                        autoFocus
                                                        className="w-full px-4 py-2 pr-10 text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-900 border-2 border-[#e30f28] dark:border-red-600 rounded-full shadow-lg focus:outline-none focus:border-[#00246a] dark:focus:border-blue-400 transition-colors duration-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleClearSearch}
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors duration-200"
                                                    >
                                                        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                    </button>
                                                </form>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <motion.button
                                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                                        className={`${isSearchOpen ? 'bg-[#e30f28] text-white dark:bg-red-600' : 'text-[#00246a] dark:text-blue-100 hover:bg-[#e30f28] hover:text-white dark:hover:bg-red-600'} rounded-full p-2 transition-all duration-200`}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Search className="h-5 w-5" />
                                    </motion.button>
                                </div>

                                {/* Botón de Chat - Solo para usuarios autenticados */}
                                {session?.user && (
                                    <motion.button
                                        onClick={toggleChat}
                                        className={`${isChatOpen ? 'bg-[#e30f28] text-white dark:bg-red-600' : 'text-[#00246a] dark:text-blue-100 hover:bg-[#e30f28] hover:text-white dark:hover:bg-red-600'} rounded-full p-2 transition-all duration-200 relative`}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        title="Chat"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        {/* Indicador de mensajes no leídos (placeholder para futuro) */}
                                        {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span> */}
                                    </motion.button>
                                )}

                                {status === "loading" ? (
                                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                                ) : session?.user ? (
                                    <UserMenu user={session.user} />
                                ) : (
                                    <>
                                        <DropdownMenu label="Comenzar" options={studentOptions} />
                                        <AccountDropdown />
                                    </>
                                )}
                            </div>

                            <motion.button
                                className="lg:hidden text-[#00246a] dark:text-blue-100 hover:bg-[#e30f28] hover:text-white dark:hover:bg-red-600 rounded-full p-2"
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
                                className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white dark:bg-slate-900 text-[#00246a] dark:text-blue-100 rounded-l-2xl z-[60] lg:hidden shadow-2xl"
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
                                        <div className="flex items-center gap-2">
                                            <ThemeToggle />
                                            <motion.button
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="p-2 hover:bg-[#e30f28] hover:text-white dark:hover:bg-red-600 rounded-full"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <X className="h-6 w-6" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    <nav className="space-y-4">
                                        {navigationItems.map((item) => (
                                            <motion.div
                                                key={item.name}
                                                className="font-medium py-2 px-2 flex hover:bg-[#e30f28] hover:text-white dark:hover:bg-red-600 rounded-lg cursor-pointer text-[#00246a] dark:text-blue-100 transition-colors duration-200"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleNavigation(item.href)}
                                            >
                                                {item.name}
                                                {item.icon}
                                            </motion.div>
                                        ))}
                                    </nav>

                                    <div className="mt-8 space-y-4 pt-6 border-t border-gray-200 dark:border-slate-800">
                                        {session?.user ? (
                                            // Usuario autenticado - Mostrar información y logout
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                                    <div className={`w-10 h-10 bg-gradient-to-br ${session.user.rol === 'PROFESOR' ? 'from-blue-500 to-blue-700' :
                                                            session.user.rol === 'ESTUDIANTE' ? 'from-green-500 to-green-700' :
                                                                'from-purple-500 to-purple-700'
                                                        } rounded-full flex items-center justify-center`}>
                                                        <span className="text-white font-medium text-sm">
                                                            {`${session.user.name?.charAt(0) || ''}${session.user.apellido?.charAt(0) || ''}`.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-[#00246a] dark:text-blue-100">{session.user.name} {session.user.apellido}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{session.user.rol?.toLowerCase()}</p>
                                                    </div>
                                                </div>

                                                <motion.button
                                                    onClick={() => {
                                                        switch (session.user.rol) {
                                                            case 'PROFESOR':
                                                                handleNavigation('/Teachers')
                                                                break
                                                            case 'ESTUDIANTE':
                                                                handleNavigation('/Students')
                                                                break
                                                            case 'ADMIN':
                                                                handleNavigation('/Admin')
                                                                break
                                                        }
                                                        setIsMobileMenuOpen(false)
                                                    }}
                                                    className="w-full flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors duration-200"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <House className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    <span className="text-blue-600 dark:text-blue-400 font-medium">Mi Dashboard</span>
                                                </motion.button>

                                                <motion.button
                                                    onClick={() => {
                                                        switch (session.user.rol) {
                                                            case 'PROFESOR':
                                                                handleNavigation('/Teachers/profileT')
                                                                break
                                                            case 'ESTUDIANTE':
                                                                handleNavigation('/Students/profileS')
                                                                break
                                                            case 'ADMIN':
                                                                handleNavigation('/Admin/profile')
                                                                break
                                                            default:
                                                                handleNavigation('/perfil')
                                                        }
                                                        setIsMobileMenuOpen(false)
                                                    }}
                                                    className="w-full flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors duration-200"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    <span className="text-green-600 dark:text-green-400 font-medium">Mi Perfil</span>
                                                </motion.button>

                                                <motion.button
                                                    onClick={() => {
                                                        toggleChat()
                                                        setIsMobileMenuOpen(false)
                                                    }}
                                                    className="w-full flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors duration-200"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                    <span className="text-purple-600 dark:text-purple-400 font-medium">Chat</span>
                                                </motion.button>

                                                <motion.button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors duration-200"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                    <span className="text-red-600 dark:text-red-400 font-medium">Cerrar Sesión</span>
                                                </motion.button>
                                            </div>
                                        ) : (
                                            // Usuario no autenticado - Mostrar botones originales
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <motion.button
                                                        className="p-3 bg-[#e30f28] hover:bg-[#00246a] hover:text-white dark:hover:bg-blue-900 text-white rounded-full flex items-center justify-center"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <Search className="h-5 w-5" />
                                                    </motion.button>

                                                    <motion.button
                                                        onClick={() => {
                                                            handleNavigation('/Login')
                                                            setIsMobileMenuOpen(false)
                                                        }}
                                                        className="p-3 bg-[#e30f28] hover:bg-[#00246a] hover:text-white dark:hover:bg-blue-900 text-white rounded-full flex items-center justify-center"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <Play className="h-5 w-5" />
                                                    </motion.button>

                                                    <motion.button
                                                        onClick={() => {
                                                            handleNavigation('/Login')
                                                            setIsMobileMenuOpen(false)
                                                        }}
                                                        className="p-3 bg-[#e30f28] text-white hover:bg-[#00246a] dark:hover:bg-blue-900 rounded-full flex items-center justify-center transition-colors duration-200"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <User className="h-5 w-5" />
                                                    </motion.button>
                                                </div>

                                                <div className="text-center space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                                    <div className="flex justify-between">
                                                        <span>Buscar</span>
                                                        <span>Comenzar</span>
                                                        <span>Iniciar Sesión</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.header>

            {/* Componente de resultados de búsqueda global */}
            <SearchResults
                isOpen={showSearchResults}
                onClose={() => setShowSearchResults(false)}
            />

            {/* Chat Window - Solo para usuarios autenticados */}
            {session?.user && (
                <ChatWindow
                    isOpen={isChatOpen}
                    onClose={closeChat}
                    isMinimized={isChatMinimized}
                    onToggleMinimize={toggleChatMinimize}
                />
            )}
        </>
    )
}
