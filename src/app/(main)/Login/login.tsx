"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import {useRouter} from "next/navigation"
import { signIn } from "next-auth/react"


import { getRedirectPath } from "@/actions/auth/redirectLogin"
import Loader from "@/components/Loader"
import Link from "next/link"
interface LoginFormProps {
    toggleMode: () => void
}


export default  function LoginForm({ toggleMode }: LoginFormProps) {
 


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
      const [showPassword, setShowPassword] = useState(false)
  

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log('🔐 Attempting login for:', email);
      
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      

      if (res?.error) {
         const cleanError = res.error.replace(/^Error:\s*/, "");

        setError(cleanError);
        setLoading(false);
      } else if (res?.ok) {
        console.log('✅ Login successful, getting redirect path...');

        const path = await getRedirectPath();
        console.log('🔄 Redirecting to:', path);

        router.replace(path);
      } else {
        console.log('⚠️ Unexpected login response:', res);
        setError("Error inesperado durante el inicio de sesión");
        setLoading(false);
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setError("Error de conexión. Intenta nuevamente.");
      setLoading(false);
    }
  }


  
  
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
                    <h2 className="text-2xl font-bold text-[#00246a] mb-2">Bienvenido de vuelta</h2>
                    <p className="text-slate-600">Continúa tu viaje de aprendizaje</p>
                </motion.div>
                   {
                    loading && <Loader />
                   }
                   {
                    error && (
                        <motion.div
                            variants={itemVariants}
                            className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 text-center"
                        >
                            {error
                            }
                        </motion.div>
                    )
                   }

                {/* Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <motion.div variants={itemVariants} className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-[#00246a]">
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                              onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            name="email"
                            placeholder="tu@email.com"
                            className="w-full h-12 px-4 border border-[#00246a] focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10 transition-all duration-200 rounded-xl bg-white text-[#00246a] placeholder-slate-400"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-[#00246a]">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                value={password}
                                name="password"
                                onChange={(e) => setPassword(e.target.value)}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full h-12 px-4 pr-12 border border-[#00246a] focus:border-[#e30f28] focus:ring-2 focus:ring-[#e30f28]/10 transition-all duration-200 rounded-xl bg-white text-[#00246a] placeholder-slate-400"
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

                    <motion.div variants={itemVariants} className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#e30f28] focus:ring-[#e30f28]/20" />
                            <span className="text-slate-600">Recordarme</span>
                        </label>
                        <Link href="/Login/olvide-password" className="text-[#e30f28] hover:text-[#e30f28]/80 transition-colors">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        onClick={handleSubmit}
                        type="submit"
                        className="w-full h-12 bg-[#e30f28] hover:bg-[#e30f28]/90 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        Iniciar Sesión
                    </motion.button>
                </form>

                {/* Divider */}
                <motion.div variants={itemVariants} className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-slate-500">O continúa con</span>
                    </div>
                </motion.div>

                {/* Inicio de sesión con Google y Facebook */}
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
                        ¿No tienes una cuenta?{" "}
                        <button
                            onClick={toggleMode}
                            className="text-[#e30f28] hover:text-[#e30f28]/80 transition-colors font-medium hover:underline"
                        >
                            Regístrate aquí
                        </button>
                    </p>

                         
                           
                    <p className="  ">
                        o
                    </p>
                    
                    
                    <Link
                     href="/Login/solicitar-token"
                    className="text-slate-600">
                   
                   <span className="text-[#e30f28] hover:text-[#e30f28]/80 transition-colors font-medium hover:underline">solicita un nuevo token</span>
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    )
}

