"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true)
    const [isAnimating, setIsAnimating] = useState(true)
    const [logoLoaded, setLogoLoaded] = useState(false)

    useEffect(() => {
        const fadeTimer = setTimeout(() => {
            setIsAnimating(false)
        }, 2800)

        const removeTimer = setTimeout(() => {
            setIsVisible(false)
        }, 3800)

        return () => {
            clearTimeout(fadeTimer)
            clearTimeout(removeTimer)
        }
    }, [])

    if (!isVisible) return null

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-900 transition-all duration-1000 ${isAnimating ? "opacity-100" : "opacity-0"
                }`}
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Main gradient orbs */}
                <div
                    className={`absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#00246a]/10 dark:from-[#00246a]/20 via-blue-200/5 dark:via-blue-900/10 to-transparent rounded-full blur-3xl transition-all duration-[3000ms] ease-out ${isAnimating ? "scale-100 rotate-0" : "scale-150 rotate-45"
                        }`}
                />
                <div
                    className={`absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-[#e30f28]/10 dark:from-[#e30f28]/20 via-red-200/5 dark:via-red-900/10 to-transparent rounded-full blur-3xl transition-all duration-[3000ms] ease-out ${isAnimating ? "scale-100 rotate-0" : "scale-150 -rotate-45"
                        }`}
                />

                {/* Floating particles */}
                <div className="absolute inset-0">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className={`absolute w-2 h-2 bg-gradient-to-r from-[#00246a]/20 dark:from-[#00246a]/40 to-[#e30f28]/20 dark:to-[#e30f28]/40 rounded-full animate-bounce`}
                        />
                    ))}
                </div>
            </div>

            {/* Main content container */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Enhanced glow effect */}
                <div
                    className={`absolute inset-0 -m-16 bg-gradient-to-r from-[#00246a]/20 dark:from-[#00246a]/30 via-blue-400/10 dark:via-blue-400/20 to-[#e30f28]/20 dark:to-[#e30f28]/30 rounded-full blur-3xl transition-all duration-[2000ms] ease-out ${isAnimating ? "opacity-60 scale-100" : "opacity-0 scale-[2]"
                        }`}
                />

                {/* Logo container with enhanced animations */}
                <div
                    className={`relative transition-all duration-[2000ms] ease-out ${isAnimating ? "scale-100 opacity-100 rotate-0" : "scale-110 opacity-0 rotate-6"
                        }`}
                >
                    {/* Outer glow ring - reducido */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#00246a]/15 dark:from-[#00246a]/30 via-transparent to-[#e30f28]/15 dark:to-[#e30f28]/30 rounded-full animate-spin duration-[25000ms]" />

                    {/* Shadow layers for depth - más sutiles */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/8 dark:from-black/20 to-transparent rounded-2xl blur-xl transform translate-y-2" />
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/12 dark:from-black/30 to-transparent rounded-2xl blur-lg transform translate-y-1" />

                    {/* Main logo container */}
                    <div className="relative">
                        <div className="relative">
                            <Image
                                src="/logos/TCEILogo.png"
                                alt="TCEI English Institute"
                                width={280}
                                height={280}
                                priority
                                className={`transition-all duration-1000 rounded-full ${logoLoaded ? "animate-pulse" : "opacity-50"
                                    }`}
                                onLoad={() => setLogoLoaded(true)}
                            />
                        </div>
                    </div>
                </div>

                <div
                    className={`mt-6 sm:mt-8 md:mt-10 px-4 text-center max-w-lg mx-auto transition-all duration-[1500ms] delay-300 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                        }`}
                >
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-2">
                        <span className="bg-gradient-to-r from-[#00246a] via-[#003588] to-[#003d9e] dark:from-blue-400 dark:via-blue-500 dark:to-blue-600 bg-clip-text text-transparent">
                            Triunfando con{" "}
                        </span>
                        <span className="bg-gradient-to-r from-[#e30f28] via-[#f91942] to-[#ff1f3d] dark:from-red-400 dark:via-red-500 dark:to-red-600 bg-clip-text text-transparent">
                            el Inglés
                        </span>
                    </h1>
                    
                    <div className="mt-4 sm:mt-5 space-y-2">
                        <p className="text-gray-700 dark:text-gray-200 font-semibold text-base sm:text-lg md:text-xl">
                            Transformando vidas a través del inglés
                        </p>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed">
                            Instituto de excelencia académica
                        </p>
                        
                        {/* Decorative separator */}
                        <div className="flex items-center justify-center gap-3 mt-4 sm:mt-5">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#00246a]/40 dark:via-blue-400/40 to-transparent" />
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00246a] to-[#e30f28] dark:from-blue-500 dark:to-red-500 shadow-lg" />
                            <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#e30f28]/40 dark:via-red-400/40 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`absolute bottom-12 sm:bottom-16 md:bottom-20 transition-all duration-500 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#00246a] dark:bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#e30f28] dark:bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#00246a] dark:bg-blue-500 rounded-full animate-bounce" />
                    </div>
                </div>
            </div>
        </div>
    )
}
