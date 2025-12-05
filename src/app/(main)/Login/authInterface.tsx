"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import BrandingSection from "./branding"
import RegisterForm from "./register"
import LoginForm from "./login"
import Loader from "@/components/Loader"

export default function AuthInterface() {
    const [isLogin, setIsLogin] = useState(true)
    const { data: session, status } = useSession()
    const router = useRouter()

    // Verificar si el usuario ya está autenticado
    useEffect(() => {
        if (status === "loading") return // Aún cargando

        if (session?.user) {
            console.log('🔄 Client: User already authenticated, redirecting...', session.user.email)
            
            // Redirigir según el rol
            switch (session.user.rol) {
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
                    break
            }
        }
    }, [session, status, router])

    const toggleMode = () => {
        setIsLogin(!isLogin)
    }

    // Mostrar loader mientras se verifica la sesión
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    // Si hay sesión, mostrar loader mientras redirige
    if (session?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader />
                    <p className="text-slate-600 dark:text-slate-400 mt-4">Redirigiendo...</p>
                </div>
            </div>
        )
    }

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    }

    const transition = {
        type: "spring" as const,
        stiffness: 200,
        damping: 25
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
         
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center ">
                <AnimatePresence mode="wait" custom={isLogin ? 1 : -1}>
                    {isLogin ? (
                        <motion.div
                            key="branding-left"
                            custom={1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={transition}
                            className="hidden lg:block"
                        >
                            <BrandingSection />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="register-left"
                            custom={-1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={transition}
                            className="w-full max-w-md mx-auto"
                        >
                            <RegisterForm toggleMode={toggleMode} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait" custom={isLogin ? -1 : 1}>
                    {isLogin ? (
                        <motion.div
                            key="login-right"
                            custom={-1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={transition}
                            className="w-full max-w-md mx-auto"
                        >
                            <LoginForm toggleMode={toggleMode} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="branding-right"
                            custom={1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={transition}
                            className="hidden lg:block"
                        >
                            <BrandingSection />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
