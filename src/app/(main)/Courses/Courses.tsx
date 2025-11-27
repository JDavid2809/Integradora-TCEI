"use client"

import { useState, useEffect } from "react"
import { Search, BookOpen, Play, X, ChevronLeft, ChevronRight, Users, Clock } from "lucide-react"
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
        A1: "bg-emerald-100 text-emerald-700",
        A2: "bg-blue-100 text-blue-700",
        B1: "bg-amber-100 text-amber-700",
        B2: "bg-orange-100 text-orange-700",
        C1: "bg-purple-100 text-purple-700",
        C2: "bg-rose-100 text-rose-700",
    }
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-700"
}

const getModalidadColor = (modalidad: string) => {
    return modalidad === 'ONLINE' 
        ? "bg-blue-100 text-blue-700"
        : "bg-emerald-100 text-emerald-700"
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

    const handlerDetailsCourses = (courseName: string) => {
        const slug = createSlug(courseName)
        router.push(`/Courses/${slug}`)
    }

    const buildURL = (newFilters: CourseFilters) => {
        const params = new URLSearchParams()
        if (newFilters.search) params.set('search', newFilters.search)
        if (newFilters.level !== 'all') params.set('level', newFilters.level)
        if (newFilters.modalidad !== 'all') params.set('modalidad', newFilters.modalidad)
        if (newFilters.page > 1) params.set('page', newFilters.page.toString())
        const queryString = params.toString()
        return queryString ? `/Courses?${queryString}` : '/Courses'
    }

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

    const { convertedCourses } = useCourseConverter(paginatedData)

    const highlightText = (text: string, searchTerm: string) => {
        if (!searchTerm) return text
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        const parts = text.split(regex)
        return parts.map((part, index) => 
            regex.test(part) ? 
                <span key={index} className="bg-yellow-200 font-semibold">{part}</span> : part
        )
    }

    const displayedCourses = convertedCourses
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

    const CourseCard = ({ course }: { course: CourseForDisplay }) => (
        <div 
            onClick={() => handlerDetailsCourses(course.title)}
            className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer h-full flex flex-col"
        >
            {/* Imagen */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <Image
                    src={course.image}
                    alt={course.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    priority={false}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                
                {/* Rating badge */}
                {course.rating && (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-gray-900 font-semibold text-sm">{course.rating}</span>
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Nivel badge */}
                <div className="mb-3">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${getLevelColor(course.level)}`}>
                        {course.level}
                    </span>
                </div>

                {/* Título */}
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-[#002469] transition-colors">
                    {highlightText(course.title, filters.search)}
                </h3>

                {/* Instructor */}
                <p className="text-gray-600 text-xs mb-3 truncate">
                    {course.instructor}
                </p>

                {/* Stats */}
                <div className="flex gap-4 text-xs text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>{course.students}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{course.duration}</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-3"></div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-[#002469] text-base">{course.price}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getModalidadColor(course.modalidad)}`}>
                        {course.modalidad}
                    </span>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cursos de Inglés</h1>
                            <p className="text-gray-600">
                                Descubre {totalCount} cursos profesionales diseñados para tu aprendizaje
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div className="relative md:col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, instructor..."
                                value={filters.search}
                                onChange={(e) => updateFilters({ search: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 text-gray-600 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002469] focus:border-transparent text-sm"
                            />
                        </div>
                        {/* Level Filter */}
                        <select
                            value={filters.level}
                            onChange={(e) => updateFilters({ level: e.target.value })}
                            className="px-4 py-3 border border-gray-300 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002469] focus:border-transparent text-sm"
                        >
                            {englishLevels.map((level) => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>

                        {/* Modalidad Filter */}
                        <select
                            value={filters.modalidad}
                            onChange={(e) => updateFilters({ modalidad: e.target.value })}
                            className="px-4 py-3 border border-gray-300 text-gray-600  rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002469] focus:border-transparent text-sm"
                        >
                            {modalidadOptions.map((modalidad) => (
                                <option key={modalidad.value} value={modalidad.value}>
                                    {modalidad.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Button - Show only if filters are active */}
                    {(filters.search || filters.level !== 'all' || filters.modalidad !== 'all') && (
                        <div className="mt-4">
                            <button
                                onClick={() => router.push('/Courses')}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>

                {/* Results Info */}
                <div className="mb-6 text-sm text-gray-600">
                    Mostrando <span className="font-semibold text-gray-900">{displayedCourses.length}</span> de{" "}
                    <span className="font-semibold text-gray-900">{totalCount}</span> cursos
                    {totalPages > 1 && (
                        <span className="ml-4 text-gray-500">
                            Página {currentPage} de {totalPages}
                        </span>
                    )}
                </div>

                {/* Courses Grid */}
                {displayedCourses.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {displayedCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 py-8">
                                <button
                                    onClick={() => changePage(currentPage - 1)}
                                    disabled={!hasPrevPage}
                                    className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Anterior
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let page: number;
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
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    page === currentPage
                                                        ? 'bg-[#002469] text-white'
                                                        : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => changePage(currentPage + 1)}
                                    disabled={!hasNextPage}
                                    className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Siguiente
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No se encontraron cursos
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {filters.search 
                                ? `No hay cursos que coincidan con "${filters.search}"` 
                                : "Intenta ajustando tus criterios de búsqueda"}
                        </p>
                        <button
                            onClick={() => router.push('/Courses')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#002469] hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Ver todos los cursos
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
