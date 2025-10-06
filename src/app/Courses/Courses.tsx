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
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100">
            <div className="relative overflow-hidden">
                <Image
                    src={course.image}
                    alt={course.title}
                    width={400}   
                    height={200} 
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                {isRecommended && (
                    <div className="absolute top-4 left-4 bg-[#e30f28] text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                        <Award className="w-3 h-3" />
                        Recomendado
                    </div>
                )}

                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold border ${getLevelColor(course.level)} shadow-lg`}>
                    {course.level}
                </div>

                <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-sm font-semibold border ${getModalidadColor(course.modalidad)} shadow-lg`}>
                    {course.modalidad}
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-xl font-bold text-[#00246a] group-hover:text-[#e30f28] transition-colors duration-300 line-clamp-2">
                        {highlightText(course.title, filters.search)}
                    </h3>
                    <div className="text-2xl font-bold text-[#e30f28] shrink-0">{course.price}</div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                    {highlightText(course.description, filters.search)}
                </p>

                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                    <BookOpen className="w-4 h-4" />
                    <span>{highlightText(course.instructor, filters.search)}</span>
                </div>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.students} estudiantes</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                    </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                    <div>Inicio: {course.inicio}</div>
                    <div>Fin: {course.fin}</div>
                </div>
                    
                <button 
                    onClick={() => handlerDetailsCourses(course.title)} 
                    className="w-full bg-[#e30f28] hover:bg-[#c20e24] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <Play className="w-4 h-4" />
                    Ver curso
                </button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-[#00246a] text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
                        <Globe className="w-4 h-4" />
                        Cursos de Inglés
                    </div>
                    <h1 className="text-5xl font-bold text-[#00246a] mb-4">Domina el Inglés</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Aprende inglés con los mejores instructores nativos y metodología probada. Desde principiante hasta nivel
                        avanzado.
                    </p>
                    
                    {/* Indicador de búsqueda activa */}
                    {filters.search && (
                        <div className="mt-6 inline-flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                            <Search className="w-4 h-4" />
                            Mostrando resultados para: &ldquo;{filters.search}&rdquo;
                            <button
                                onClick={() => router.push('/Courses')}
                                className="ml-2 hover:bg-yellow-200 p-1 rounded-full transition-colors duration-200"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Sección de Cursos Recomendados */}
                {recommendedCourses.length > 0 && (
                    <section className="mb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-[#00246a] mb-4">Cursos recomendados para ti</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Los cursos que se adaptan a tus necesidades y objetivos de aprendizaje. Mejora tu inglés con cursos
                                diseñados por expertos.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {recommendedCourses.map((course) => (
                                <CourseCard key={course.id} course={course} isRecommended={true} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Separador */}
                <div className="relative mb-16">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-gradient-to-r from-blue-50 to-red-50 px-8 py-3 text-gray-600 rounded-full border-2 border-gray-200 font-semibold">
                            Explora todos nuestros cursos
                        </span>
                    </div>
                </div>

                {/* Sección de Todos los Cursos */}
                <section>
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold text-[#00246a] mb-4">Catálogo Completo</h2>
                        <p className="text-lg text-gray-600">Encuentra el curso perfecto para tu nivel de inglés</p>
                    </div>

                    {/* Filtros y Búsqueda */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, instructor..."
                                    value={filters.search}
                                    onChange={(e) => updateFilters({ search: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#e30f28] focus:outline-none transition-colors text-gray-700 placeholder-gray-400"
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={filters.level}
                                    onChange={(e) => updateFilters({ level: e.target.value })}
                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#e30f28] focus:outline-none transition-colors text-gray-700 bg-white appearance-none cursor-pointer"
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
                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#e30f28] focus:outline-none transition-colors text-gray-700 bg-white appearance-none cursor-pointer"
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
                                className="bg-[#00246a] hover:bg-[#001a4f] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <X className="w-4 h-4" />
                                Limpiar
                            </button>
                        </div>
                    </div>

                    {/* Estadísticas de resultados */}
                    <div className="flex items-center justify-between mb-8">
                        <p className="text-gray-600 font-medium">
                            Mostrando <span className="text-[#e30f28] font-bold">{displayedCourses.length}</span> de{" "}
                            <span className="text-[#e30f28] font-bold">{totalCount}</span> cursos
                            {totalPages > 1 && (
                                <span className="text-gray-500 ml-2">
                                    (Página {currentPage} de {totalPages})
                                </span>
                            )}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Globe className="w-4 h-4" />
                            Todos los cursos incluyen certificado
                        </div>
                    </div>

                    {/* Grid de Cursos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayedCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-12">
                            <button
                                onClick={() => changePage(currentPage - 1)}
                                disabled={!hasPrevPage}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => changePage(page)}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        page === currentPage
                                            ? 'bg-[#e30f28] text-white'
                                            : 'border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => changePage(currentPage + 1)}
                                disabled={!hasNextPage}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Siguiente
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Mensaje cuando no hay resultados */}
                    {displayedCourses.length === 0 && (
                        <div className="text-center py-16">
                            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                                <Search className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-3">
                                {filters.search ? `No se encontraron cursos para "${filters.search}"` : 'No se encontraron cursos'}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {filters.search 
                                    ? 'Intenta con otros términos de búsqueda o ajusta los filtros' 
                                    : 'Intenta ajustar tus criterios de búsqueda'
                                }
                            </p>
                            <button
                                onClick={() => router.push('/Courses')}
                                className="bg-[#e30f28] hover:bg-[#c20e24] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
