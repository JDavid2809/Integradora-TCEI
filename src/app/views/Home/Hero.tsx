"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import Image from "next/image"

const slides = [
  {
    id: 1,
    badge: "¡Nuevo!",
    title: "Domina el Inglés con Confianza",
    subtitle:
      "Aprende inglés de forma práctica y efectiva con nuestros cursos interactivos diseñados para hispanohablantes",
    image: "/logos/logoIngles1.jpg",
    cta: "Empieza Gratis",
  },
  {
    id: 2,
    badge: "Certificado",
    title: "Profesores Nativos Expertos",
    subtitle: "Clases en vivo con instructores certificados que te guiarán paso a paso hacia la fluidez completa",
    image: "/logos/logoIngles1.jpg",
    cta: "Ver Profesores",
  },
  {
    id: 3,
    badge: "Reconocido",
    title: "Certificación Internacional",
    subtitle: "Obtén certificados reconocidos mundialmente que impulsen tu carrera profesional al siguiente nivel",
    image: "/logos/logoIngles1.jpg",
    cta: "Conoce Más",
  },
]

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <>
      <section className="relative h-[600px] md:h-screen overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            <div className="relative h-full">
              {/* Background Image with Responsive Overlay */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.title}
                  width={1920}
                  height={1080}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/85 to-white/70 md:to-transparent md:via-white/80"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
                  }}
                  data-desktop-clip="polygon(0 0, 65% 0, 45% 100%, 0% 100%)"
                ></div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex items-center justify-center md:justify-start">
                <div className="max-w-2xl px-6 md:px-16 space-y-4 md:space-y-8 text-center md:text-left">
                  {/* Badge */}
                  <div className="inline-block animate-pulse">
                    <span className="bg-[#e30f28] text-white px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-bold shadow-lg border-2 border-white">
                      {slide.badge}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#00246a] leading-tight text-balance drop-shadow-sm">
                    {slide.title}
                  </h1>

                  <p className="text-base md:text-xl text-gray-700 leading-relaxed text-pretty font-medium">
                    {slide.subtitle}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center md:justify-start">
                    <button className="bg-[#e30f28] hover:bg-[#c20e24] text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2">
                      <Play className="w-4 h-4 md:w-5 md:h-5" />
                      {slide.cta}
                    </button>
                    <button className="bg-white hover:bg-gray-50 text-[#00246a] px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 border-2 border-[#00246a]">
                      Ver Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-4 z-20">
          <button
            onClick={prevSlide}
            className="w-14 h-14 bg-[#e30f28] hover:bg-[#c20e24] rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="w-14 h-14 bg-[#e30f28] hover:bg-[#c20e24] rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="absolute bottom-20 md:bottom-8 left-1/2 md:left-auto md:right-8 -translate-x-1/2 md:translate-x-0 flex gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full shadow-lg hover:scale-125 ${
                index === currentSlide ? "w-10 h-3 bg-[#e30f28] shadow-xl" : "w-3 h-3 bg-[#00246a] hover:bg-white"
              }`}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 w-full">
          <svg className="w-full h-20 md:h-32 lg:h-40" viewBox="0 0 1440 200" preserveAspectRatio="none">
            <path
              d="M0,100 C120,140 240,160 360,140 C480,120 600,80 720,100 C840,120 960,160 1080,140 C1200,120 1320,100 1440,120 L1440,200 L0,200 Z"
              className="fill-white"
            />
          </svg>
        </div>
      </section>
    </>
  )
}
