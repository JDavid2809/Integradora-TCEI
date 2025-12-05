"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ReviewSection from '@/components/ReviewSection'
import { createReview, updateReview, deleteReview } from '@/actions/reviews/reviewActions'
import { enrollInCourse } from '@/actions/enrollment/enrollmentActions'

import { 
    ArrowLeft, 
    Clock, 
    Users, 
    BookOpen, 
    CheckCircle,
    type LucideIcon,
    Star,
    Play,
    Trophy,
    ShoppingCart,
    Target,
    Zap,
    Video,
    Download,
    FileText,
    GraduationCap,
    MessageCircle,
    Award,
    Mail,
    User,
    Smartphone,
    AlertCircle
} from 'lucide-react'
import { BuyButton } from '@/components/payments/BuyButton'

// Tipo para el curso con schema actual de la BD
interface CourseDataFromDB {
    id_curso: number
    nombre: string
    descripcion?: string | null
    resumen?: string | null
    modalidad: 'PRESENCIAL' | 'ONLINE'
    inicio?: Date | null
    fin?: Date | null
    precio?: number | null
    nivel_ingles?: string | null
    imagen_url?: string | null
    video_url?: string | null
    what_you_learn?: string | null    // JSON
    features?: string | null          // JSON
    requirements?: string | null      // JSON
    target_audience?: string | null   // JSON
    course_content?: string | null    // JSON
    created_by?: number | null
    created_at?: Date | null
    updated_at?: Date | null
    // Campos calculados
    total_lecciones_calculadas?: number
    creator?: {
        id_profesor: number
        nivel_estudios?: string | null
        observaciones?: string | null
        edad?: number | null
        telefono?: string | null
        usuario: {
            nombre: string
            apellido: string
            email: string
        }
    } | null
    inscripciones?: Array<{
        student: {
            id_estudiante: number
            usuario: {
                nombre: string
                apellido: string
            }
        }
    }>
    _count: {
        inscripciones: number
        reviews: number
    }
    reviews?: Array<{
        id: number
        rating: number
        comment: string
        created_at: Date
        updated_at?: Date
        student_id: number
        student: {
            usuario: {
                id: number
                nombre: string
                apellido: string
            }
        }
    }>
}

interface CourseDetailsProps {
    courseData: CourseDataFromDB
}

