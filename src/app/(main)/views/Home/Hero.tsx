"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { CheckCircle, Users, BookOpen, Clock } from "lucide-react"
import Image from "next/image"
import TextType from "@/components/TextType"

const PARTICLES = [
  { id: 0, x: -120, y: 80, size: 8, duration: 3.5, delay: 0.5 },
  { id: 1, x: 150, y: -100, size: 6, duration: 4, delay: 1 },
  { id: 2, x: -80, y: -150, size: 10, duration: 3, delay: 0.2 },
  { id: 3, x: 180, y: 120, size: 7, duration: 4.5, delay: 1.5 },
  { id: 4, x: -180, y: -50, size: 9, duration: 3.8, delay: 0.8 },
  { id: 5, x: 100, y: 150, size: 5, duration: 4.2, delay: 0.3 },
  { id: 6, x: -150, y: 100, size: 11, duration: 3.2, delay: 1.2 },
  { id: 7, x: 50, y: -180, size: 6.5, duration: 4.8, delay: 0.6 },
  { id: 8, x: -50, y: 180, size: 8.5, duration: 3.6, delay: 1.8 },
  { id: 9, x: 200, y: -80, size: 7.5, duration: 4.3, delay: 0.9 },
  { id: 10, x: -200, y: 150, size: 10.5, duration: 3.4, delay: 1.4 },
  { id: 11, x: 120, y: -120, size: 6.8, duration: 4.6, delay: 0.4 },
  { id: 12, x: -100, y: -100, size: 9.5, duration: 3.9, delay: 1.6 },
  { id: 13, x: 160, y: 80, size: 7.2, duration: 4.1, delay: 0.7 },
  { id: 14, x: -160, y: -120, size: 8.8, duration: 3.7, delay: 1.1 },
]

