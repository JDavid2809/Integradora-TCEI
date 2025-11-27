"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useState } from "react"

export function Benefist() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          {/* Left: Headline */}
          <div className="space-y-8">
            <div className="inline-block">
              <p className="text-[#e30f28] text-sm font-bold uppercase tracking-wider bg-[#e30f28]/10 px-4 py-2 rounded-full">
                Líderes en educación de inglés online
              </p>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-[#00246a] leading-[1.1] text-balance">
              ¿Por qué elegir nuestra plataforma de inglés?
            </h1>
            <div className="h-1 w-24 bg-[#e30f28]"></div>
          </div>

          {/* Right: Laptop Mockup */}
          <div className="relative -ml-8 lg:-ml-16">
            <img 
              src="/logos/deviceframes.png" 
              alt="Plataforma de inglés en laptop" 
              className="relative w-full h-auto transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <FeatureCard
            color="#e30f28"
            icon={
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            }
            title="Clases de inglés en vivo ilimitadas 24/7"
            description="Conéctate a nuestras clases, que empiezan cada 30 minutos, desde tu computador o nuestra app."
          />

          {/* Feature 2 */}
          <FeatureCard
            color="#00246a"
            icon={
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            title="Estudia con profesores nativos"
            description="Aprende con un método de inmersión en inglés y expertos de pronunciación nativa."
          />

          {/* Feature 3 */}
          <FeatureCard
            color="#e30f28"
            icon={
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            title="Prepárate para el TOEFL, TOEIC, IELTS"
            description="Disfruta de un portal incluido en tu curso que te prepara para estos exámenes sin costo adicional."
          />

          {/* Feature 4 */}
          <FeatureCard
            color="#00246a"
            icon={
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 014.438 0 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            }
            title="Obtén tu certificado en cada nivel"
            description="Recibe un certificado basado en los niveles del Marco Común Europeo de Referencia (MCER)."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  color,
  icon,
  title,
  description,
}: {
  color: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    
    <div
      className="relative overflow-hidden bg-white rounded-2xl shadow-lg cursor-pointer border border-gray-100"
      style={{ height: "280px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: color }}></div>

      <motion.div
        className="relative z-20 pt-12 pb-6 px-8 flex flex-col items-center text-center"
        animate={{
          opacity: isHovered ? 0 : 1,
          y: isHovered ? -20 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mb-6"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <h3 className="text-xl font-bold text-[#00246a] leading-tight">{title}</h3>
      </motion.div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center p-8 text-center"
        style={{ backgroundColor: color }}
        initial={{ y: "-100%" }}
        animate={{
          y: isHovered ? 0 : "-100%",
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <p className="text-white text-base leading-relaxed font-medium">{description}</p>
      </motion.div>
    </div>
  )
}
