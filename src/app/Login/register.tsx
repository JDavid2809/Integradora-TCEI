"use client"

import { useState } from "react"
import {  motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { registerUser } from "@/actions/auth/Auth-actions"

interface RegisterFormProps {
    toggleMode: () => void
}

export default function RegisterForm({ toggleMode }: RegisterFormProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
    }
    const [errorMessage, setErrorMessage] = useState("")
    const [mensaje, setMensaje] = useState("")


  const [error, setError] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage("")
    setError(false)

  const formData = new FormData(e.currentTarget)
   
  try {
   
    const result = await registerUser(formData)

    if (result.success) {
    setMensaje(result.message)
    setError(false)

   

  } else {
        setErrorMessage(result.message)
        setError(true)
        setMensaje("")
    }
}catch (error) {
    console.error("Error al registrar usuario:", error)
   
  }

  
}

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
             
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
                
                {/* Mobile header */}
                <motion.div variants={itemVariants} className="lg:hidden flex items-center justify-center space-x-3 mb-8">
                                    <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                                        <Image
                                            src="/logos/logoIngles.jpg"
                                            alt="Triunfando con el Inglés Logo"
                                            fill
                                            className="object-contain"
                                            priority
                                        />
                                    </div>
                                    <h1 className="text-xl font-bold text-[#00246a] text-center">Triunfando con el Inglés</h1>
                                </motion.div>

                {/* Header */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-[#00246a] mb-2">Crea tu cuenta</h2>
                    <p className="text-slate-600">Comienza tu aventura aprendiendo inglés</p>
              
                </motion.div>
                 
             
                {/* Form */}
                {
                    error && (
                        <motion.div
                            variants={itemVariants}
                            className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 text-center"
                        >
                            {errorMessage}
                        </motion.div>
                    )
                   }
                   {
                    mensaje && (
                        <motion.div
                            variants={itemVariants}
                            className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 text-center"
                        >
                            {mensaje}
                        </motion.div>
                    )
                   }
               
                <form className="space-y-6"
                       onSubmit={handleSubmit}
                >
                   
                    <motion.div variants={itemVariants} className="  gap-4">
                        <div className="space-y-2">
                            <label htmlFor="firstName" className="block text-sm font-medium text-[#00246a]">
                                Nombre
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                 name="nombre"
                                placeholder="Juan"
                                className="w-full h-12 px-4 border border-slate-200 focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10 transition-all duration-200 rounded-xl bg-white text-[#00246a] placeholder-slate-400"
                            />
                        </div>
                        
                    </motion.div>
                    <motion.div variants={itemVariants} className="grid grid-cols-2  gap-4">
                        <div className="space-y-2">
                            <label htmlFor="firstName" className="block text-sm font-medium text-[#00246a]">
                                Apellido Paterno
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                 name="apellidoPaterno"
                                placeholder="Pérez"
                                className="w-full h-12 px-4 border border-slate-200 focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10 transition-all duration-200 rounded-xl bg-white text-[#00246a] placeholder-slate-400"
                            />
                        </div>
                       <div className="space-y-2">
                            <label htmlFor="lastName" className="block text-sm font-medium text-[#00246a]">
                                Apellido materno
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                name="apellidoMaterno"
                                placeholder="Gómez"
                                className="w-full h-12 px-4 border border-slate-200 focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10 transition-all duration-200 rounded-xl bg-white text-[#00246a] placeholder-slate-400"
                            />
                        </div>
                        
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                        <label htmlFor="registerEmail" className="block text-sm font-medium text-[#00246a]">
                            Correo electrónico
                        </label>
                        <input
                            id="registerEmail"
                            type="email"
                            name="email"
                            placeholder="tu@email.com"
                            className="w-full h-12 px-4 border border-slate-200 focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10 transition-all duration-200 rounded-xl bg-white text-[#00246a] placeholder-slate-400"
                        />
                    </motion.div>
                    <motion.div variants={itemVariants} className="space-y-2">
                        <label htmlFor="telefono" className="block text-sm font-medium text-[#00246a]">
                            Teléfono
                        </label>
                        <input
                            id="telefono"
                            type="tel"
                            name="telefono"
                            placeholder="123-456-7890"
                            className="w-full h-12 px-4 border border-slate-200 focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10 transition-all duration-200 rounded-xl bg-white text-[#00246a] placeholder-slate-400"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                        <label htmlFor="registerPassword" className="block text-sm font-medium text-[#00246a]">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                name="password"
                                id="registerPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full h-12 px-4 pr-12 border border-slate-200 focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10 transition-all duration-200 rounded-xl bg-white text-[#00246a] placeholder-slate-400"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-slate-400" />
                                )}
                            </button>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#00246a]">
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <input
                                name="confirmPassword"
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full h-12 px-4 pr-12 border border-slate-200 focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10 transition-all duration-200 rounded-xl bg-white text-[#00246a] placeholder-slate-400"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-slate-400" />
                                )}
                            </button>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-3">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-[#e30f28] focus:ring-[#e30f28]/20 mt-1"
                            />
                            <span className="text-sm text-slate-600 leading-relaxed">
                                Acepto los{" "}
                                <a href="#" className="text-[#e30f28] hover:text-[#e30f28]/80 transition-colors font-medium">
                                    términos y condiciones
                                </a>{" "}
                                y la{" "}
                                <a href="#" className="text-[#e30f28] hover:text-[#e30f28]/80 transition-colors font-medium">
                                    política de privacidad
                                </a>
                            </span>
                        </label>

                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-[#e30f28] focus:ring-[#e30f28]/20 mt-1"
                            />
                            <span className="text-sm text-slate-600">Quiero recibir noticias y ofertas especiales por email</span>
                        </label>
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        type="submit"
                        className="w-full h-12 bg-[#e30f28] hover:bg-[#e30f28]/90 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        Crear Cuenta
                    </motion.button>
                </form>

                {/* Divider */}
                <motion.div variants={itemVariants} className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-slate-500">O regístrate con</span>
                    </div>
                </motion.div>

                {/* Social buttons */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-8">
                    <button className="h-12 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 rounded-xl flex items-center justify-center space-x-2 text-slate-700">
                        <svg className="w-5 h-5 text-[#e30f28]" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="text-sm font-medium">Google</span>
                    </button>
                    <button className="h-12 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 rounded-xl flex items-center justify-center space-x-2 text-slate-700">
                        <svg className="w-5 h-5 text-[#3268d4]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span className="text-sm font-medium">Facebook</span>
                    </button>
                </motion.div>

                {/* Toggle */}
                <motion.div variants={itemVariants} className="text-center">
                    <p className="text-slate-600">
                        ¿Ya tienes una cuenta?{" "}
                        <button
                            onClick={toggleMode}
                            className="text-[#e30f28] hover:text-[#e30f28]/80 transition-colors font-medium hover:underline"
                        >
                            Inicia sesión aquí
                        </button>
                    </p>
                </motion.div>
            </div>
        </motion.div>
    )
}
