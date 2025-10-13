'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  User,
  BookOpen,
  Download
} from 'lucide-react'

interface Payment {
  id_pago: number
  monto: string
  fecha_pago: string
  tipo: 'Mensualidad'
  id_estudiante: number | null
  id_imparte: number
  estudiante?: {
    id_estudiante: number
    nombre: string
    paterno: string
    materno: string
    usuario: {
      email: string
    }
  }
  imparte: {
    id_imparte: number
    curso: {
      nombre: string
    }
    profesor: {
      nombre: string
      paterno: string
      usuario: {
        email: string
      }
    }
    nivel: {
      nombre: string
    }
  }
}

interface Student {
  id_estudiante: number
  nombre: string
  paterno: string
  materno: string
  usuario: {
    email: string
  }
}

interface CourseClass {
  id_imparte: number
  curso: {
    id_curso: number
    nombre: string
  }
  profesor: {
    nombre: string
    paterno: string
  }
  nivel: {
    nombre: string
  }
}

interface PaymentFormData {
  monto: string
  fecha_pago: string
  tipo: 'Mensualidad'
  id_estudiante: number | null
  id_imparte: number
}

export default function AdminPaymentCrud() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)

  const [formData, setFormData] = useState<PaymentFormData>({
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    tipo: 'Mensualidad',
    id_estudiante: null,
    id_imparte: 0
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(typeFilter !== 'ALL' && { tipo: typeFilter }),
        ...(dateFilter && { fecha: dateFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/payments?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPayments(data.payments)
        setTotalPages(Math.ceil(data.total / 10))
        setTotalAmount(data.totalAmount || 0)
      } else {
        console.error('Error fetching payments:', data.error)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, typeFilter, dateFilter, searchTerm])

  useEffect(() => {
    fetchPayments()
    fetchStudents()
    fetchCourseClasses()
  }, [fetchPayments])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/users?role=ESTUDIANTE&limit=100')
      const data = await response.json()
      if (response.ok) {
        setStudents(data.users.map((user: {
          detalles: { id_estudiante: number };
          nombre: string;
          apellido: string;
          email: string;
        }) => ({
          id_estudiante: user.detalles?.id_estudiante,
          nombre: user.nombre,
          paterno: user.apellido,
          materno: '',
          usuario: { email: user.email }
        })).filter((student: Record<string, unknown>) => student.id_estudiante))
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchCourseClasses = async () => {
    try {
      const response = await fetch('/api/admin/courses/classes')
      const data = await response.json()
      if (response.ok) {
        setCourseClasses(data.classes)
      }
    } catch (error) {
      console.error('Error fetching course classes:', error)
    }
  }

  const handleCreatePayment = () => {
    setEditingPayment(null)
    setFormData({
      monto: '',
      fecha_pago: new Date().toISOString().split('T')[0],
      tipo: 'Mensualidad',
      id_estudiante: null,
      id_imparte: 0
    })
    setErrors({})
    setShowModal(true)
  }

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment)
    setFormData({
      monto: payment.monto,
      fecha_pago: new Date(payment.fecha_pago).toISOString().split('T')[0],
      tipo: payment.tipo,
      id_estudiante: payment.id_estudiante,
      id_imparte: payment.id_imparte
    })
    setErrors({})
    setShowModal(true)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      newErrors.monto = 'Monto debe ser mayor a 0'
    }
    if (!formData.fecha_pago) newErrors.fecha_pago = 'Fecha de pago es requerida'
    if (!formData.id_imparte) newErrors.id_imparte = 'Curso/Clase es requerido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const url = editingPayment ? `/api/admin/payments/${editingPayment.id_pago}` : '/api/admin/payments'
      const method = editingPayment ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          monto: parseFloat(formData.monto)
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage(editingPayment ? 'Pago actualizado exitosamente' : 'Pago registrado exitosamente')
        setShowModal(false)
        fetchPayments()
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrors({ general: data.error || 'Error al guardar pago' })
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión: ' + error })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro de pago?')) return

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccessMessage('Pago eliminado exitosamente')
        fetchPayments()
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar pago')
      }
    } catch (error) {
      alert('Error de conexión: ' + error)
    }
  }

  const handleExportPayments = async () => {
    try {
      const params = new URLSearchParams({
        export: 'true',
        ...(typeFilter !== 'ALL' && { tipo: typeFilter }),
        ...(dateFilter && { fecha: dateFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/payments?${params}`)
      const data = await response.json()

      if (response.ok) {
        // Crear y descargar CSV
        const csvContent = [
          ['Fecha', 'Estudiante', 'Curso', 'Profesor', 'Nivel', 'Tipo', 'Monto'].join(','),
          ...data.payments.map((payment: Payment) => [
            new Date(payment.fecha_pago).toLocaleDateString(),
            payment.estudiante ? `${payment.estudiante.nombre} ${payment.estudiante.paterno}` : 'N/A',
            payment.imparte?.curso?.nombre || 'Sin curso',
            `${payment.imparte?.profesor?.nombre || 'Sin profesor'} ${payment.imparte?.profesor?.paterno || ''}`,
            payment.imparte.nivel.nombre,
            payment.tipo,
            `$${parseFloat(payment.monto).toFixed(2)}`
          ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pagos_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      alert('Error al exportar datos: ' + error)
    }
  }

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-[#00246a]" />
          <div>
            <h1 className="text-2xl font-bold text-[#00246a]">Gestión de Pagos</h1>
            <p className="text-sm text-gray-600">
              Total registrado: <span className="font-semibold text-green-600">{formatCurrency(totalAmount)}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPayments}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar
          </button>
          <button
            onClick={handleCreatePayment}
            className="flex items-center gap-2 bg-[#00246a] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Pago
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por estudiante, curso o profesor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            >
              <option key="ALL" value="ALL">Todos los tipos</option>
              <option key="Mensualidad" value="Mensualidad">Mensualidad</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00246a] mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando pagos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso/Clase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id_pago} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatDate(payment.fecha_pago)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.estudiante ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.estudiante.nombre} {payment.estudiante.paterno}
                            </div>
                            <div className="text-xs text-gray-500">
                              {payment.estudiante.usuario?.email || 'Sin email'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin estudiante</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.imparte?.curso?.nombre || 'Sin curso'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(payment.imparte?.profesor?.nombre || 'Sin profesor') + ' ' + (payment.imparte?.profesor?.paterno || '') + ' • ' + (payment.imparte?.nivel?.nombre || 'Sin nivel')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {payment.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(payment.monto)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPayment(payment)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePayment(payment.id_pago)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Página <span className="font-medium">{currentPage}</span> de{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00246a]">
                {editingPayment ? 'Editar Pago' : 'Registrar Nuevo Pago'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {errors.general && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {errors.general}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                        errors.monto ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.monto && <p className="mt-1 text-sm text-red-600">{errors.monto}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Pago *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_pago}
                    onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                      errors.fecha_pago ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.fecha_pago && <p className="mt-1 text-sm text-red-600">{errors.fecha_pago}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Pago
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'Mensualidad' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  >
                    <option key="Mensualidad" value="Mensualidad">Mensualidad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estudiante
                  </label>
                  <select
                    value={formData.id_estudiante || ''}
                    onChange={(e) => setFormData({ ...formData, id_estudiante: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  >
                    <option key="empty-student" value="">Seleccionar estudiante (opcional)</option>
                    {students.map((student, index) => (
                      <option key={student.id_estudiante ?? `student-${index}`} value={student.id_estudiante}>
                        {student.nombre} {student.paterno} - {student.usuario?.email || 'Sin email'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Curso/Clase *
                  </label>
                  <select
                    value={formData.id_imparte}
                    onChange={(e) => setFormData({ ...formData, id_imparte: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent ${
                      errors.id_imparte ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option key="empty-course" value="">Seleccionar curso/clase</option>
                    {courseClasses.map((courseClass, index) => (
                      <option key={courseClass.id_imparte ?? `course-${index}`} value={courseClass.id_imparte}>
                        {(courseClass.curso?.nombre || 'Sin curso') + ' - ' + (courseClass.nivel?.nombre || 'Sin nivel')}
                        (Prof. {(courseClass.profesor?.nombre || 'Sin profesor') + ' ' + (courseClass.profesor?.paterno || '')})
                      </option>
                    ))}
                  </select>
                  {errors.id_imparte && <p className="mt-1 text-sm text-red-600">{errors.id_imparte}</p>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingPayment ? 'Actualizar' : 'Registrar Pago'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
