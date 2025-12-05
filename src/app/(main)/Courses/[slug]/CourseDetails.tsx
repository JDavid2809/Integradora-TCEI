"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
    ArrowLeft, 

    Clock, 
    Users, 
    BookOpen, 
    CheckCircle,
    Star,
    Play,
    Download,
    Award,
    Target,
    Zap,
    Smartphone,
    Trophy,
    Mail,
    GraduationCap,
    MessageCircle,
    Video,
    FileText,
    Headphones,
    ShoppingCart
} from 'lucide-react'
import { DetailedCursoFromDB, DetailedCourseForDisplay } from '@/types/courses'
import { handleCourseEnrollmentModern, checkUserEnrollmentStatusModern } from '@/actions/courses/modernEnrollments'

// Tipos específicos para evitar any
interface CourseDataWithCount {
    _count?: {
        inscripciones?: number
    }
    inscripciones?: Array<{
        student: {
            usuario: {
                nombre: string
                apellido: string
            }
        }
    }>
}

type DetailedCourseWithRelations = DetailedCursoFromDB & CourseDataWithCount


interface CourseDetailsProps {
    courseData: DetailedCourseWithRelations
}

interface EnrollmentStatus {
    isLoggedIn: boolean
    isEnrolled: boolean
    userId?: string
}