export function Hero() {
  const [isHoveredStart, setIsHoveredStart] = useState(false)
  const [isHoveredCourses, setIsHoveredCourses] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const stats = [
    { value: "98%", label: "Éxito", color: "#E30F28", delay: 1.1 },
    { value: "15+", label: "Años", color: "#00246A", delay: 1.2 },
    { value: "24/7", label: "Soporte", color: "#E30F28", delay: 1.3 },
  ]

  const features = [
    { icon: CheckCircle, title: "Certificación", subtitle: "Internacional", bgColor: "rgba(227, 15, 40, 0.05)", iconBg: "#E30F28" },
    { icon: Users, title: "Profesores", subtitle: "Certificados", bgColor: "rgba(0, 36, 106, 0.05)", iconBg: "#00246A" },
    { icon: BookOpen, title: "Clases", subtitle: "Personalizadas", bgColor: "rgba(227, 15, 40, 0.05)", iconBg: "#E30F28" },
    { icon: Clock, title: "Horarios", subtitle: "Flexibles", bgColor: "rgba(0, 36, 106, 0.05)", iconBg: "#00246A" },
  ]

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 pb-32">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          {/* Logo Section with Animations */}
          <motion.div
            className="relative flex items-center justify-center -ml-8 lg:-ml-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Background Glow */}
            <motion.div
              className="absolute inset-0 rounded-full blur-3xl opacity-20"
              style={{ background: "radial-gradient(circle, #E30F28 0%, #00246A 100%)" }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            {/* Floating Particles */}
            {isMounted && PARTICLES.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.id % 2 === 0 ? "#E30F28" : "#00246A",
                  left: "50%",
                  top: "50%",
                }}
                animate={{
                  x: [0, particle.x, 0],
                  y: [0, particle.y, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: particle.delay,
                  ease: "easeInOut",
                }}
              />
            ))}

            {/* Concentric Circles */}
            <motion.div
              className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 opacity-20"
              style={{ borderColor: "#00246A" }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 opacity-20"
              style={{ borderColor: "#E30F28" }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                delay: 1.5,
                ease: "easeInOut",
              }}
            />

            {/* Logo */}
            <motion.div
              className="relative z-10 w-48 h-48 sm:w-64 sm:h-64 rounded-full flex items-center justify-center shadow-2xl overflow-hidden"
              style={{ backgroundColor: "" }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/logos/TCEILogo.png"
                alt="TCE - Triunfando con el Inglés"
                width={256}
                height={256}
                className="w-full h-full object-cover"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Text and CTAs Section */}
          <motion.div
            className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <TextType
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-[#00246A] dark:text-blue-400"
            text={["Bienvenido!!!", "Listo para aprender inglés?", "Triunfando con el Inglés!"]}
            typingSpeed={115}
            pauseDuration={2500}
            showCursor={true}
            cursorCharacter="•"
            />

            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 shadow-lg"
              style={{
                background: "linear-gradient(135deg, rgba(227, 15, 40, 0.1) 0%, rgba(0, 36, 106, 0.1) 100%)",
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: "#E30F28",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-2.5 h-2.5 rounded-full shadow-lg"
                style={{ backgroundColor: "#E30F28", boxShadow: "0 0 10px rgba(227, 15, 40, 0.6)" }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              />
              <span className="text-sm font-bold text-[#00246A] dark:text-blue-300">
                Tu mejor opción para aprender inglés
              </span>
            </motion.div>

            <motion.p
              className="text-xl sm:text-2xl lg:text-3xl mb-6 font-semibold leading-relaxed text-[#00246A] dark:text-blue-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Domina el inglés y alcanza tus metas
            </motion.p>

            {/* Description Text */}
            <motion.p
              className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
            >
              Aprende inglés de manera efectiva con clases en vivo, profesores certificados y un método probado que ha transformado la vida de miles de estudiantes. ¡Tu camino hacia la fluidez comienza aquí!
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.button
                className="relative px-10 py-4 rounded-xl font-bold text-lg text-white overflow-hidden group"
                style={{
                  backgroundColor: "#E30F28",
                  boxShadow: isHoveredStart ? "0 10px 40px rgba(0, 36, 106, 0.4)" : "0 8px 25px rgba(227, 15, 40, 0.4)",
                }}
                onMouseEnter={() => setIsHoveredStart(true)}
                onMouseLeave={() => setIsHoveredStart(false)}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ backgroundColor: "#00246A" }}
                  initial={{ x: "-100%" }}
                  animate={{ x: isHoveredStart ? "0%" : "-100%" }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Comienza ahora
                  <motion.span animate={{ x: isHoveredStart ? 5 : 0 }} transition={{ duration: 0.3 }}>
                    →
                  </motion.span>
                </span>
              </motion.button>

              <motion.button
                className="relative px-10 py-4 rounded-xl font-bold text-lg border-2 overflow-hidden group"
                style={{
                  backgroundColor: isHoveredCourses ? "#00246A" : "white",
                  borderColor: "#00246A",
                  color: isHoveredCourses ? "white" : "#00246A",
                  boxShadow: isHoveredCourses
                    ? "0 10px 40px rgba(0, 36, 106, 0.3)"
                    : "0 4px 15px rgba(0, 36, 106, 0.15)",
                }}
                onMouseEnter={() => setIsHoveredCourses(true)}
                onMouseLeave={() => setIsHoveredCourses(false)}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">Ver cursos</span>
              </motion.button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-3 gap-4 w-full mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="relative p-4 rounded-2xl text-center overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}1A 0%, ${stat.color}0D 100%)`,
                    border: `2px solid ${stat.color}33`,
                  }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30"
                    style={{ backgroundColor: stat.color }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: index }}
                  />
                  <motion.div
                    className="text-3xl sm:text-4xl font-black mb-1 relative z-10"
                    style={{ color: stat.color }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: stat.delay }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 relative z-10">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: feature.bgColor }}
                    whileHover={{ scale: 1.03, x: 5 }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: feature.iconBg }}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="font-bold text-sm block text-[#00246A] dark:text-blue-300">
                        {feature.title}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{feature.subtitle}</span>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
    
  )
}
