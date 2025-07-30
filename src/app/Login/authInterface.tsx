"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import BrandingSection from "./branding"
import RegisterForm from "./register"
import LoginForm from "./login"



export default function AuthInterface() {
    const [isLogin, setIsLogin] = useState(true)

    const toggleMode = () => {
        setIsLogin(!isLogin)
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
