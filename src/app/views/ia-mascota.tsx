"use client"

import { motion } from "framer-motion"
import { Sparkles, MessageCircle, Zap, BookOpen, Globe, ArrowRight } from "lucide-react"
import Image from "next/image"

const features = [
    {
        icon: MessageCircle,
        title: "Conversación 24/7",
        description: "Practica inglés cuando quieras, sin límites de horario",
    },
    {
        icon: Zap,
        title: "Respuestas Instantáneas",
        description: "Retroalimentación inmediata para acelerar tu aprendizaje",
    },
    {
        icon: BookOpen,
        title: "Adaptativo",
        description: "Se adapta a tu nivel y ritmo de aprendizaje",
    },
    {
        icon: Globe,
        title: "Multicontexto",
        description: "Aprende inglés para negocios, viajes o conversación",
    },
]

export function AiMascotSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#2b2d42] py-20 px-4">
            {/* Gradient orbs background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -50, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:72px_72px]" />

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-16">
                    {/* Left side - Mascot, title, and CTA */}
                    <div className="flex-1 flex flex-col items-center lg:items-start max-w-xl">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
                        >
                            <Sparkles className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-gray-300 font-medium">Impulsado por Inteligencia Artificial</span>
                        </motion.div>

                        {/* Mascot */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative mb-8"
                        >
                            {/* Glow */}
                            <motion.div
                                className="absolute inset-0 rounded-full bg-blue-500/30 blur-3xl"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "easeInOut",
                                }}
                            />

                            {/* Main mascot */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{
                                    duration: 4,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "easeInOut",
                                }}
                                className="relative"
                            >
                                <div className="relative h-64 w-64 lg:h-80 lg:w-80">
                                    {/* Outer ring */}
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-2 border-blue-400/20"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                    />

                                    {/* Inner circle */}
                                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 p-[2px]">
                                        <div className="h-full w-full rounded-full bg-[#2b2d42] flex items-center justify-center overflow-hidden">
                                            <Image
                                                src="/logos/BeaniIA2.png"
                                                alt="Beanie AI Mascot"
                                                width={300}
                                                height={300}
                                                className="w-44 h-52 object-cover scale-110"
                                                priority
                                            />
                                        </div>
                                    </div>

                                    {/* Orbiting dots */}
                                    <motion.div
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 lg:h-96 lg:w-96"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                    >
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-blue-400" />
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-purple-400" />
                                    </motion.div>
                                </div>

                                {/* Status badge */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1, duration: 0.4 }}
                                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20"
                                >
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                                    </span>
                                    <span className="text-xs text-gray-300 font-medium">Always Online</span>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Title */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mb-6 text-center lg:text-left"
                        >
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 text-balance">
                                Conoce a{" "}
                                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
                                    Beanie
                                </span>
                            </h1>
                            <p className="text-xl text-gray-400 max-w-md leading-relaxed">
                                Tu compañero de IA que hace que aprender inglés sea natural y divertido
                            </p>
                        </motion.div>

                    </div>

                    <div className="hidden lg:flex flex-col gap-6 flex-1 max-w-md relative pt-12">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            const colors = index % 2 === 0 
                                ? { bg: 'bg-blue-500/10', border: 'border-blue-500/20', hover: 'group-hover:border-blue-500/40', text: 'text-blue-400' }
                                : { bg: 'bg-purple-500/10', border: 'border-purple-500/20', hover: 'group-hover:border-purple-500/40', text: 'text-purple-400' };
                            const margins = ['ml-0', 'ml-12', 'ml-20', 'ml-12'];
                            const delays = [0.3, 0.4, 0.5, 0.6];
                            
                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: delays[index] }}
                                    whileHover={{ scale: 1.03, x: -5 }}
                                    className={`group relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 ${margins[index]}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border} ${colors.hover} transition-colors`}>
                                            <Icon className={`h-6 w-6 ${colors.text}`} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-semibold text-white text-lg mb-2">{feature.title}</h3>
                                            <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Mobile features grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="lg:hidden grid sm:grid-cols-2 gap-4 mt-12 w-full max-w-2xl"
                    >
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                            >
                                <Icon className="h-7 w-7 text-blue-400 mb-3" />
                                <h3 className="font-semibold text-white text-base mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                            </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
