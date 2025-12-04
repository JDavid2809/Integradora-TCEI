"use client"

import Image from "next/image"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, ArrowRight } from "lucide-react"
import Lottie from "lottie-react"
import { useState, useEffect, useRef } from "react"
import { useInView } from "framer-motion"

export function Footer() {
    const currentYear = new Date().getFullYear()
    const [animationData, setAnimationData] = useState<any>(null)
    const [loopCount, setLoopCount] = useState(0)
    const containerRef = useRef(null)
    const lottieRef = useRef<any>(null)
    const isInView = useInView(containerRef, { amount: 0.5, once: true })

    useEffect(() => {
        if (isInView && lottieRef.current && loopCount === 0) {
            lottieRef.current.goToAndPlay(45, true)
        }
    }, [isInView, loopCount])

    useEffect(() => {
        fetch('/animaciones/animacion_saludo_mascota.json')
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error("Failed to load footer animation:", err))
    }, [])


    const quickLinks = [
        { name: "Inicio", href: "/" },
        { name: "Cursos", href: "/Courses" },
        { name: "Nosotros", href: "/about" },
        { name: "Testimonios", href: "/testimonials" },
    ]

    const courses = [
        { name: "Inglés Básico", href: "/courses/basic" },
        { name: "Inglés Intermedio", href: "/courses/intermediate" },
        { name: "Inglés Avanzado", href: "/courses/advanced" },
        { name: "Preparación TOEFL", href: "/courses/toefl" },
    ]

    const socialLinks = [
        { name: "Facebook", icon: Facebook, href: "#" },
        { name: "Instagram", icon: Instagram, href: "#" },
        { name: "Twitter", icon: Twitter, href: "#" },
        { name: "LinkedIn", icon: Linkedin, href: "#" },
    ]

    return (
        <footer className="bg-white dark:bg-slate-950 relative transition-colors duration-300">
            {/* Simple Gray Border */}
            <div className="bg-gray-300 dark:bg-slate-800 h-px"></div>

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Logo and Social Section */}
                <div className="text-center mb-16">
                    {/* Logo with Background */}
                    <div className="inline-block mb-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00246A]/5 to-[#E30F28]/5 rounded-full blur-2xl scale-150"></div>
                        <div ref={containerRef} className="relative bg-white p-4 rounded-full shadow-xl border-4 border-gray-100 w-[150px] h-[150px] flex items-center justify-center overflow-hidden">
                            {animationData ? (
                                <div className="w-[120%] h-[120%] -mt-2">
                                    <Lottie 
                                        lottieRef={lottieRef}
                                        animationData={animationData} 
                                        loop={false}
                                        autoplay={false}
                                        initialSegment={[45, 90]}
                                        onComplete={() => {
                                            if (loopCount < 2) {
                                                setLoopCount(prev => prev + 1)
                                                lottieRef.current?.goToAndPlay(45, true)
                                            }
                                        }}
                                        className="w-full h-full"
                                    />
                                </div>
                            ) : (
                                <Image
                                    src="/logos/TCEILogo.png"
                                    alt="TCEI - Triunfando con el Inglés"
                                    width={120}
                                    height={120}
                                    className="mx-auto"
                                />
                            )}
                        </div>
                    </div>

                    <h3 className="text-3xl font-black text-[#00246A] dark:text-blue-100 mb-3">
                        Triunfando con el Inglés
                    </h3>
                    {/* Social Media Links */}
                    <div className="flex justify-center gap-4 mb-4">
                        {socialLinks.map((social) => {
                            const Icon = social.icon
                            return (
                                <Link
                                    key={social.name}
                                    href={social.href}
                                    className="group relative w-14 h-14 bg-gradient-to-br from-[#00246A] to-[#003080] dark:from-blue-600 dark:to-blue-800 rounded-2xl flex items-center justify-center hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:-rotate-6"
                                    aria-label={social.name}
                                >
                                    <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#00246A] dark:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-10">
                                        {social.name}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00246A] dark:bg-blue-700 rotate-45"></div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Quick Links */}
                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl border-2 border-gray-100 dark:border-slate-700 hover:border-[#E30F28] dark:hover:border-red-500 transition-all hover:shadow-lg">
                        <h4 className="text-xl font-black text-[#00246A] dark:text-blue-100 mb-6 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-[#E30F28] to-[#00246A] dark:from-red-500 dark:to-blue-500 rounded-full"></div>
                            Enlaces Rápidos
                        </h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-600 dark:text-slate-300 hover:text-[#E30F28] dark:hover:text-red-400 flex items-center gap-2 group transition-all font-medium"
                                    >
                                        <ArrowRight className="w-4 h-4 text-[#00246A] dark:text-blue-400 group-hover:translate-x-1 group-hover:text-[#E30F28] dark:group-hover:text-red-400 transition-all" />
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Courses */}
                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl border-2 border-gray-100 dark:border-slate-700 hover:border-[#00246A] dark:hover:border-blue-500 transition-all hover:shadow-lg">
                        <h4 className="text-xl font-black text-[#00246A] dark:text-blue-100 mb-6 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-[#00246A] to-[#E30F28] dark:from-blue-500 dark:to-red-500 rounded-full"></div>
                            Nuestros Cursos
                        </h4>
                        <ul className="space-y-3">
                            {courses.map((course) => (
                                <li key={course.name}>
                                    <Link
                                        href={course.href}
                                        className="text-gray-600 dark:text-slate-300 hover:text-[#00246A] dark:hover:text-blue-400 flex items-center gap-2 group transition-all font-medium"
                                    >
                                        <ArrowRight className="w-4 h-4 text-[#E30F28] dark:text-red-400 group-hover:translate-x-1 group-hover:text-[#00246A] dark:group-hover:text-blue-400 transition-all" />
                                        {course.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl border-2 border-gray-100 dark:border-slate-700 hover:border-[#E30F28] dark:hover:border-red-500 transition-all hover:shadow-lg">
                        <h4 className="text-xl font-black text-[#00246A] dark:text-blue-100 mb-6 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-[#E30F28] to-[#00246A] dark:from-red-500 dark:to-blue-500 rounded-full"></div>
                            Contacto
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-600 dark:text-slate-300 group hover:text-[#E30F28] dark:hover:text-red-400 transition-colors">
                                <div className="w-10 h-10 bg-[#E30F28] dark:bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold mb-1">Email</p>
                                    <a href="mailto:info@tce.com" className="font-medium">
                                        info@tce.com
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600 dark:text-slate-300 group hover:text-[#00246A] dark:hover:text-blue-400 transition-colors">
                                <div className="w-10 h-10 bg-[#00246A] dark:bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold mb-1">Teléfono</p>
                                    <a href="tel:+1234567890" className="font-medium">
                                        +123 456 7890
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-gray-600 dark:text-slate-300">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#E30F28] to-[#00246A] dark:from-red-600 dark:to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold mb-1">Ubicación</p>
                                    <span className="font-medium">Ciudad, País</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t-2 border-gray-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <p className="text-gray-600 dark:text-slate-400 font-medium">
                            © {currentYear} <span className="text-[#00246A] dark:text-blue-300 font-bold">TCE - Triunfando con el Inglés</span>. Todos los derechos reservados.
                        </p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="text-gray-600 dark:text-slate-400 hover:text-[#E30F28] dark:hover:text-red-400 transition-colors font-medium">
                                Política de Privacidad
                            </Link>
                            <Link href="/terms" className="text-gray-600 dark:text-slate-400 hover:text-[#00246A] dark:hover:text-blue-400 transition-colors font-medium">
                                Términos y Condiciones
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