export default function CourseDetails({ courseData }: CourseDetailsProps) {
    const router = useRouter()
    const { data: session } = useSession()
    const searchParams = useSearchParams()
    
    const [isEnrolling, setIsEnrolling] = useState(false)
    const [enrollmentMessage, setEnrollmentMessage] = useState<string>('')
    const [activeTab, setActiveTab] = useState('overview')
    const [reviews, setReviews] = useState(courseData.reviews || [])
    const [isUserEnrolled, setIsUserEnrolled] = useState(false)

    // ✅ Estado para controlar la visibilidad de la alerta de cancelación
    const [showCancelAlert, setShowCancelAlert] = useState(false)

    // ✅ Detectar si el pago fue cancelado
    const wasCanceled = searchParams?.get('canceled') === 'true'

    // ✅ Efecto para mostrar y ocultar la alerta de cancelación
    React.useEffect(() => {
        if (wasCanceled) {
            setShowCancelAlert(true)
            
            // Ocultar después de 5 segundos
            const timer = setTimeout(() => {
                setShowCancelAlert(false)
                // Limpiar el parámetro de la URL sin recargar la página
                const url = new URL(window.location.href)
                url.searchParams.delete('canceled')
                window.history.replaceState({}, '', url.toString())
            }, 4000)

            return () => clearTimeout(timer)
        }
    }, [wasCanceled])
    
    // Efecto para verificar inscripción cuando cambie la sesión
    React.useEffect(() => {
        if (session?.user?.extra?.id_estudiante && courseData.inscripciones) {
            const enrolled = courseData.inscripciones.some(
                inscripcion => inscripcion.student.id_estudiante === session.user.extra?.id_estudiante
            )
            setIsUserEnrolled(enrolled)
        } else {
            setIsUserEnrolled(false)
        }
    }, [session, courseData.inscripciones])

    // ✅ OPTIMIZADO: Los datos ya vienen parseados del servidor, solo procesar
    let whatYouLearn: string[] = []
    let features: {icon: LucideIcon; title: string; description: string}[] = []
    let requirements: string[] = []
    let targetAudience: string[] = []
    let courseContent: {title: string; duration: string; lessons: number; topics: string[]}[] = []

    try {
        // Los datos ya están parseados, solo normalizar
        whatYouLearn = Array.isArray(courseData.what_you_learn) 
            ? courseData.what_you_learn.map(item => 
                typeof item === 'string' ? item : (item.text || item.title || String(item))
            ) 
            : []
        
        features = Array.isArray(courseData.features) ? courseData.features : []
        
        requirements = Array.isArray(courseData.requirements) 
            ? courseData.requirements.map(item => 
                typeof item === 'string' ? item : (item.text || item.title || String(item))
            ) 
            : []
        
        targetAudience = Array.isArray(courseData.target_audience) 
            ? courseData.target_audience.map(item => 
                typeof item === 'string' ? item : (item.text || item.title || String(item))
            ) 
            : []
        
        courseContent = Array.isArray(courseData.course_content) ? courseData.course_content : []
    } catch (error) {
        console.error('Error processing course data:', error)
    }

    const handleEnroll = async () => {
        if (!session) {
            router.push('/Login')
            return
        }

        // Si ya está inscrito, no hacer nada
        if (isUserEnrolled) {
            return
        }

        setIsEnrolling(true)
        setEnrollmentMessage('Procesando inscripción...')

        try {
            // Inscribirse al curso
            const result = await enrollInCourse(courseData.id_curso)
            
            if (result.success) {
                setIsUserEnrolled(true)
                
                if ('alreadyEnrolled' in result && result.alreadyEnrolled) {
                    setEnrollmentMessage('Ya estás inscrito en este curso')
                } else {
                    setEnrollmentMessage('¡Inscripción exitosa! Ya tienes acceso al curso')
                    // Recargar la página después de 2 segundos para reflejar los cambios
                    setTimeout(() => {
                        window.location.reload()
                    }, 2000)
                }
            } else {
                // Caso de error
                const errorMessage = 'error' in result && typeof result.error === 'string' 
                    ? result.error 
                    : 'Error al procesar inscripción'
                setEnrollmentMessage(errorMessage)
            }
        } catch (error) {
            console.error('Error en inscripción:', error)
            setEnrollmentMessage('Error inesperado al procesar la inscripción')
        } finally {
            setIsEnrolling(false)
            // Limpiar mensaje después de 3 segundos si no es exitoso
            if (!isUserEnrolled) {
                setTimeout(() => setEnrollmentMessage(''), 3000)
            }
        }
    }

    // Verificar si el usuario está inscrito (usando el estado local)
    const isEnrolled = isUserEnrolled

    // Verificar si el usuario es el profesor del curso
    const isOwner = session?.user?.extra?.id_profesor && 
                    courseData.creator?.id_profesor && 
                    courseData.creator.id_profesor === session.user.extra.id_profesor

    // Verificar si el usuario puede inscribirse (no es profesor, admin, o creador)
    const canEnroll = session?.user?.extra?.id_estudiante && 
                     !session?.user?.extra?.id_profesor && 
                     !session?.user?.extra?.id_admin &&
                     !isUserEnrolled

    // Verificar si es profesor (pero no dueño del curso)
    const isTeacher = session?.user?.extra?.id_profesor && !isOwner

    // Verificar si es admin
    const isAdmin = session?.user?.extra?.id_admin

    // Función para agregar reseña
    const handleAddReview = async (rating: number, comment: string) => {
        try {
            const result = await createReview({
                courseId: courseData.id_curso,
                rating,
                comment
            })

            if (result.success) {
                // Agregar la nueva reseña al estado
                const newReview = {
                    ...result.review!,
                    created_at: new Date(result.review!.created_at),
                    updated_at: result.review!.updated_at ? new Date(result.review!.updated_at) : undefined
                }
                setReviews(prev => [newReview, ...prev])
            } else {
                console.error('Error al crear reseña:', result.error)
            }
        } catch (error) {
            console.error('Error al crear reseña:', error)
        }
    }

    // Función para eliminar reseña
    const handleDeleteReview = async (reviewId: number) => {
        try {
            const result = await deleteReview({
                reviewId,
                courseId: courseData.id_curso
            })

            if (result.success) {
                // Remover la reseña del estado
                setReviews(prev => prev.filter(review => review.id !== reviewId))
            } else {
                console.error('Error al eliminar reseña:', result.error)
            }
        } catch (error) {
            console.error('Error al eliminar reseña:', error)
        }
    }

    // Función para actualizar reseña
    const handleUpdateReview = async (reviewId: number, rating: number, comment: string) => {
        try {
            const result = await updateReview({
                reviewId,
                courseId: courseData.id_curso,
                rating,
                comment
            })

            if (result.success) {
                // Actualizar la reseña en el estado
                setReviews(prev => prev.map(review => 
                    review.id === reviewId 
                        ? {
                            ...result.review!,
                            created_at: new Date(result.review!.created_at),
                            updated_at: result.review!.updated_at ? new Date(result.review!.updated_at) : undefined
                        }
                        : review
                ))
            } else {
                console.error('Error al actualizar reseña:', result.error)
                // Si la reseña no existe (fue eliminada), eliminarla del estado local
                if (result.error?.includes('no encontrada') || result.error?.includes('eliminada')) {
                    setReviews(prev => prev.filter(review => review.id !== reviewId))
                }
                throw new Error(result.error || 'Error al actualizar reseña')
            }
        } catch (error) {
            console.error('Error al actualizar reseña:', error)
            // Re-lanzar el error para que el componente ReviewSection lo maneje
            throw error
        }
    }

    // Calcular duración del curso con formato mejorado
    const calculateDuration = () => {
        if (courseData.inicio && courseData.fin) {
            const start = new Date(courseData.inicio)
            const end = new Date(courseData.fin)
            const diffTime = end.getTime() - start.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            const weeks = Math.ceil(diffDays / 7)
            const months = Math.floor(weeks / 4)
            
            if (months >= 2) {
                return `${months} meses`
            } else if (weeks >= 4) {
                return `1 mes`
            } else if (weeks >= 2) {
                return `${weeks} semanas`
            } else if (diffDays >= 7) {
                return `1 semana`
            } else {
                return `${diffDays} días`
            }
        }
        // Basado en número de lecciones calculadas
        const lecciones = courseData.total_lecciones_calculadas || 20
        const semanasEstimadas = Math.ceil(lecciones / 10) // Aproximadamente 10 lecciones por semana
        return semanasEstimadas === 1 ? '1 semana' : `${semanasEstimadas} semanas`
    }

    // Obtener nombre del instructor
    const getInstructorName = () => {
        if (courseData.creator) {
            return `${courseData.creator.usuario.nombre} ${courseData.creator.usuario.apellido}`
        }
        return 'Instructor por asignar'
    }

    // Obtener título del instructor basado en su nivel de estudios
    const getInstructorTitle = (): string => {
        if (courseData.creator?.nivel_estudios) {
            return courseData.creator.nivel_estudios
        }
        return 'Profesor Certificado de Inglés'
    }

    // Obtener biografía del instructor
    const getInstructorBio = (): string => {
        if (courseData.creator?.observaciones) {
            return courseData.creator.observaciones
        }
        return 'Especialista en enseñanza de inglés como segunda lengua con certificación TESOL. Experto en metodologías comunicativas y aprendizaje dinámico.'
    }

    // Obtener experiencia basada en la edad o datos disponibles
    const getInstructorExperience = (): string => {
        if (courseData.creator?.edad && courseData.creator.edad > 25) {
            const years = Math.min(courseData.creator.edad - 22, 15) // Estimación conservadora
            return `${years} años de experiencia`
        }
        return '5+ años de experiencia'
    }

    // Generar achievements profesionales y seguros
    const getInstructorAchievements = (): string[] => {
        const achievements: string[] = []
        
        // Nivel de estudios (si está disponible)
        if (courseData.creator?.nivel_estudios) {
            achievements.push(courseData.creator.nivel_estudios)
        } else {
            achievements.push("Certificación TESOL")
        }
        
        // Experiencia
        achievements.push(getInstructorExperience())
        
        // Estudiantes
        achievements.push(`${courseData._count.inscripciones}+ estudiantes`)
        
        // Metodología basada en los datos del curso
        if (courseData.modalidad === 'ONLINE') {
            achievements.push("Especialista en educación virtual")
        } else {
            achievements.push("Experto en clases presenciales")
        }
        
        return achievements
    }

    // Obtener nivel de dificultad basado en las lecciones
    const getDifficultyLevel = () => {
        const lecciones = courseData.total_lecciones_calculadas || 20
        if (lecciones <= 15) return 'Principiante'
        if (lecciones <= 35) return 'Intermedio'
        return 'Avanzado'
    }

    // Obtener modalidad descriptiva
    const getModalityDescription = () => {
        return courseData.modalidad === 'ONLINE' 
            ? 'Clases 100% online y en vivo' 
            : 'Modalidad presencial'
    }

    // Obtener iniciales del instructor
    const getInstructorInitials = () => {
        if (courseData.creator) {
            return `${courseData.creator.usuario.nombre[0]}${courseData.creator.usuario.apellido[0]}`
        }
        return 'IA'
    }

    // Datos extendidos del curso (de la BD o valores por defecto)
    const extendedCourseData = {
        whatYouWillLearn: whatYouLearn.length > 0 ? whatYouLearn : [
            "Comunicarte con confianza en situaciones cotidianas",
            "Entender conversaciones básicas en inglés",
            "Escribir textos simples y coherentes",
            "Mejorar tu pronunciación y fluidez",
            "Usar gramática esencial correctamente",
            "Ampliar tu vocabulario de forma efectiva"
        ],
        requirements: requirements.length > 0 ? requirements : [
            "No se requiere experiencia previa en inglés",
            "Acceso a internet para clases online",
            "Dedicación de al menos 2 horas por semana",
            "Ganas de aprender y practicar"
        ],
        targetAudience: targetAudience.length > 0 ? targetAudience : [
            "Principiantes que quieren aprender inglés desde cero",
            "Estudiantes que desean mejorar su nivel actual",
            "Profesionales que necesitan inglés para el trabajo",
            "Personas que planean viajar a países de habla inglesa"
        ],
        courseContent: courseContent.length > 0 ? courseContent.map(section => ({
            title: section.title || '',
            duration: section.duration || '2 semanas',
            lessons: section.lessons || 10,
            topics: Array.isArray(section.topics) ? section.topics.map((topic: string | {text?: string; title?: string; name?: string}) =>
                typeof topic === 'string' ? topic : (topic.text || topic.title || topic.name || String(topic))
            ) : []
        })) : [
            {
                title: "Introducción al Inglés",
                duration: "2 semanas",
                lessons: 8,
                topics: ["Alfabeto y pronunciación", "Números del 1 al 100", "Saludos formales e informales", "Presentaciones personales"]
            },
            {
                title: "Gramática Básica",
                duration: "3 semanas", 
                lessons: 12,
                topics: ["Verbos to be y to have", "Presente simple", "Artículos a/an/the", "Pronombres personales"]
            },
            {
                title: "Vocabulario Esencial",
                duration: "2 semanas",
                lessons: 10,
                topics: ["Familia y relaciones", "Comida y bebidas", "Ropa y colores", "Casa y mobiliario"]
            },
            {
                title: "Conversación Práctica",
                duration: "3 semanas",
                lessons: 15,
                topics: ["Conversaciones telefónicas", "En el restaurante", "De compras", "Pidiendo direcciones"]
            }
        ],
        features: features.length > 0 ? features : [
            { icon: Video, title: "Clases en vivo", description: "Sesiones interactivas con tu instructor" },
            // { icon: Download, title: "Material descargable", description: "PDFs, audios y ejercicios para practicar" },
            { icon: Smartphone, title: "Acceso móvil", description: "Estudia desde cualquier dispositivo" },
            { icon: MessageCircle, title: "Soporte 24/7", description: "Ayuda cuando la necesites" },
            { icon: Trophy, title: "Certificado", description: "Certificado digital al finalizar" }
        ],
        instructor: {
            name: getInstructorName(),
            email: courseData.creator?.usuario.email || 'profesor@tcei.edu',
            title: getInstructorTitle(),
            experience: getInstructorExperience(),
            students: `${courseData._count.inscripciones}+ estudiantes`,
            rating: 4.8, // Esto podría calcularse de las reseñas en el futuro
            bio: getInstructorBio(),
            phone: null, // Eliminamos el teléfono por seguridad
            achievements: getInstructorAchievements()
        }
    }

    // Definir las tabs
    const tabs = [
        { id: 'overview', label: 'Resumen', icon: BookOpen },
        { id: 'curriculum', label: 'Contenido', icon: FileText },
        { id: 'instructor', label: 'Instructor', icon: GraduationCap },
        { id: 'reviews', label: 'Reseñas', icon: Star }
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Header con navegación */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 py-4 max-w-7xl">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[#00246a] hover:text-[#e30f28] transition-colors font-medium text-sm sm:text-base py-2 px-2 -mx-2 rounded-lg hover:bg-gray-50"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Volver a cursos</span>
                        <span className="sm:hidden">Volver</span>
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                        {/* Información del curso */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Header del curso */}
                            <div className="space-y-4">
                                {/* Tags y rating */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                        {courseData.modalidad}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium text-gray-700">4.8</span>
                                        <span className="text-sm text-gray-500">(350)</span>
                                    </div>
                                </div>
                                
                                {/* Título del curso */}
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#00246a] leading-tight">
                                    {courseData.nombre}
                                </h1>
                                
                                {/* Descripción */}
                                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-4xl">
                                    {courseData.descripcion || `Curso completo de inglés modalidad ${courseData.modalidad.toLowerCase()}. Desarrolla tus habilidades comunicativas con metodología moderna y práctica.`}
                                </p>
                            </div>

                            {/* Información del instructor y métricas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-gray-100">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-[#e30f28] shrink-0" />
                                        <span className="text-gray-700 font-medium">Por {getInstructorName()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-[#e30f28] shrink-0" />
                                        <span className="text-gray-700">{courseData._count.inscripciones} estudiante{courseData._count.inscripciones !== 1 ? 's' : ''} inscrito{courseData._count.inscripciones !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-[#e30f28] shrink-0" />
                                        <span className="text-gray-700">{calculateDuration()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Target className="w-5 h-5 text-[#e30f28] shrink-0" />
                                        <span className="text-gray-700">{getDifficultyLevel()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats del curso - Mejorado */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                                    <div className="text-2xl font-bold text-[#00246a] mb-1">{courseData.total_lecciones_calculadas || 0}</div>
                                    <div className="text-sm text-blue-700 font-medium">Lecciones</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                                    <div className="text-2xl font-bold text-[#00246a] mb-1">{courseData._count.inscripciones}</div>
                                    <div className="text-sm text-green-700 font-medium">Estudiantes</div>
                                </div>
                                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center border border-red-200">
                                    <div className="text-lg font-bold text-[#00246a] mb-1">{courseData.modalidad}</div>
                                    <div className="text-sm text-red-700 font-medium">Modalidad</div>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center border border-yellow-200">
                                    <div className="text-2xl font-bold text-[#00246a] mb-1">{courseData.nivel_ingles || 'A1'}</div>
                                    <div className="text-sm text-yellow-700 font-medium">Nivel</div>
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta de precio */}
                        <div className="lg:col-span-1 order-first lg:order-last">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-24">
                                <div className="relative">
                                    {/* Mostrar video si existe, de lo contrario mostrar imagen */}
                                    {courseData.video_url ? (
                                        <video
                                            src={courseData.video_url}
                                            controls
                                            className="w-full h-36 sm:h-48 object-cover"
                                            poster={courseData.imagen_url || "/logos/logoIngles1.jpg"}
                                        >
                                            Tu navegador no soporta videos HTML5.
                                        </video>
                                    ) : (
                                        <>
                                            <Image
                                                src={courseData.imagen_url || "/logos/logoIngles1.jpg"}
                                                alt={courseData.nombre}
                                                width={400}
                                                height={225}
                                                className="w-full h-36 sm:h-48 object-cover"
                                            />
                                            {/* Solo mostrar botón de play si no hay video */}
                                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                                <div className="bg-white/80 rounded-full p-2 sm:p-3">
                                                    <Play className="w-5 h-5 sm:w-6 sm:h-6 text-[#e30f28] ml-1" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                <div className="p-4 sm:p-6">
                                    <div className="text-center mb-6">
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <span className="text-3xl font-bold text-green-600">
                                                {courseData.precio ? `$${Number(courseData.precio).toFixed(2)}` : 'Gratis'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ✅ Alerta de cancelación con animación de salida */}
                                    {showCancelAlert && (
                                        <div className={`mb-4 p-4 rounded-lg text-center bg-red-50 border-2 border-red-300 shadow-md transition-all duration-500 ${
                                            showCancelAlert ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                                        }`}>
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <AlertCircle className="w-5 h-5 text-red-600" />
                                                <span className="font-bold text-red-800">Pago cancelado</span>
                                            </div>
                                            <p className="text-sm text-red-700 font-medium">
                                                No se procesó ningún cargo. Puedes intentar de nuevo cuando quieras.
                                            </p>
                                            {/* ✅ Barra de progreso opcional */}
                                            <div className="mt-3 w-full bg-red-200 rounded-full h-1 overflow-hidden">
                                                <div 
                                                    className="bg-red-600 h-full rounded-full transition-all duration-[5000ms] ease-linear"
                                                    style={{ width: showCancelAlert ? '0%' : '100%' }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ✅ LÓGICA CORREGIDA */}
                                    {isUserEnrolled ? (
                                        // Ya está inscrito
                                        <div className="mb-4 p-4 rounded-lg text-center bg-green-50 border border-green-200">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="font-semibold text-green-800">¡Ya tienes acceso!</span>
                                            </div>
                                            <p className="text-sm text-green-700">
                                                Ya tienes acceso completo a este curso
                                            </p>
                                        </div>
                                    ) : !session ? (
                                        // No hay sesión - mostrar botón de login
                                        <button
                                            onClick={() => router.push('/Login')}
                                            className="w-full font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 bg-[#e30f28] hover:bg-[#c20e24] text-white mb-4"
                                        >
                                            <BookOpen className="w-5 h-5" />
                                            Iniciar sesión para continuar
                                        </button>
                                    ) : isOwner ? (
                                        // Es el instructor del curso
                                        <div className="mb-4 p-4 rounded-lg text-center bg-blue-50 border border-blue-200">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <GraduationCap className="w-5 h-5 text-blue-600" />
                                                <span className="font-semibold text-blue-800">Eres el instructor</span>
                                            </div>
                                            <p className="text-sm text-blue-700">
                                                Este es tu curso
                                            </p>
                                        </div>
                                    ) : isTeacher ? (
                                        // Es profesor pero no el dueño
                                        <div className="mb-4 p-4 rounded-lg text-center bg-amber-50 border border-amber-200">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <GraduationCap className="w-5 h-5 text-amber-600" />
                                                <span className="font-semibold text-amber-800">Cuenta de profesor</span>
                                            </div>
                                            <p className="text-sm text-amber-700">
                                                Los profesores no pueden inscribirse en cursos
                                            </p>
                                        </div>
                                    ) : isAdmin ? (
                                        // Es administrador
                                        <div className="mb-4 p-4 rounded-lg text-center bg-purple-50 border border-purple-200">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <User className="w-5 h-5 text-purple-600" />
                                                <span className="font-semibold text-purple-800">Cuenta de administrador</span>
                                            </div>
                                            <p className="text-sm text-purple-700">
                                                Acceso desde panel administrativo
                                            </p>
                                        </div>
                                    ) : courseData.precio && courseData.precio > 0 ? (
                                        // ✅ Curso de PAGO - Mostrar botón de compra
                                        <BuyButton 
                                            courseId={courseData.id_curso}
                                            label="Comprar Curso"
                                        />
                                    ) : canEnroll ? (
                                        // ✅ Curso GRATIS - Botón de inscripción gratuita
                                        <button
                                            onClick={handleEnroll}
                                            disabled={isEnrolling}
                                            className="w-full font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none mb-4 bg-[#e30f28] hover:bg-[#c20e24] disabled:bg-gray-400 text-white"
                                        >
                                            {isEnrolling ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    Inscribiendo...
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-5 h-5" />
                                                    Inscribirse Gratis
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        // No puede inscribirse por alguna razón
                                        <div className="mb-4 p-4 rounded-lg text-center bg-gray-50 border border-gray-200">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <BookOpen className="w-5 h-5 text-gray-600" />
                                                <span className="font-semibold text-gray-800">No disponible</span>
                                            </div>
                                            <p className="text-sm text-gray-700">
                                                Este curso no está disponible para inscripción
                                            </p>
                                        </div>
                                    )}

                                    {enrollmentMessage && (
                                        <div className={`mb-4 p-3 rounded-lg text-sm text-center ${
                                            enrollmentMessage.includes('exitosa') 
                                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                                        }`}>
                                            {enrollmentMessage}
                                        </div>
                                    )}

                                    <div className="space-y-3 text-sm">
                                        <h4 className="font-semibold text-gray-900 mb-3">Este curso incluye:</h4>
                                        
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="w-4 h-4 text-gray-600" />
                                            <span className="text-gray-700">{courseData.total_lecciones_calculadas || 20} lecciones organizadas por módulos</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Target className="w-4 h-4 text-gray-600" />
                                            <span className="text-gray-700"> ejercicios interactivos</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Download className="w-4 h-4 text-gray-600" />
                                            <span className="text-gray-700">Material descargable </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-gray-600" />
                                            <span className="text-gray-700">Duración flexible según tu ritmo</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MessageCircle className="w-4 h-4 text-gray-600" />
                                            <span className="text-gray-700">Soporte directo del instructor</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <Trophy className="w-4 h-4 text-gray-600" />
                                            <span className="text-gray-700">Certificado digital verificable al completar</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navegación por tabs - con scroll horizontal en móvil */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                    {/* Indicador de scroll en móvil */}
                    <div className="lg:hidden text-center py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                            <span>←</span>
                            <span>Desliza para ver más opciones</span>
                            <span>→</span>
                        </p>
                    </div>
                    <nav className="flex space-x-6 sm:space-x-8 overflow-x-auto scrollbar-hide lg:overflow-visible pb-0 lg:pb-0">
                        <div className="flex space-x-6 sm:space-x-8 min-w-max lg:min-w-0 px-2 lg:px-0">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 py-3 sm:py-4 px-2 sm:px-3 lg:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'border-[#e30f28] text-[#e30f28]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </nav>
                </div>
            </div>

            {/* Contenido principal - fondo blanco limpio */}
            <div className="bg-white">
                <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Contenido principal */}
                        <div className="lg:col-span-2">
                            {activeTab === 'overview' && (
                                <div className="space-y-6 sm:space-y-8">
                                    {/* Lo que aprenderás */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
                                        <h2 className="text-xl sm:text-2xl font-bold text-[#00246a] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                                            <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                                            Lo que aprenderás
                                        </h2>
                                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                            {extendedCourseData.whatYouWillLearn.map((item, index) => (
                                                <div key={index} className="flex items-start gap-2 sm:gap-3">
                                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0 mt-0.5" />
                                                    <span className="text-sm sm:text-base text-gray-700">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Características del curso */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
                                        <h2 className="text-xl sm:text-2xl font-bold text-[#00246a] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                                            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                                            Características del curso
                                        </h2>
                                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                            {extendedCourseData.features.map((feature, index) => (
                                                <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border">
                                                    <div className="bg-[#e30f28] bg-opacity-10 p-2 sm:p-3 rounded-lg shrink-0">
                                                        <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#e30f28]" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-sm sm:text-base text-gray-900">{feature.title}</h3>
                                                        <p className="text-gray-600 text-xs sm:text-sm mt-1">{feature.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Requisitos */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
                                        <h2 className="text-xl sm:text-2xl font-bold text-[#00246a] mb-4 sm:mb-6">Requisitos</h2>
                                        <ul className="space-y-2 sm:space-y-3">
                                            {extendedCourseData.requirements.map((req, index) => (
                                                <li key={index} className="flex items-start gap-2 sm:gap-3">
                                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#e30f28] rounded-full mt-2 shrink-0"></div>
                                                    <span className="text-sm sm:text-base text-gray-700">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Para quién es este curso */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
                                        <h2 className="text-xl sm:text-2xl font-bold text-[#00246a] mb-4 sm:mb-6">¿Para quién es este curso?</h2>
                                        <div className="space-y-3 sm:space-y-4">
                                            {extendedCourseData.targetAudience.map((audience, index) => (
                                                <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0 mt-0.5" />
                                                    <span className="text-sm sm:text-base text-gray-700">{audience}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'curriculum' && (
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
                                        <h2 className="text-xl sm:text-2xl font-bold text-[#00246a] mb-4 sm:mb-6">Contenido del curso</h2>
                                        <div className="space-y-3 sm:space-y-4">
                                            {extendedCourseData.courseContent.map((section, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg">
                                                    <div className="p-4 sm:p-6 bg-gray-50 rounded-t-lg border-b">
                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                                                {index + 1}. {section.title}
                                                            </h3>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                                                <span>{section.lessons} lecciones</span>
                                                                <span>{section.duration}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 sm:p-6">
                                                        <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                                            {section.topics.map((topic: string | {text?: string; title?: string; name?: string}, topicIndex: number) => (
                                                                <div key={topicIndex} className="flex items-center gap-3">
                                                                    <div className="w-1.5 h-1.5 bg-[#e30f28] rounded-full shrink-0"></div>
                                                                    <span className="text-gray-700">
                                                                        {typeof topic === 'string' ? topic : (topic.text || topic.title || topic.name || String(topic))}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Certificado */}
                                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 p-8">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-yellow-100 p-3 rounded-lg">
                                                <Award className="w-8 h-8 text-yellow-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    Certificado de Finalización
                                                </h3>
                                                <p className="text-gray-700 mb-4">
                                                    Al completar exitosamente el curso recibirás un certificado digital que valida tus conocimientos adquiridos.
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                        Inglés Básico
                                                    </span>
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                        Conversación
                                                    </span>
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                        Gramática Esencial
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'instructor' && (
                                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
                                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#00246a] rounded-full flex items-center justify-center text-white text-lg sm:text-2xl font-bold shrink-0">
                                            {getInstructorInitials()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{extendedCourseData.instructor.name}</h2>
                                            <p className="text-[#e30f28] font-semibold mb-2 text-sm sm:text-base">{extendedCourseData.instructor.title}</p>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                                                    <span>{extendedCourseData.instructor.rating} calificación</span>
                                                </div>
                                                <span className="hidden sm:inline">•</span>
                                                <span>{extendedCourseData.instructor.students}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>{extendedCourseData.instructor.experience}</span>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{extendedCourseData.instructor.bio}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                                        {extendedCourseData.instructor.achievements.map((achievement, index) => (
                                            <div key={index} className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg border">
                                                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#e30f28] mx-auto mb-2" />
                                                <div className="text-xs sm:text-sm font-medium text-gray-900">{achievement}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                                        <a href={`mailto:${extendedCourseData.instructor.email}`} 
                                           className="flex items-center justify-center gap-2 px-4 py-2 bg-[#e30f28] text-white rounded-lg hover:bg-[#c20e24] transition-colors text-sm sm:text-base">
                                            <Mail className="w-4 h-4" />
                                            Contactar instructor
                                        </a>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <ReviewSection 
                                    reviews={reviews.map(review => ({
                                        id: review.id,
                                        rating: review.rating,
                                        comment: review.comment,
                                        created_at: review.created_at.toString(),
                                        updated_at: review.updated_at?.toString(),
                                        student_id: review.student_id,
                                        student: {
                                            usuario: {
                                                id: review.student.usuario.id,
                                                nombre: review.student.usuario.nombre,
                                                apellido: review.student.usuario.apellido
                                            }
                                        }
                                    }))}
                                    courseId={courseData.id_curso}
                                    isEnrolled={isEnrolled}
                                    isOwner={isOwner ? true : false}
                                    isAdmin={session?.user?.extra?.id_admin ? true : false}
                                    onAddReview={handleAddReview}
                                    onUpdateReview={handleUpdateReview}
                                    onDeleteReview={handleDeleteReview}
                                />
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">{/* El contenido del sidebar se mantiene igual */}
                            {/* Estudiantes inscritos */}
                            {courseData.inscripciones && courseData.inscripciones.length > 0 && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-[#00246a] mb-4">
                                        Estudiantes Inscritos ({courseData._count.inscripciones})
                                    </h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {courseData.inscripciones.map((inscripcion, index) => (
                                            <div key={index} className="flex items-center gap-3 py-2">
                                                <div className="w-8 h-8 bg-[#00246a] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                    {inscripcion.student.usuario.nombre[0]}{inscripcion.student.usuario.apellido[0]}
                                                </div>
                                                <span className="text-gray-700 text-sm">
                                                    {inscripcion.student.usuario.nombre} {inscripcion.student.usuario.apellido}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Información adicional */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-[#00246a] mb-4">Información del curso</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Modalidad:</span>
                                        <span className="font-medium">{courseData.modalidad}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Duración:</span>
                                        <span className="font-medium">{calculateDuration()}</span>
                                    </div>
                                    {courseData.inicio && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Inicio:</span>
                                            <span className="font-medium">
                                                {new Date(courseData.inicio).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                    )}
                                    {courseData.fin && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Fin:</span>
                                            <span className="font-medium">
                                                {new Date(courseData.fin).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Estado:</span>
                                        <span className="font-medium text-green-600">Activo</span>
                                    </div>
                                </div>
                            </div>

                            {/* Certificado */}
                            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 p-6">
                                <div className="flex items-start gap-3">
                                    <Trophy className="w-8 h-8 text-yellow-600" />
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            Certificado de Finalización
                                        </h3>
                                        <p className="text-gray-700 text-sm">
                                            Al completar exitosamente el curso recibirás un certificado 
                                            digital que valida tus conocimientos adquiridos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}