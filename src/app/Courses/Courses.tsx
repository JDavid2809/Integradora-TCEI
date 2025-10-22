"use client"

import { useState, useEffect } from "react"
import { Search, BookOpen, Play, Award, Globe, X, ChevronLeft, ChevronRight, Users, Clock } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from 'next/navigation'
import { CoursesProps, CourseForDisplay, EnglishLevel, CourseFilters } from '@/types/courses'
import { createSlug } from '@/lib/slugUtils'
import { useCourseConverter } from '@/hooks/useCourseConverter'

const englishLevels: EnglishLevel[] = [
    { value: "all", label: "Todos los niveles" },
    { value: "A1", label: "A1 - Principiante" },
    { value: "A2", label: "A2 - Elemental" },
    { value: "B1", label: "B1 - Intermedio" },
    { value: "B2", label: "B2 - Intermedio Alto" },
    { value: "C1", label: "C1 - Avanzado" },
    { value: "C2", label: "C2 - Maestría" },
]

const modalidadOptions = [
    { value: "all", label: "Todas las modalidades" },
    { value: "PRESENCIAL", label: "Presencial" },
    { value: "ONLINE", label: "Online" },
]



const getLevelColor = (level: string) => {
    const colors = {
        A1: "bg-green-100 text-green-800 border-green-200",
        A2: "bg-blue-100 text-blue-800 border-blue-200",
        B1: "bg-yellow-100 text-yellow-800 border-yellow-200",
        B2: "bg-orange-100 text-orange-800 border-orange-200",
        C1: "bg-purple-100 text-purple-800 border-purple-200",
        C2: "bg-red-100 text-red-800 border-red-200",
    }
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
}

const getModalidadColor = (modalidad: string) => {
    return modalidad === 'ONLINE' 
        ? "bg-blue-100 text-blue-800 border-blue-200"
        : "bg-green-100 text-green-800 border-green-200"
}

