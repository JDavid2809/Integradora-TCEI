"use client"

import { motion } from "framer-motion"
import { Play, Sparkles, Zap, Brain, Globe, ArrowRight } from "lucide-react"

export default function Hero() {
    return (
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Fondo con formas geométricas animadas */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-red-50/20">
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                    className="absolute top-20 left-20 w-96 h-96 opacity-10"
                    style={{
                        background: "conic-gradient(from 0deg, #e30f28, #00246a, #e30f28)",
                        clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                    }}
                />

                <motion.div
                    animate={{
                        rotate: [360, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                    className="absolute bottom-32 right-32 w-64 h-64 opacity-10"
                    style={{
                        background: "linear-gradient(45deg, #00246a, #e30f28)",
                        clipPath: "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)",
                    }}
                />

                {/* Partículas flotantes */}
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -100, 0],
                            x: [0, Math.sin(i) * 50, 0],
                            opacity: [0.2, 0.8, 0.2],
                            scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 8 + i * 0.5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                            delay: i * 0.3,
                        }}
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                            background: i % 2 === 0 ? "#e30f28" : "#00246a",
                            left: `${10 + i * 8}%`,
                            top: `${20 + (i % 3) * 20}%`,
                        }}
                    />
                ))}
            </div>

            <div className="max-w-8xl mx-auto px-8 lg:px-12 grid lg:grid-cols-2 gap-20 items-center relative z-10">
                {/* Contenido principal */}
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="space-y-12"
                >
                    {/* Badge futurista */}

                    {/* Título principal con efectos únicos */}
                    <div className="space-y-8">
                        <motion.h1
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="text-6xl lg:text-8xl font-black leading-none tracking-tighter"
                        >
                            <span className="block" style={{ color: "#00246a" }}>
                                DOMINA
                            </span>
                            <span className="block bg-gradient-to-r from-red-500 to-blue-900 bg-clip-text text-transparent">
                                INGLÉS
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="text-2xl font-light text-gray-600 leading-relaxed max-w-2xl"
                        >
                            La primera plataforma que usa{" "}
                            <span className="font-bold text-red-500">inteligencia artificial cuántica</span> para acelerar tu
                            aprendizaje 10x más rápido.
                        </motion.p>
                    </div>

                    {/* Botones únicos */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="flex flex-col sm:flex-row gap-6"
                    >
                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 25px 50px rgba(227, 15, 40, 0.3)",
                                y: -5,
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative px-12 py-6 bg-gradient-to-r from-red-500 to-blue-900 text-white font-black text-lg tracking-wider rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                <Zap className="w-6 h-6 mr-3" />
                                COMENZAR AHORA
                                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <motion.div
                                animate={{ x: [-100, 100] }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                            />
                        </motion.button>

                        <motion.button
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                                y: -3,
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="group flex items-center justify-center px-12 py-6 bg-white/30 backdrop-blur-xl border-2 border-white/50 text-gray-800 font-bold text-lg tracking-wider rounded-2xl hover:bg-white/50 transition-all duration-300 shadow-xl"
                        >
                            <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                            VER DEMO IA
                        </motion.button>
                    </motion.div>

                    {/* Stats únicos */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.3, duration: 0.8 }}
                        className="flex items-center space-x-12 pt-8"
                    >
                        {[
                            { icon: Brain, value: "98%", label: "Precisión IA" },
                            { icon: Globe, value: "150+", label: "Países" },
                            { icon: Zap, value: "10x", label: "Más Rápido" },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.5 + index * 0.2, duration: 0.6 }}
                                className="text-center group cursor-pointer"
                            >
                                <div className="flex items-center justify-center mb-2">
                                    <stat.icon className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <div className="text-3xl font-black text-gray-800">{stat.value}</div>
                                <div className="text-sm font-medium text-gray-500 tracking-wide">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Interfaz futurista */}
                <motion.div
                    initial={{ opacity: 0, x: 100, rotateY: -30 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="relative perspective-1000"
                >
                    <div className="relative z-10">
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotateX: [0, 5, 0],
                                rotateY: [0, -5, 0],
                            }}
                            transition={{
                                duration: 6,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                            }}
                            className="bg-white/10 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-white/20 transform-gpu"
                        >
                            {/* Header de la interfaz */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-3">
                                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                                    <div
                                        className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"
                                        style={{ animationDelay: "0.2s" }}
                                    />
                                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                                </div>
                                <div className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white text-sm font-bold rounded-full">
                                    IA ACTIVA
                                </div>
                            </div>

                            {/* Contenido de la lección */}
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Lección Adaptativa</h3>
                                    <p className="text-gray-600">Tus mentores analizan tu progreso en tiempo real</p>
                                </div>

                                <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-200/50">
                                    <p className="text-gray-700 mb-4 font-medium">"Complete with the correct form:"</p>
                                    <p className="text-2xl font-bold text-gray-800">"I _____ studying English for 3 years."</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {["have been", "am", "was", "will be"].map((option, index) => (
                                        <motion.button
                                            key={option}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`p-4 rounded-xl border-2 transition-all duration-300 font-semibold ${index === 0
                                                    ? "border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-500/20"
                                                    : "border-gray-200 bg-white/50 text-gray-600 hover:border-red-500/50 hover:bg-red-50/50"
                                                }`}
                                        >
                                            {option}
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Barra de progreso IA */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Análisis IA</span>
                                        <span className="text-sm font-bold text-green-600">94% Confianza</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "94%" }}
                                            transition={{ duration: 2, delay: 1 }}
                                            className="h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Elementos decorativos 3D */}
                    <motion.div
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                        className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-red-500 to-blue-900 rounded-2xl shadow-2xl"
                        style={{
                            clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                        }}
                    />

                    <motion.div
                        animate={{
                            rotate: [360, 0],
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                        }}
                        className="absolute -bottom-8 -left-8 w-20 h-20 bg-gradient-to-br from-blue-900 to-red-500 rounded-full shadow-2xl opacity-80"
                    />
                </motion.div>
            </div>
        </section>
    )
}
