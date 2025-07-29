"use client"

import { useState } from "react"
import {Search,Clock,Users,Star,BookOpen,Play,Award,Globe,Headphones,MessageCircle,FileText,} from "lucide-react"

const recommendedCourses = [
    {
        id: 1,
        title: "English Conversation Mastery",
        description: "Domina las conversaciones en inglés con confianza y fluidez natural",
        instructor: "Sarah Johnson",
        duration: "12 semanas",
        students: 2450,
        rating: 4.9,
        price: "$199",
        level: "B2",
        image: "logos/logoIngles1.jpg",
        skills: ["Speaking", "Listening", "Pronunciation"],
        lessons: 48,
    },
    {
        id: 2,
        title: "Business English Professional",
        description: "Inglés empresarial para profesionales que buscan destacar",
        instructor: "Michael Brown",
        duration: "10 semanas",
        students: 1890,
        rating: 4.8,
        price: "$299",
        level: "C1",
        image: "logos/logoIngles1.jpg",
        skills: ["Business Writing", "Presentations", "Meetings"],
        lessons: 40,
    },
    {
        id: 3,
        title: "English Foundations",
        description: "Aprende inglés desde cero con metodología probada",
        instructor: "Emma Wilson",
        duration: "16 semanas",
        students: 3200,
        rating: 4.7,
        price: "$149",
        level: "A1",
        image: "logos/logoIngles1.jpg",
        skills: ["Grammar", "Vocabulary", "Basic Speaking"],
        lessons: 64,
    },
]

const allCourses = [
    ...recommendedCourses,
    {
        id: 4,
        title: "IELTS Preparation Intensive",
        description: "Preparación completa para el examen IELTS",
        instructor: "David Miller",
        duration: "8 semanas",
        students: 1250,
        rating: 4.9,
        price: "$249",
        level: "B2",
        image: "logos/logoIngles1.jpg",
        skills: ["Reading", "Writing", "Speaking", "Listening"],
        lessons: 32,
    },
    {
        id: 5,
        title: "English Grammar Complete",
        description: "Domina la gramática inglesa de forma práctica",
        instructor: "Lisa Anderson",
        duration: "6 semanas",
        students: 1800,
        rating: 4.6,
        price: "$99",
        level: "A2",
        image: "logos/logoIngles1.jpg",
        skills: ["Grammar", "Exercises", "Practice"],
        lessons: 24,
    },
    {
        id: 6,
        title: "Advanced English Literature",
        description: "Explora la literatura inglesa clásica y contemporánea",
        instructor: "Robert Taylor",
        duration: "14 semanas",
        students: 420,
        rating: 4.8,
        price: "$349",
        level: "C2",
        image: "logos/logoIngles1.jpg",
        skills: ["Literature", "Critical Analysis", "Writing"],
        lessons: 56,
    },
    {
        id: 7,
        title: "English Pronunciation Workshop",
        description: "Mejora tu pronunciación y acento en inglés",
        instructor: "Jennifer Davis",
        duration: "4 semanas",
        students: 950,
        rating: 4.7,
        price: "$79",
        level: "B1",
        image: "logos/logoIngles1.jpg",
        skills: ["Pronunciation", "Phonetics", "Accent"],
        lessons: 16,
    },
]

const englishLevels = [
    { value: "all", label: "Todos los niveles" },
    { value: "A1", label: "A1 - Principiante" },
    { value: "A2", label: "A2 - Elemental" },
    { value: "B1", label: "B1 - Intermedio" },
    { value: "B2", label: "B2 - Intermedio Alto" },
    { value: "C1", label: "C1 - Avanzado" },
    { value: "C2", label: "C2 - Maestría" },
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

const getSkillIcon = (skill: string) => {
    const icons = {
        Speaking: MessageCircle,
        Listening: Headphones,
        Reading: BookOpen,
        Writing: FileText,
        Grammar: BookOpen,
        Vocabulary: BookOpen,
        Pronunciation: MessageCircle,
        Business: Globe,
    }

    for (const [key, Icon] of Object.entries(icons)) {
        if (skill.toLowerCase().includes(key.toLowerCase())) {
            return Icon
        }
    }
    return BookOpen
}

export default function Courses() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedLevel, setSelectedLevel] = useState("all")

    const filteredCourses = allCourses.filter((course) => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesLevel = selectedLevel === "all" || course.level === selectedLevel

        return matchesSearch && matchesLevel
    })

    const CourseCard = ({ course, isRecommended = false }: { course: any; isRecommended?: boolean }) => (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100">
            <div className="relative overflow-hidden">
                <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                {isRecommended && (
                    <div className="absolute top-4 left-4 bg-[#e30f28] text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                        <Award className="w-3 h-3" />
                        Recomendado
                    </div>
                )}

                <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold border ${getLevelColor(course.level)} shadow-lg`}
                >
                    {course.level}
                </div>
                {/* Duración de curso */}
                {/* <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                    </div>
                </div> */}
            </div>

            <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-xl font-bold text-[#00246a] group-hover:text-[#e30f28] transition-colors duration-300 line-clamp-2">
                        {course.title}
                    </h3>
                    <div className="text-2xl font-bold text-[#e30f28] shrink-0">{course.price}</div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.instructor}</span>
                    <span className="text-gray-300">•</span>
                    {/* LECCIONES */}
                    {/* <span>{course.lessons} lecciones</span> */}
                </div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                    </div>
                </div>

                <button className="w-full bg-[#e30f28] hover:bg-[#c20e24] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    <Play className="w-4 h-4" />
                    Comenzar Curso
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
                </div>
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-[#00246a] mb-4">Cursos recomendados oara ti</h2>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, instructor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#e30f28] focus:outline-none transition-colors text-gray-700 placeholder-gray-400"
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#e30f28] focus:outline-none transition-colors text-gray-700 bg-white appearance-none cursor-pointer"
                                >
                                    {englishLevels.map((level) => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            <button className="bg-[#00246a] hover:bg-[#001a4f] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                <Search className="w-4 h-4" />
                                Buscar Cursos
                            </button>
                        </div>
                    </div>

                    {/* Estadísticas de resultados */}
                    <div className="flex items-center justify-between mb-8">
                        <p className="text-gray-600 font-medium">
                            Mostrando <span className="text-[#e30f28] font-bold">{filteredCourses.length}</span> de{" "}
                            {allCourses.length} cursos
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Globe className="w-4 h-4" />
                            Todos los cursos incluyen certificado
                        </div>
                    </div>

                    {/* Grid de Cursos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>

                    {/* Mensaje cuando no hay resultados */}
                    {filteredCourses.length === 0 && (
                        <div className="text-center py-16">
                            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                                <Search className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-3">No se encontraron cursos</h3>
                            <p className="text-gray-500 mb-6">Intenta ajustar tus criterios de búsqueda</p>
                            <button
                                onClick={() => {
                                    setSearchTerm("")
                                    setSelectedLevel("all")
                                }}
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
