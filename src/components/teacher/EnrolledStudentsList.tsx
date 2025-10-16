'use client'

import React, { useState, useEffect } from 'react'
import {
    ArrowLeft,
    Users,
    Mail,
    Phone,
    Calendar,
    UserCheck,
    UserX,
    CheckCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    CreditCard,
    Search,
    Filter,
    Download,
    Loader,
    DollarSign
} from 'lucide-react'
import { CourseWithDetails, EnrolledStudent } from '@/types/course-creation'
import { getCourseDetails } from '@/actions/teacher/courseActions'

interface EnrolledStudentsListProps {
    courseId: number
    teacherId: number
    courseName: string
    onBack: () => void
}

export default function EnrolledStudentsList({ 
    courseId, 
    teacherId, 
    courseName,
    onBack 
}: EnrolledStudentsListProps) {
    const [students, setStudents] = useState<EnrolledStudent[]>([])
    const [filteredStudents, setFilteredStudents] = useState<EnrolledStudent[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [paymentFilter, setPaymentFilter] = useState<string>('all')

    useEffect(() => {
        loadStudents()
    }, [courseId, teacherId])

    useEffect(() => {
        filterStudents()
    }, [students, searchTerm, statusFilter, paymentFilter])

    const loadStudents = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const courseData = await getCourseDetails(courseId, teacherId)

            if (!courseData) {
                setError('Curso no encontrado')
                return
            }

            setStudents(courseData.inscripciones || [])
        } catch (err) {
            console.error('Error loading students:', err)
            setError('Error al cargar los estudiantes')
        } finally {
            setIsLoading(false)
        }
    }

    const filterStudents = () => {
        let filtered = [...students]

        // Filtrar por búsqueda
        if (searchTerm) {
            filtered = filtered.filter(student => {
                const fullName = `${student.student.usuario.nombre} ${student.student.usuario.apellido}`.toLowerCase()
                const email = student.student.usuario.email.toLowerCase()
                const search = searchTerm.toLowerCase()
                return fullName.includes(search) || email.includes(search)
            })
        }

        // Filtrar por estado de inscripción
        if (statusFilter !== 'all') {
            filtered = filtered.filter(student => student.status === statusFilter)
        }

        // Filtrar por estado de pago
        if (paymentFilter !== 'all') {
            filtered = filtered.filter(student => student.payment_status === paymentFilter)
        }

        setFilteredStudents(filtered)
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatCurrency = (amount: any) => {
        const numAmount = Number(amount)
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(numAmount)
    }

    const calculateAttendanceRate = (attendance: any[]) => {
        if (!attendance || attendance.length === 0) return 'N/A'
        const present = attendance.filter(a => a.status === 'PRESENT').length
        return `${((present / attendance.length) * 100).toFixed(0)}%`
    }

    const getStatusConfig = (status: string) => {
        const config = {
            ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Activo', icon: UserCheck },
            COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completado', icon: CheckCircle },
            DROPPED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Retirado', icon: UserX },
            SUSPENDED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Suspendido', icon: AlertCircle },
            TRANSFERRED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Transferido', icon: TrendingUp }
        }
        return config[status as keyof typeof config] || config.ACTIVE
    }

    const getPaymentStatusConfig = (status: string) => {
        const config = {
            PAID: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pagado', icon: CheckCircle },
            PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente', icon: Clock },
            OVERDUE: { bg: 'bg-red-100', text: 'text-red-800', label: 'Vencido', icon: AlertCircle },
            REFUNDED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Reembolsado', icon: CreditCard },
            CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelado', icon: UserX }
        }
        return config[status as keyof typeof config] || config.PENDING
    }

    const getStats = () => {
        return {
            total: students.length,
            active: students.filter(s => s.status === 'ACTIVE').length,
            completed: students.filter(s => s.status === 'COMPLETED').length,
            paymentPending: students.filter(s => s.payment_status === 'PENDING' || s.payment_status === 'OVERDUE').length,
            paymentPaid: students.filter(s => s.payment_status === 'PAID').length
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-[#00246a]" />
                    <p className="text-gray-600">Cargando estudiantes...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{error}</h3>
                    <button
                        onClick={onBack}
                        className="mt-4 px-6 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver al curso
                    </button>
                </div>
            </div>
        )
    }

    const stats = getStats()

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                    <div className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                <button
                                    onClick={onBack}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0 py-1"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span className="hidden sm:inline">Volver</span>
                                </button>
                                <div className="h-8 w-px bg-gray-300 hidden sm:block" />
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-lg sm:text-2xl font-bold text-[#00246a]">Estudiantes Inscritos</h1>
                                    <p className="text-xs sm:text-sm text-gray-600 truncate">Curso: {courseName}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1 sm:flex-none text-sm sm:text-base"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="hidden sm:inline">Exportar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Estadísticas */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                                    <p className="text-xs sm:text-sm text-gray-600">Total</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.active}</p>
                                    <p className="text-xs sm:text-sm text-gray-600">Activos</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completed}</p>
                                    <p className="text-xs sm:text-sm text-gray-600">Completados</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.paymentPending}</p>
                                    <p className="text-xs sm:text-sm text-gray-600 truncate">Pago Pendiente</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 col-span-2 sm:col-span-1">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.paymentPaid}</p>
                                    <p className="text-xs sm:text-sm text-gray-600">Pagos al Día</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="ACTIVE">Activos</option>
                                    <option value="COMPLETED">Completados</option>
                                    <option value="SUSPENDED">Suspendidos</option>
                                    <option value="DROPPED">Retirados</option>
                                    <option value="TRANSFERRED">Transferidos</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                <select
                                    value={paymentFilter}
                                    onChange={(e) => setPaymentFilter(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                                >
                                    <option value="all">Estado de pago</option>
                                    <option value="PAID">Pagado</option>
                                    <option value="PENDING">Pendiente</option>
                                    <option value="OVERDUE">Vencido</option>
                                    <option value="REFUNDED">Reembolsado</option>
                                    <option value="CANCELLED">Cancelado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Estudiantes */}
                    {filteredStudents.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                            <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">
                                {students.length === 0 ? 'No hay estudiantes inscritos' : 'No se encontraron estudiantes'}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-500">
                                {students.length === 0 
                                    ? 'Cuando los estudiantes se inscriban, aparecerán aquí'
                                    : 'Intenta ajustar los filtros de búsqueda'
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Vista de tabla para desktop */}
                            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Estudiante
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Contacto
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Estado
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Pago
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Último Pago
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Asistencia
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Inscrito
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredStudents.map((enrollment) => {
                                                const statusConfig = getStatusConfig(enrollment.status)
                                                const paymentConfig = getPaymentStatusConfig(enrollment.payment_status)
                                                const StatusIcon = statusConfig.icon
                                                const PaymentIcon = paymentConfig.icon
                                                const lastPayment = enrollment.payments && enrollment.payments.length > 0 ? enrollment.payments[0] : null

                                                return (
                                                    <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                                                    {enrollment.student.usuario.nombre.charAt(0)}{enrollment.student.usuario.apellido.charAt(0)}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-medium text-gray-900 truncate">
                                                                        {enrollment.student.usuario.nombre} {enrollment.student.usuario.apellido}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {enrollment.student.edad} años
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Mail className="w-3 h-3 flex-shrink-0" />
                                                                    <span className="truncate max-w-xs">{enrollment.student.usuario.email}</span>
                                                                </div>
                                                                {enrollment.student.telefono && (
                                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                        <Phone className="w-3 h-3 flex-shrink-0" />
                                                                        <span>{enrollment.student.telefono}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {statusConfig.label}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentConfig.bg} ${paymentConfig.text}`}>
                                                            <PaymentIcon className="w-3 h-3" />
                                                            {paymentConfig.label}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        {lastPayment ? (
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {formatCurrency(lastPayment.amount)}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {formatDate(lastPayment.payment_date)}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">Sin pagos</span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-medium text-gray-900">
                                                                {calculateAttendanceRate(enrollment.attendance || [])}
                                                            </div>
                                                            {enrollment.attendance && enrollment.attendance.length > 0 && (
                                                                <div className="text-xs text-gray-500">
                                                                    ({enrollment.attendance.length} reg.)
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Calendar className="w-3 h-3 flex-shrink-0" />
                                                            {formatDate(enrollment.enrolled_at)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Contador de resultados */}
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    Mostrando <span className="font-medium">{filteredStudents.length}</span> de{' '}
                                    <span className="font-medium">{students.length}</span> estudiante{students.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>

                        {/* Vista de cards para móvil/tablet */}
                        <div className="lg:hidden space-y-4">
                            {filteredStudents.map((enrollment) => {
                                const statusConfig = getStatusConfig(enrollment.status)
                                const paymentConfig = getPaymentStatusConfig(enrollment.payment_status)
                                const StatusIcon = statusConfig.icon
                                const PaymentIcon = paymentConfig.icon
                                const lastPayment = enrollment.payments && enrollment.payments.length > 0 ? enrollment.payments[0] : null

                                return (
                                    <div key={enrollment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                        {/* Header del card */}
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {enrollment.student.usuario.nombre.charAt(0)}{enrollment.student.usuario.apellido.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {enrollment.student.usuario.nombre} {enrollment.student.usuario.apellido}
                                                </h3>
                                                <p className="text-sm text-gray-500">{enrollment.student.edad} años</p>
                                            </div>
                                        </div>

                                        {/* Contacto */}
                                        <div className="space-y-2 mb-4 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="w-4 h-4 flex-shrink-0" />
                                                <span className="truncate">{enrollment.student.usuario.email}</span>
                                            </div>
                                            {enrollment.student.telefono && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                                    <span>{enrollment.student.telefono}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusConfig.label}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentConfig.bg} ${paymentConfig.text}`}>
                                                <PaymentIcon className="w-3 h-3" />
                                                {paymentConfig.label}
                                            </span>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {lastPayment && (
                                                <div className="bg-gray-50 rounded p-2">
                                                    <div className="text-xs text-gray-500 mb-1">Último Pago</div>
                                                    <div className="font-semibold text-gray-900">{formatCurrency(lastPayment.amount)}</div>
                                                    <div className="text-xs text-gray-500">{formatDate(lastPayment.payment_date)}</div>
                                                </div>
                                            )}
                                            <div className="bg-gray-50 rounded p-2">
                                                <div className="text-xs text-gray-500 mb-1">Asistencia</div>
                                                <div className="font-semibold text-gray-900">{calculateAttendanceRate(enrollment.attendance || [])}</div>
                                                {enrollment.attendance && enrollment.attendance.length > 0 && (
                                                    <div className="text-xs text-gray-500">{enrollment.attendance.length} registros</div>
                                                )}
                                            </div>
                                            <div className="bg-gray-50 rounded p-2 col-span-2">
                                                <div className="text-xs text-gray-500 mb-1">Inscrito el</div>
                                                <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(enrollment.enrolled_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            
                            {/* Contador de resultados móvil */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 text-center">
                                <p className="text-sm text-gray-600">
                                    Mostrando <span className="font-medium">{filteredStudents.length}</span> de{' '}
                                    <span className="font-medium">{students.length}</span> estudiante{students.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
