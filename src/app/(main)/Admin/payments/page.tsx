'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Payment {
  id: number
  estudiante: {
    id: number
    nombre: string
    email: string
  } | null
  curso: {
    id: number
    nombre: string
    modalidad: string
  }
  nivel: string
  profesor: string
  monto: number
  fecha_pago: string
  tipo: string
}

interface PaymentFormData {
  id_estudiante: string
  id_imparte: string
  monto: string
  fecha_pago: string
  tipo: 'Mensualidad'
}

interface Student {
  id: number
  nombre: string
  email: string
}

interface Course {
  id: number
  nombre: string
  profesores: any[]
}

export default function AdminPaymentsPage() {
  const { data: session } = useSession()
  const [payments, setPayments] = useState<Payment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [formData, setFormData] = useState<PaymentFormData>({
    id_estudiante: '',
    id_imparte: '',
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    tipo: 'Mensualidad'
  })

  useEffect(() => {
    fetchPayments()
    fetchStudents()
    fetchCourses()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
      }
    } catch (error) {
      console.error('Error al cargar pagos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/users?role=ESTUDIANTE')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.users.map((user: any) => ({
          id: user.detalles?.id_estudiante || user.id,
          nombre: `${user.nombre} ${user.apellido}`,
          email: user.email
        })))
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error)
    }
  }

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Pago registrado exitosamente')
        setShowCreateForm(false)
        setFormData({
          id_estudiante: '',
          id_imparte: '',
          monto: '',
          fecha_pago: new Date().toISOString().split('T')[0],
          tipo: 'Mensualidad'
        })
        fetchPayments()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al crear pago:', error)
      alert('Error al crear pago')
    }
  }

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este pago?')) return

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Pago eliminado exitosamente')
        fetchPayments()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error al eliminar pago:', error)
      alert('Error al eliminar pago')
    }
  }

  if (!session || session.user?.rol !== 'ADMIN') {
    return <div>No autorizado</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#00246a]">Gestión de Pagos</h1>
        <button
          onClick={() => {
            setShowCreateForm(true)
            setFormData({
              id_estudiante: '',
              id_imparte: '',
              monto: '',
              fecha_pago: new Date().toISOString().split('T')[0],
              tipo: 'Mensualidad'
            })
          }}
          className="bg-[#00246a] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Registrar Pago
        </button>
      </div>

      {/* Lista de pagos */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00246a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pagos...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profesor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.estudiante?.nombre || 'Sin asignar'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.estudiante?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.curso.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.curso.modalidad} - {payment.nivel}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.profesor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${payment.monto.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.fecha_pago).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {payment.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de crear pago */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#00246a]">
                Registrar Nuevo Pago
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estudiante
                  </label>
                  <select
                    value={formData.id_estudiante}
                    onChange={(e) => setFormData({ ...formData, id_estudiante: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  >
                    <option value="">Seleccionar estudiante (opcional)</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.nombre} - {student.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Curso *
                  </label>
                  <select
                    required
                    value={formData.id_imparte}
                    onChange={(e) => setFormData({ ...formData, id_imparte: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  >
                    <option value="">Seleccionar curso</option>
                    {courses.map(course => (
                      course.profesores.map((profesor: any) => (
                        <option key={profesor.id} value={profesor.id}>
                          {course.nombre} - {profesor.nivel} ({profesor.nombre})
                        </option>
                      ))
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Esto asignará el pago a la clase específica del profesor
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Pago *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_pago}
                    onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Pago *
                  </label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'Mensualidad' })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  >
                    <option value="Mensualidad">Mensualidad</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700"
                >
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