export default function CourseDetails({ courseData }: CourseDetailsProps) {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [isEnrolling, setIsEnrolling] = useState(false)
    const [isPurchasing, setIsPurchasing] = useState(false)
    const [isLoadingStatus ] = useState(false) // Iniciar sin estado de carga
    const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>({
        isLoggedIn: false,
        isEnrolled: false
    })
    const [enrollmentMessage, setEnrollmentMessage] = useState<string>('')
    const [activeTab, setActiveTab] = useState('overview')
    const [hasCheckedEnrollment, setHasCheckedEnrollment] = useState(false)
    
    // Estado derivado para mostrar botón inmediatamente
    const shouldShowLoadingButton = isLoadingStatus && session?.user

    const getCacheKey = useCallback(() => `enrollment_${courseData.id_curso}_${session?.user?.id || 'anonymous'}`, [courseData.id_curso, session?.user?.id])
    
    const getCachedEnrollmentStatus = useCallback(() => {
        if (typeof window === 'undefined') return null
        try {
            const cached = localStorage.getItem(getCacheKey())
            if (cached) {
                const parsed = JSON.parse(cached)
                // Cache válido por 5 minutos
                if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
                    return parsed.data
                }
            }
        } catch (error) {
            console.error('Error reading cache:', error)
        }
        return null
    }, [getCacheKey])

    const setCachedEnrollmentStatus = useCallback((status: EnrollmentStatus) => {
        if (typeof window === 'undefined') return
        try {
            localStorage.setItem(getCacheKey(), JSON.stringify({
                data: status,
                timestamp: Date.now()
            }))
        } catch (error) {
            console.error('Error setting cache:', error)
        }
    }, [getCacheKey])

    // Verificar estado de sesión y inscripción al cargar el componente
    useEffect(() => {
        const checkStatus = async () => {
            if (status === 'loading') return

            // Solo verificar si hay una sesión nueva o no hemos verificado aún
            if (session?.user && !hasCheckedEnrollment) {
                // Primero intentar usar cache
                const cachedStatus = getCachedEnrollmentStatus()
                if (cachedStatus) {
                    setEnrollmentStatus(cachedStatus)
                    setHasCheckedEnrollment(true)
                    return
                }

                // Si no hay cache, verificación silenciosa en el fondo
                try {
                    const enrollmentStatusResult = await checkUserEnrollmentStatusModern(courseData.id_curso)
                    setEnrollmentStatus(enrollmentStatusResult)
                    setCachedEnrollmentStatus(enrollmentStatusResult) // Guardar en cache
                    setHasCheckedEnrollment(true)
                } catch (error) {
                    console.error('Error checking enrollment status:', error)
                    const fallbackStatus = {
                        isLoggedIn: true,
                        isEnrolled: false,
                        userId: session.user.id
                    }
                    setEnrollmentStatus(fallbackStatus)
                    setCachedEnrollmentStatus(fallbackStatus)
                    setHasCheckedEnrollment(true)
                }
            } else if (!session?.user) {
                // Sin sesión, establecer estado directamente
                setEnrollmentStatus({
                    isLoggedIn: false,
                    isEnrolled: false
                })
                setHasCheckedEnrollment(false) // Reset para cuando haya sesión
            }
        }

        checkStatus()
    }, [courseData.id_curso, session, status, hasCheckedEnrollment, getCachedEnrollmentStatus, setCachedEnrollmentStatus])

    // Datos extendidos del curso (estos vendrían de la BD en el futuro)
    const extendedCourseData = {
        whatYouWillLearn: [
            "Comunicarte con confianza en situaciones cotidianas",
            "Entender conversaciones básicas en inglés",
            "Escribir textos simples y coherentes",
            "Mejorar tu pronunciación y fluidez",
            "Usar gramática esencial correctamente",
            "Ampliar tu vocabulario de forma efectiva"
        ],
        requirements: [
            "No se requiere experiencia previa en inglés",
            "Acceso a internet para clases online",
            "Dedicación de al menos 2 horas por semana",
            "Ganas de aprender y practicar"
        ],
        targetAudience: [
            "Principiantes que quieren aprender inglés desde cero",
            "Estudiantes que desean mejorar su nivel actual",
            "Profesionales que necesitan inglés para el trabajo",
            "Personas que planean viajar a países de habla inglesa"
        ],
        courseContent: [
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
        certificate: {
            title: "Certificado de Finalización",
            description: "Al completar exitosamente el curso recibirás un certificado digital que valida tus conocimientos adquiridos.",
            skills: ["Inglés Básico", "Conversación", "Gramática Esencial", "Vocabulario Fundamental"]
        },
        instructor: {
            name: courseData.imparte[0] ? 
                `${courseData.imparte[0].profesor.usuario.nombre} ${courseData.imparte[0].profesor.usuario.apellido}` : 
                'Instructor por asignar',
            title: courseData.imparte[0] ? "Profesor Certificado de Inglés" : "Instructor por asignar",
            experience: courseData.imparte[0] ? "Experiencia comprobada" : "N/A",
            students: `${courseData._count.inscripciones}+ estudiantes`,
            rating: 4.8, // Podría calcularse dinámicamente desde reviews
            bio: courseData.imparte[0] ? 
                `Especialista en enseñanza de inglés nivel ${courseData.imparte[0].nivel.nombre}. Experto en metodologías comunicativas y aprendizaje dinámico para la modalidad ${courseData.modalidad.toLowerCase()}.` :
                "Instructor especializado por asignar.",
            email: courseData.imparte[0]?.profesor.usuario.email || 'instructor@tcei.edu',
            achievements: courseData.imparte[0] ? [
                "Certificación Profesional", 
                `Nivel ${courseData.imparte[0].nivel.nombre} Especializado`, 
                "Metodología Moderna", 
                `${courseData._count.inscripciones}+ estudiantes activos`
            ] : ["Instructor por asignar"]
        },
        features: [
            { icon: Video, title: "Clases en vivo", description: "Sesiones interactivas con tu instructor" },
            { icon: Download, title: "Material descargable", description: "PDFs, audios y ejercicios para practicar" },
            { icon: Smartphone, title: "Acceso móvil", description: "Estudia desde cualquier dispositivo" },
            { icon: Headphones, title: "Audio nativo", description: "Pronunciación de hablantes nativos" },
            { icon: MessageCircle, title: "Soporte 24/7", description: "Ayuda cuando la necesites" },
            { icon: Trophy, title: "Certificado", description: "Certificado digital al finalizar" }
        ],
        stats: {
            totalHours: "40 horas de contenido",
            lessons: "45 lecciones",
            exercises: "200+ ejercicios",
            projects: "5 proyectos prácticos"
        }
    }

    // Convertir datos de BD al formato de display
    const course: DetailedCourseForDisplay = {
        id: courseData.id_curso,
        title: courseData.nombre,
        description: courseData.descripcion || 
            `Curso completo de inglés modalidad ${courseData.modalidad.toLowerCase()}. Desarrolla tus habilidades comunicativas con metodología moderna y práctica.`,
        instructor: extendedCourseData.instructor,
        level: courseData.imparte[0]?.nivel?.nombre || 'A1',
        modalidad: courseData.modalidad,
        duration: courseData.inicio && courseData.fin ? 
            `${Math.ceil((new Date(courseData.fin).getTime() - new Date(courseData.inicio).getTime()) / (1000 * 60 * 60 * 24 * 7))} semanas` : 
            '10 semanas',
        startDate: courseData.inicio ? new Date(courseData.inicio).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
        }) : '15 de octubre de 2025',
        endDate: courseData.fin ? new Date(courseData.fin).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : '20 de diciembre de 2025',
        enrolledStudents: courseData._count?.inscripciones || 0,
        maxStudents: 25,
        price: '$199',
        originalPrice: '$299',
        image: "",
        features: [],
        curriculum: [],
        enrolledStudentsList: (courseData.inscripciones || []).map((inscripcion) => ({
            name: `${inscripcion.student.usuario.nombre} ${inscripcion.student.usuario.apellido}`
        })),
        isEnrollmentOpen: true, // Siempre permitir inscripciones para demo
        status: courseData.inicio && courseData.fin ? 
            (new Date() < new Date(courseData.inicio) ? 'upcoming' : 
             new Date() > new Date(courseData.fin) ? 'completed' : 'active') : 'upcoming'
    }

    const handleEnroll = async () => {
        // Si no hay sesión, redirigir a login (sin callback)
        if (!session) {
            router.push('/Login')
            return
        }

        // Si ya está inscrito, no hacer nada
        if (enrollmentStatus.isEnrolled) {
            setEnrollmentMessage('Ya estás inscrito en este curso')
            return
        }

        // Si tiene sesión pero no está inscrito, simular compra
        setIsPurchasing(true)
        setEnrollmentMessage('')

        try {
            // Simular proceso de compra (aquí iría la lógica de pago real)
            setEnrollmentMessage('Procesando compra...')
            await new Promise(resolve => setTimeout(resolve, 2000)) // Simular delay de pago

            // Una vez "comprado", proceder con la inscripción
            setIsEnrolling(true)
            setIsPurchasing(false)
            setEnrollmentMessage('Compra exitosa. Inscribiendo en el curso...')

            const result = await handleCourseEnrollmentModern(course.id)
            
            if (result.success) {
                const newStatus = {
                    ...enrollmentStatus,
                    isEnrolled: true
                }
                setEnrollmentStatus(newStatus)
                setCachedEnrollmentStatus(newStatus) // Actualizar cache
                setEnrollmentMessage('¡Compra e inscripción exitosa! Ya tienes acceso al curso')
                // Opcional: recargar para actualizar el estado
                setTimeout(() => {
                    window.location.reload()
                }, 2000)
            } else {
                setEnrollmentMessage(result.error || 'Error en la inscripción después de la compra')
            }
        } catch (error) {
            console.error('Error during purchase/enrollment:', error)
            setEnrollmentMessage('Error durante el proceso de compra. Intenta nuevamente.')
        } finally {
            setIsEnrolling(false)
            setIsPurchasing(false)
        }
    }

    // // Optimizar cálculos con useMemo
    // const buttonText = useMemo(() => {
    //     if (isPurchasing) return 'Procesando compra...'
    //     if (isEnrolling) return 'Inscribiendo...'
    //     if (shouldShowLoadingButton) return 'Verificando estado...'
    //     if (!session) return 'Iniciar sesión para comprar'
    //     if (enrollmentStatus.isEnrolled) return 'Ya inscrito ✓'
    //     if (course.enrolledStudents >= course.maxStudents) return 'Curso lleno'
    //     if (!course.isEnrollmentOpen) return 'Inscripciones cerradas'
    //     return 'Comprar ahora'
    // }, [isPurchasing, isEnrolling, shouldShowLoadingButton, !!session, enrollmentStatus.isEnrolled, course.enrolledStudents, course.maxStudents, course.isEnrollmentOpen])

    // Extraer expresión compleja para useMemo
    const userLoggedIn = !!session
    const isUserEnrolled = enrollmentStatus.isEnrolled

    const buttonDisabled = useMemo(() => {
        return isPurchasing || 
               isEnrolling ||
               shouldShowLoadingButton ||
               status === 'loading' ||
               (userLoggedIn && isUserEnrolled) ||
               course.enrolledStudents >= course.maxStudents ||
               !course.isEnrollmentOpen
    }, [isPurchasing, isEnrolling, shouldShowLoadingButton, status, userLoggedIn, isUserEnrolled, course.enrolledStudents, course.maxStudents, course.isEnrollmentOpen])

    
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

    const tabs = [
        { id: 'overview', label: 'Resumen', icon: BookOpen },
        { id: 'curriculum', label: 'Contenido', icon: FileText },
        { id: 'instructor', label: 'Instructor', icon: GraduationCap },
        { id: 'reviews', label: 'Reseñas', icon: Star }
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Header con navegación */}
            <div className="bg-white shadow-sm  sticky top-0 z-40">
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

            {/* Hero Section Blanco */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                        {/* Información del curso */}
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${getLevelColor(course.level)}`}>
                                        Nivel {course.level}
                                    </span>
                                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                        {course.modalidad}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs sm:text-sm font-medium text-gray-700">4.8 (350)</span>
                                    </div>
                                </div>
                                
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#00246a] leading-tight">
                                    {course.title}
                                </h1>
                                
                                <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
                                    {course.description}
                                </p>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm sm:text-base text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#e30f28]" />
                                        <span className="truncate">Por {extendedCourseData.instructor.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#e30f28]" />
                                        <span>{extendedCourseData.instructor.students}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#e30f28]" />
                                        <span className="text-xs sm:text-sm">Oct 2025</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats del curso en cards blancas */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center border">
                                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#e30f28]">{extendedCourseData.stats.totalHours}</div>
                                    <div className="text-xs sm:text-sm text-gray-600">de contenido</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center border">
                                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#e30f28]">{extendedCourseData.stats.lessons}</div>
                                    <div className="text-xs sm:text-sm text-gray-600">lecciones</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center border">
                                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#e30f28]">{extendedCourseData.stats.exercises}</div>
                                    <div className="text-xs sm:text-sm text-gray-600">ejercicios</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center border">
                                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#e30f28]">{course.enrolledStudents}</div>
                                    <div className="text-xs sm:text-sm text-gray-600">estudiantes</div>
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta de precio - más elegante */}
                        <div className="lg:col-span-1 order-first lg:order-last">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-24">
                                <div className="relative">
                                    <Image
                                        src={course.image}
                                        alt={course.title}
                                        width={400}
                                        height={225}
                                        className="w-full h-36 sm:h-48 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                        <button className="bg-white hover:bg-gray-100 rounded-full p-2 sm:p-3 transition-all transform hover:scale-110 shadow-lg">
                                            <Play className="w-5 h-5 sm:w-6 sm:h-6 text-[#e30f28] ml-1" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-4 sm:p-6">
                                    <div className="text-center mb-6">
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <span className="text-3xl font-bold text-[#00246a]">{course.price}</span>
                                            <span className="text-lg text-gray-400 line-through">{course.originalPrice}</span>
                                        </div>
                                        <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                            33% de descuento
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleEnroll}
                                        disabled={buttonDisabled as boolean}
                                        className="w-full bg-[#e30f28] hover:bg-[#c20e24] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none mb-4"
                                    >
                                        {isPurchasing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Procesando compra...
                                            </>
                                        ) : isEnrolling ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Inscribiendo...
                                            </>
                                        ) : shouldShowLoadingButton ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Verificando estado...
                                            </>
                                        ) : !session ? (
                                            <>
                                                <BookOpen className="w-5 h-5" />
                                                Iniciar sesión para comprar
                                            </>
                                        ) : enrollmentStatus.isEnrolled ? (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                Ya inscrito ✓
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-5 h-5" />
                                                Comprar ahora
                                            </>
                                        )}
                                    </button>

                                    {enrollmentMessage && (
                                        <div className={`mb-4 p-3 rounded-lg text-sm text-center ${
                                            enrollmentMessage.includes('exitosa') || enrollmentMessage.includes('inscrito') 
                                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                                : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                            {enrollmentMessage}
                                        </div>
                                    )}

                                    <div className="text-center text-sm text-gray-500 mb-4">
                                        Garantía de satisfacción de 30 días
                                    </div>

                                    {/* Información del curso */}
                                    <div className="space-y-3 text-sm">
                                        <h4 className="font-semibold text-gray-900 mb-3">Este curso incluye:</h4>
                                        <div className="flex items-center gap-3">
                                            <Video className="w-4 h-4 text-gray-600" />
                                            <span className="text-gray-700">40 horas de video bajo demanda</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Download className="w-4 h-4 text-gray-600" />
                                            <span className="text-gray-700">Recursos descargables</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Smartphone className="w-4 h-4 text-gray-600" />
                                            <span className="text-gray-700">Acceso en móvil y TV</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Trophy className="w-4 h-4 text-gray-600" />
                                            <span className="text-gray-700">Certificado de finalización</span>
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
                                                            {section.topics.map((topic, topicIndex) => (
                                                                <div key={topicIndex} className="flex items-center gap-3">
                                                                    <Play className="w-4 h-4 text-[#e30f28]" />
                                                                    <span className="text-gray-700">{topic}</span>
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
                                                    {extendedCourseData.certificate.title}
                                                </h3>
                                                <p className="text-gray-700 mb-4">
                                                    {extendedCourseData.certificate.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {extendedCourseData.certificate.skills.map((skill, index) => (
                                                        <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'instructor' && (
                                <div className="bg-white rounded-lg border border-gray-200 p-8">
                                    <div className="flex items-start gap-6 mb-8">
                                        <div className="w-24 h-24 bg-[#00246a] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                            {extendedCourseData.instructor.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">{extendedCourseData.instructor.name}</h2>
                                            <p className="text-[#e30f28] font-semibold mb-2">{extendedCourseData.instructor.title}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <span>{extendedCourseData.instructor.rating} calificación</span>
                                                </div>
                                                <span>{extendedCourseData.instructor.students}</span>
                                                <span>{extendedCourseData.instructor.experience}</span>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">{extendedCourseData.instructor.bio}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        {extendedCourseData.instructor.achievements.map((achievement, index) => (
                                            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg border">
                                                <Trophy className="w-6 h-6 text-[#e30f28] mx-auto mb-2" />
                                                <div className="text-sm font-medium text-gray-900">{achievement}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <a href={`mailto:${extendedCourseData.instructor.email}`} 
                                           className="flex items-center gap-2 px-4 py-2 bg-[#e30f28] text-white rounded-lg hover:bg-[#c20e24] transition-colors">
                                            <Mail className="w-4 h-4" />
                                            Contactar instructor
                                        </a>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="bg-white rounded-lg border border-gray-200 p-8">
                                    <h2 className="text-2xl font-bold text-[#00246a] mb-6">Reseñas de estudiantes</h2>
                                    <div className="text-center py-12 text-gray-500">
                                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>Las reseñas aparecerán aquí una vez que los estudiantes completen el curso.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Estudiantes inscritos */}
                            {course.enrolledStudentsList.length > 0 && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-[#00246a] mb-4">
                                        Estudiantes Inscritos ({course.enrolledStudents})
                                    </h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {course.enrolledStudentsList.map((student, index) => (
                                            <div key={index} className="flex items-center gap-3 py-2">
                                                <div className="w-8 h-8 bg-[#00246a] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                    {student.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="text-gray-700 text-sm">{student.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Cursos relacionados */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-[#00246a] mb-4">Cursos relacionados</h3>
                                <div className="space-y-4">
                                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                                        <h4 className="font-medium text-gray-900">Inglés Intermedio B1</h4>
                                        <p className="text-sm text-gray-600">Continúa tu aprendizaje</p>
                                        <div className="text-sm text-[#e30f28] font-semibold mt-2">$249</div>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                                        <h4 className="font-medium text-gray-900">Conversación Avanzada</h4>
                                        <p className="text-sm text-gray-600">Perfecciona tu fluidez</p>
                                        <div className="text-sm text-[#e30f28] font-semibold mt-2">$199</div>
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