export default function Courses({ paginatedData }: CoursesProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [filters, setFilters] = useState<CourseFilters>({
        search: "",
        level: "all",
        modalidad: "all",
        page: 1
    })

    // Función para navegar a los detalles del curso usando slug
    const handlerDetailsCourses = (courseName: string) => {
        const slug = createSlug(courseName)
        router.push(`/Courses/${slug}`)
    }

    // Función para construir URL con parámetros
    const buildURL = (newFilters: CourseFilters) => {
        const params = new URLSearchParams()
        
        if (newFilters.search) params.set('search', newFilters.search)
        if (newFilters.level !== 'all') params.set('level', newFilters.level)
        if (newFilters.modalidad !== 'all') params.set('modalidad', newFilters.modalidad)
        if (newFilters.page > 1) params.set('page', newFilters.page.toString())
        
        const queryString = params.toString()
        return queryString ? `/Courses?${queryString}` : '/Courses'
    }

    // Efecto para sincronizar filtros con URL
    useEffect(() => {
        const searchFromUrl = searchParams?.get('search') || ''
        const levelFromUrl = searchParams?.get('level') || 'all'
        const modalidadFromUrl = searchParams?.get('modalidad') || 'all'
        const pageFromUrl = parseInt(searchParams?.get('page') || '1', 10)
        
        setFilters({
            search: searchFromUrl,
            level: levelFromUrl,
            modalidad: modalidadFromUrl,
            page: pageFromUrl
        })
    }, [searchParams])

    // Convertir cursos usando hook personalizado
    const { convertedCourses, recommendedCourses } = useCourseConverter(paginatedData)

    // Función para resaltar texto de búsqueda
    const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm) return text
        
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        const parts = text.split(regex)
        
        return parts.map((part, index) => 
            regex.test(part) ? 
                <span key={index} className="bg-yellow-200 text-yellow-800 font-medium px-1 rounded">
                    {part}
                </span> : part
        )
    }

    // Los cursos ya vienen filtrados y paginados del servidor
    const displayedCourses = convertedCourses

    // Usar datos de paginación del servidor
    const totalPages = paginatedData.totalPages
    const currentPage = paginatedData.currentPage
    const totalCount = paginatedData.totalCount
    const hasNextPage = paginatedData.hasNextPage
    const hasPrevPage = paginatedData.hasPrevPage

    const updateFilters = (newFilters: Partial<CourseFilters>) => {
        const updatedFilters = { ...filters, ...newFilters, page: 1 }
        router.push(buildURL(updatedFilters))
    }

    const changePage = (newPage: number) => {
        const updatedFilters = { ...filters, page: newPage }
        router.push(buildURL(updatedFilters))
    }

    const CourseCard = ({ course, isRecommended = false }: { course: CourseForDisplay; isRecommended?: boolean }) => (
        <div className="group relative">
            {/* Diseño estilo Udemy con animaciones solo en desktop */}
            <div className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 md:hover:-translate-y-2 border border-gray-100 hover:border-gray-200 h-full flex flex-col">
                
                {/* Imagen optimizada */}
                <div className="relative h-40 sm:h-48 overflow-hidden flex-shrink-0">
                    <Image
                        src={course.image}
                        alt={course.title}
                        width={400}   
                        height={200} 
                        className="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-105"
                    />
                    
                    {/* Overlay sutil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badges estilo Udemy - DINÁMICOS */}
                    <div className="absolute top-2 left-2">
                        {/* Bestseller dinámico basado en estudiantes */}
                        {course.students > 15 && (
                            <div className="bg-[#a435f0] text-white px-2 py-1 rounded text-xs font-bold mb-1">
                                Bestseller
                            </div>
                        )}
                        {/* Nuevo badge basado en rating */}
                        {course.rating && course.rating >= 4.8 && (
                            <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold mb-1">
                                Top Rated
                            </div>
                        )}
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(course.level)}`}>
                            {course.level}
                        </div>
                    </div>

                    {/* Precio estilo Udemy con indicador de popularidad */}
                    <div className="absolute top-2 right-2">
                        <div className="bg-white text-gray-900 px-2 py-1 rounded font-bold text-sm shadow-sm">
                            {course.price}
                        </div>
                        {/* Indicador de popularidad */}
                        {course.students > 20 && (
                            <div className="mt-1 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold text-center">
                                🔥 Popular
                            </div>
                        )}
                    </div>

                    {/* Modalidad */}
                    <div className="absolute bottom-2 right-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getModalidadColor(course.modalidad)}`}>
                            {course.modalidad}
                        </div>
                    </div>

                    {/* Botón flotante solo visible en hover (desktop) */}
                    <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                            onClick={() => handlerDetailsCourses(course.title)} 
                            className="bg-white text-[#002469] px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm"
                        >
                            Vista previa
                        </button>
                    </div>
                </div>

                {/* Contenido estilo Udemy - flex para ocupar altura restante */}
                <div className="p-3 flex flex-col flex-grow">
                    {/* Título - altura fija con ellipsis */}
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 leading-tight group-hover:text-[#002469] transition-colors duration-200 h-10 overflow-hidden">
                        <span className="line-clamp-2">
                            {highlightText(course.title, filters.search)}
                        </span>
                    </h3>

                    {/* Instructor - altura fija */}
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">
                        {highlightText(course.instructor, filters.search)}
                    </p>

                    {/* Rating y stats estilo Udemy - DINÁMICOS */}
                    <div className="flex items-center gap-2 mb-2 text-xs flex-wrap">
                        {course.rating ? (
                            <div className="flex items-center gap-1">
                                <div className="flex text-yellow-400">
                                    {/* Estrellas dinámicas basadas en rating real */}
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} className={`text-xs ${star <= Math.floor(course.rating!) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <span className="text-gray-600 text-xs">({course.rating})</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <div className="flex text-gray-300">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} className="text-xs text-gray-300">
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <span className="text-gray-500 text-xs">Sin reseñas</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-500">
                            <Users className="w-3 h-3" />
                            <span className="text-xs">{course.students}</span>
                        </div>
                    </div>

                    {/* Descripción dinámica - altura flexible */}
                    <p className="text-xs text-gray-600 mb-3 flex-grow overflow-hidden">
                        <span className="line-clamp-3">
                            {highlightText(course.description, filters.search)}
                        </span>
                    </p>

                    {/* Stats compactos */}
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{course.lessons} lecciones</span>
                        </div>
                    </div>

                    {/* Skills dinámicas - compactas */}
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                            {course.skills.slice(0, 2).map((skill, index) => (
                                <span key={index} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium">
                                    {skill}
                                </span>
                            ))}
                            {course.skills.length > 2 && (
                                <span className="text-gray-500 text-xs py-0.5">
                                    +{course.skills.length - 2}
                                </span>
                            )}
                        </div>
                    </div>
                        
                    {/* Botón principal estilo Udemy - fijo al final */}
                    <button 
                        onClick={() => handlerDetailsCourses(course.title)} 
                        className="w-full bg-[#002469] hover:bg-blue-800 text-white font-medium py-2.5 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm mt-auto"
                    >
                        <Play className="w-4 h-4" />
                        Ver curso
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Estilos para animaciones */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .columns-1 > div,
                .columns-2 > div,
                .columns-3 > div {
                    display: inline-block;
                    width: 100%;
                }
            `}</style>
            
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header original pero mejorado */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#002469] to-blue-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
                        <Globe className="w-4 h-4" />
                        Catálogo de Cursos
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#002469] to-blue-600 bg-clip-text text-transparent mb-4">
                        Aprende Inglés
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Descubre nuestros cursos diseñados por expertos. Desde principiante hasta avanzado.
                    </p>
                    
                    {/* Indicador de búsqueda */}
                    {filters.search && (
                        <div className="mt-6 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                            <Search className="w-4 h-4" />
                            Resultados para: &ldquo;<span className="font-semibold">{filters.search}</span>&rdquo;
                            <button
                                onClick={() => router.push('/Courses')}
                                className="ml-2 hover:bg-yellow-100 p-1 rounded-full transition-colors duration-200"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Sección de Cursos Recomendados - Layout creativo */}
                {recommendedCourses.length > 0 && (
                    <section className="mb-16">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
                                <Award className="w-4 h-4" />
                                Recomendados para ti
                            </div>
                            <h2 className="text-3xl font-bold text-[#002469] mb-3">Cursos Destacados</h2>
                            <p className="text-gray-600 max-w-xl mx-auto">
                                Selección especial basada en tu perfil y objetivos de aprendizaje.
                            </p>
                        </div>

                        {/* Layout RADICAL: Masonry/Zigzag */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                            {recommendedCourses.map((course, index) => (
                                <div 
                                    key={course.id} 
                                    className={`transform transition-all duration-700 hover:scale-105 ${
                                        index % 3 === 1 ? 'lg:translate-y-8' : 
                                        index % 3 === 2 ? 'lg:translate-y-4' : ''
                                    }`}
                                    style={{ 
                                        animationDelay: `${index * 150}ms`,
                                        animation: `fadeInUp 0.8s ease-out forwards`
                                    }}
                                >
                                    <CourseCard course={course} isRecommended={true} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Separador original */}
                <div className="relative mb-12">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-6 py-2 text-gray-500 text-sm font-medium">
                            Todos los cursos disponibles
                        </span>
                    </div>
                </div>

                {/* Sección de Todos los Cursos */}
                <section>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-[#002469] mb-3">Catálogo Completo</h2>
                        <p className="text-gray-600">Explora todos nuestros cursos con diseño innovador</p>
                    </div>

                    {/* Filtros originales */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar cursos..."
                                    value={filters.search}
                                    onChange={(e) => updateFilters({ search: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#002469] focus:ring-2 focus:ring-[#002469]/20 focus:outline-none transition-all text-gray-700 placeholder-gray-400"
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={filters.level}
                                    onChange={(e) => updateFilters({ level: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#002469] focus:ring-2 focus:ring-[#002469]/20 focus:outline-none transition-all text-gray-700 bg-white appearance-none cursor-pointer"
                                >
                                    {englishLevels.map((level) => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative">
                                <select
                                    value={filters.modalidad}
                                    onChange={(e) => updateFilters({ modalidad: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#002469] focus:ring-2 focus:ring-[#002469]/20 focus:outline-none transition-all text-gray-700 bg-white appearance-none cursor-pointer"
                                >
                                    {modalidadOptions.map((modalidad) => (
                                        <option key={modalidad.value} value={modalidad.value}>
                                            {modalidad.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                onClick={() => router.push('/Courses')}
                                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                <X className="w-4 h-4" />
                                Limpiar
                            </button>
                        </div>
                    </div>

                    {/* Estadísticas de resultados - Mejoradas */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-sm text-gray-600">
                            Mostrando <span className="font-semibold text-[#002469]">{displayedCourses.length}</span> de{" "}
                            <span className="font-semibold text-[#002469]">{totalCount}</span> cursos
                            {totalPages > 1 && (
                                <span className="text-gray-400 ml-2">
                                    • Página {currentPage} de {totalPages}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-full">
                            <Globe className="w-4 h-4" />
                            Certificados incluidos
                        </div>
                    </div>

                    {/* Grid de Cursos - ESTILO UDEMY */}
                    <div className="relative">
                        {/* Layout profesional tipo Udemy - optimizado para móvil */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {displayedCourses.map((course, index) => (
                                <CourseCard 
                                    key={course.id} 
                                    course={course} 
                                    isRecommended={index < 3} 
                                />
                            ))}
                        </div>
                    </div>

                    {/* Paginación - Modernizada */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1 mt-10">
                            <button
                                onClick={() => changePage(currentPage - 1)}
                                disabled={!hasPrevPage}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </button>
                            
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let page;
                                if (totalPages <= 5) {
                                    page = i + 1;
                                } else if (currentPage <= 3) {
                                    page = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    page = totalPages - 4 + i;
                                } else {
                                    page = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={page}
                                        onClick={() => changePage(page)}
                                        className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                                            page === currentPage
                                                ? 'bg-[#002469] text-white shadow-md'
                                                : 'border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            
                            <button
                                onClick={() => changePage(currentPage + 1)}
                                disabled={!hasNextPage}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                                Siguiente
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Mensaje cuando no hay resultados - Mejorado */}
                    {displayedCourses.length === 0 && (
                        <div className="text-center py-16">
                            <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-3">
                                {filters.search ? `No encontramos cursos para "${filters.search}"` : 'No hay cursos disponibles'}
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                {filters.search 
                                    ? 'Prueba con términos diferentes o ajusta los filtros para encontrar lo que buscas' 
                                    : 'Ajusta los criterios de búsqueda para ver más opciones'
                                }
                            </p>
                            <button
                                onClick={() => router.push('/Courses')}
                                className="bg-[#002469] hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Ver todos los cursos
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
