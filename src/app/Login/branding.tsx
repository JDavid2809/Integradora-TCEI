"use client"

import { motion } from "framer-motion"
import { BookOpen, Users, Award, Brain } from "lucide-react"
import Image from "next/image"

export default function BrandingSection() {
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
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 px-8">
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden">
                        <Image
                            src="/logos/logoIngles.jpg"
                            alt="Triunfando con el Inglés Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[#00246a]">Triunfando con el Inglés</h1>
                    </div>
                </div>

                <p className="text-xl text-slate-700 leading-relaxed">
                    Domina el inglés con nuestra plataforma interactiva diseñada para acelerar tu aprendizaje
                </p>
            </motion.div>

            {/* Features */}
            <motion.div variants={itemVariants} className="space-y-6">
                {[
                    {
                        icon: Users,
                        title: "Clases en vivo",
                        description: "Conecta con profesores nativos y estudiantes de todo el mundo",
                    },
                    {
                        icon: Award,
                        title: "Certificaciones",
                        description: "Obtén certificados reconocidos internacionalmente",
                    },
                    {
                        icon: Brain,
                        title: "Aprendizaje personalizado",
                        description: "Planes adaptados a tu nivel y objetivos",
                    },
                ].map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        className="flex items-start space-x-4 group"
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#e30f28]/10 transition-colors duration-200">
                            <feature.icon className="w-6 h-6 text-slate-600 group-hover:text-[#e30f28] transition-colors duration-200" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-[#00246a] mb-1">{feature.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <p className="text-sm text-slate-600 mb-2">Únete a más de</p>
                <p className="text-3xl font-bold text-[#e30f28] mb-1">50,000+</p>
                <p className="text-sm text-slate-600">estudiantes que ya dominan el inglés</p>
            </motion.div>
        </motion.div>
    )
}
