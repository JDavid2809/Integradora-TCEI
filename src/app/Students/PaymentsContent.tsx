"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, DollarSign, Calendar, Book } from 'lucide-react'
import { StudentOwnPayment } from '@/types/api'

export default function PaymentsContent() {
    const [payments, setPayments] = useState<StudentOwnPayment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await fetch('/api/student/payments')
                if (!response.ok) {
                    throw new Error('Error al cargar pagos')
                }
                const data = await response.json()
                setPayments(data.data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido')
            } finally {
                setLoading(false)
            }
        }

        fetchPayments()
    }, [])

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Error: {error}</p>
                </div>
            </div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6"
        >
            <div className="flex items-center mb-6">
                <CreditCard className="w-8 h-8 text-[#e30f28] mr-3" />
                <h2 className="text-2xl font-bold text-slate-800">Mi Historial de Pagos</h2>
            </div>

            {payments.length === 0 ? (
                <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No tienes pagos registrados</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {payments.map((payment) => (
                        <motion.div
                            key={payment.id_pago}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-1">
                                        {payment.curso.nombre}
                                    </h3>
                                    <p className="text-sm text-slate-600">
                                        {payment.curso.modalidad} • {payment.curso.nivel}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Profesor: {payment.curso.profesor}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-600">
                                        ${payment.monto.toLocaleString()}
                                    </div>
                                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        {payment.tipo}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center text-sm text-slate-500">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(payment.fecha).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    )
}
