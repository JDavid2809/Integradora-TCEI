'use client'

import React, { useState, useEffect } from 'react'
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Users,
    Globe,
    MapPin,
    DollarSign,
    Clock,
    CheckCircle,
    Target,
    FileText,
    Award,
    AlertCircle,
    Edit,
    Eye,
    EyeOff,
    Loader,
    Mail,
    Phone,
    UserCheck,
    UserX,
    TrendingUp,
    CreditCard,
    ClipboardList
} from 'lucide-react'
import { CourseWithDetails } from '@/types/course-creation'
import { getCourseDetails } from '@/actions/teacher/courseActions'

interface CourseDetailViewProps {
    courseId: number
    teacherId: number
    onBack: () => void
    onEdit: (courseId: number) => void
    onViewStudents: (courseId: number, courseName: string) => void
    onViewActivities?: (courseId: number, courseName: string) => void
}

export default function CourseDetailView({ courseId, teacherId, onBack, onEdit, onViewStudents, onViewActivities }: CourseDetailViewProps) {
    const [course, setCourse] = useState<CourseWithDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadCourseDetails()
    }, [courseId, teacherId])

    const loadCourseDetails = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const courseData = await getCourseDetails(courseId, teacherId)

            if (!courseData) {
                setError('Curso no encontrado')
                return
            }

            setCourse(courseData)
        } catch (err) {
            console.error('Error loading course details:', err)
            setError('Error al cargar los detalles del curso')
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (date: Date | null) => {
        if (!date) return 'No definida'
        return new Date(date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatCurrency = (amount: number | null | undefined) => {
        if (!amount) return 'Gratis'
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    const calculateDuration = () => {
        if (!course?.inicio || !course?.fin) return 'No definida'

        const start = new Date(course.inicio)
        const end = new Date(course.fin)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const weeks = Math.floor(diffDays / 7)
        const days = diffDays % 7

        if (weeks === 0) return `${days} día${days !== 1 ? 's' : ''}`
        if (days === 0) return `${weeks} semana${weeks !== 1 ? 's' : ''}`
        return `${weeks} semana${weeks !== 1 ? 's' : ''} y ${days} día${days !== 1 ? 's' : ''}`
    }

    const calculateTotalLessons = () => {
        if (!course?.courseContentParsed) return 0
        return course.courseContentParsed.reduce((total, section) => total + section.lessons, 0)
    }

    const calculateTotalDuration = () => {
        if (!course?.courseContentParsed) return '0h 0min'

        let totalMinutes = 0
        course.courseContentParsed.forEach(section => {
            // Parsear duración del formato "Xh Ymin" o "Xmin"
            const match = section.duration.match(/(\d+)h?\s*(\d+)?/)
            if (match) {
                const hours = parseInt(match[1]) || 0
                const minutes = parseInt(match[2]) || 0
                totalMinutes += (hours * 60) + minutes
            }
        })

        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        return `${hours}h ${minutes}min`
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-[#00246a]" />
                    <p className="text-gray-600">Cargando detalles del curso...</p>
                </div>
            </div>
        )
    }

    if (error || !course) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{error || 'Curso no encontrado'}</h3>
                    <button
                        onClick={onBack}
                        className="mt-4 px-6 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver a la lista
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                <button
                                    onClick={onBack}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 flex-shrink-0 py-1"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span className="hidden sm:inline">Volver</span>
                                </button>
                                <div className="h-8 w-px bg-gray-300 hidden sm:block" />
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-lg sm:text-2xl font-bold text-[#00246a] truncate">{course.nombre}</h1>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${course.b_activo
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {course.b_activo ? (
                                                <>
                                                    <Eye className="w-3 h-3" />
                                                    Activo
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="w-3 h-3" />
                                                    Inactivo
                                                </>
                                            )}
                                        </span>
                                        <span className="text-xs sm:text-sm text-gray-500 truncate">
                                            Creado el {formatDate(course.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => onEdit(course.id_curso)}
                                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700 flex-1 sm:flex-none text-sm sm:text-base"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </button>
                                
                                {onViewActivities && (
                                    <button
                                        onClick={() => onViewActivities(course.id_curso, course.nombre)}
                                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex-1 sm:flex-none text-sm sm:text-base"
                                    >
                                        <ClipboardList className="w-4 h-4" />
                                        Actividades
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Información General */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#00246a]" />
                            Información General
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    {course.modalidad === 'ONLINE' ? (
                                        <Globe className="w-4 h-4 flex-shrink-0" />
                                    ) : (
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                    )}
                                    <span className="text-sm font-medium">Modalidad</span>
                                </div>
                                <p className="text-base sm:text-lg font-semibold text-gray-900">{course.modalidad}</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <DollarSign className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm font-medium">Precio</span>
                                </div>
                                <p className="text-base sm:text-lg font-semibold text-gray-900">{formatCurrency(course.precio)}</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm font-medium">Duración</span>
                                </div>
                                <p className="text-base sm:text-lg font-semibold text-gray-900">{calculateDuration()}</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <Users className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm font-medium">Estudiantes</span>
                                </div>
                                <p className="text-base sm:text-lg font-semibold text-gray-900">
                                    {course._count?.inscripciones || 0} inscritos
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm font-medium">Fecha de Inicio</span>
                                </div>
                                <p className="text-base text-gray-900">{formatDate(course.inicio)}</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm font-medium">Fecha de Fin</span>
                                </div>
                                <p className="text-base text-gray-900">{formatDate(course.fin)}</p>
                            </div>
                        </div>

                        {course.nivel_ingles && (
                            <div className="mt-4">
                                <div className="flex items-center gap-2 text-gray-600 mb-2">
                                    <Award className="w-4 h-4" />
                                    <span className="text-sm font-medium">Nivel de Inglés</span>
                                </div>
                                <p className="text-base text-gray-900">{course.nivel_ingles}</p>
                            </div>
                        )}
                    </div>

                    {/* Descripción y Resumen */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Descripción</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{course.descripcion}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Resumen</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{course.resumen}</p>
                        </div>
                    </div>

                    {/* Lo que aprenderás */}
                    {course.whatYouLearnParsed && course.whatYouLearnParsed.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Lo que aprenderás
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {course.whatYouLearnParsed.map((item) => (
                                    <div key={item.id} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Características */}
                    {course.featuresParsed && course.featuresParsed.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-[#00246a]" />
                                Características del Curso
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {course.featuresParsed.map((feature) => (
                                    <div key={feature.id} className="p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl mb-2">{feature.icon}</div>
                                        <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                                        <p className="text-sm text-gray-600">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Requisitos */}
                    {course.requirementsParsed && course.requirementsParsed.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                                Requisitos
                            </h2>
                            <ul className="space-y-2">
                                {course.requirementsParsed.map((req) => (
                                    <li key={req.id} className="flex items-start gap-3">
                                        <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                                        <span className="text-gray-700">{req.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Audiencia Objetivo */}
                    {course.targetAudienceParsed && course.targetAudienceParsed.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-600" />
                                ¿Para quién es este curso?
                            </h2>
                            <ul className="space-y-2">
                                {course.targetAudienceParsed.map((audience) => (
                                    <li key={audience.id} className="flex items-start gap-3">
                                        <Target className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{audience.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Contenido del Curso */}
                    {course.courseContentParsed && course.courseContentParsed.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-[#00246a]" />
                                    Contenido del Curso
                                </h2>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>{course.courseContentParsed.length} secciones</span>
                                    <span>•</span>
                                    <span>{calculateTotalLessons()} lecciones</span>
                                    <span>•</span>
                                    <span>{calculateTotalDuration()} duración total</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {course.courseContentParsed.map((section, index) => (
                                    <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900">
                                                    Sección {index + 1}: {section.title}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span>{section.lessons} lecciones</span>
                                                    <span>•</span>
                                                    <span>{section.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <ul className="space-y-2">
                                                {section.topics.map((topic, topicIndex) => (
                                                    <li key={topic.id} className="flex items-center justify-between py-2 hover:bg-gray-50 px-3 rounded">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-gray-400 text-sm">{topicIndex + 1}</span>
                                                            <BookOpen className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-700">{topic.title}</span>
                                                            {topic.isPreview && (
                                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                                                    Vista previa
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-500">{topic.duration}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Botón para ver estudiantes inscritos */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-[#00246a]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Estudiantes Inscritos</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                                        {course._count?.inscripciones || 0} estudiante{(course._count?.inscripciones || 0) !== 1 ? 's' : ''} inscrito{(course._count?.inscripciones || 0) !== 1 ? 's' : ''} en este curso
                                    </p>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => onViewStudents(course.id_curso, course.nombre)}
                                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#00246a] text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto text-sm sm:text-base"
                            >
                                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                Ver Estudiantes
                            </button>
                        </div>
                    </div>

                    {/* Información del Creador */}
                    {course.creator && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Instructor</h2>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-[#00246a] rounded-full flex items-center justify-center text-white text-xl font-bold">
                                    {course.creator.usuario.nombre.charAt(0)}{course.creator.usuario.apellido.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {course.creator.usuario.nombre} {course.creator.usuario.apellido}
                                    </h3>
                                    <p className="text-sm text-gray-600">{course.creator.usuario.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
