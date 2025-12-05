"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, CheckCircle, XCircle, Calendar, Award } from 'lucide-react'
import { StudentOwnExamResult } from '@/types/api'

export default function ExamsContent() {
    const [examResults, setExamResults] = useState<StudentOwnExamResult[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchExamResults = async () => {
            try {
                const response = await fetch('/api/student/exams')
                if (!response.ok) {
                    throw new Error('Error al cargar resultados de exámenes')
                }
                const data = await response.json()
                setExamResults(data.data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido')
            } finally {
                setLoading(false)
            }
        }

        fetchExamResults()
    }, [])

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 dark:bg-slate-700 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 dark:bg-slate-800 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-600 dark:text-red-400">Error: {error}</p>
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
                <GraduationCap className="w-8 h-8 text-[#e30f28] dark:text-red-500 mr-3" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Mis Resultados de Exámenes</h2>
            </div>

            {examResults.length === 0 ? (
                <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-slate-400 text-lg">No tienes exámenes registrados</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {examResults.map((result) => (
                        <motion.div
                            key={result.id_resultado}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                                        {result.examen?.nombre || 'Examen sin nombre'}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        Nivel: {result.examen?.nivel || 'No especificado'}
                                    </p>
                                    {result.examen?.activo !== undefined && (
                                        <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                                            result.examen.activo 
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                                : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300'
                                        }`}>
                                            {result.examen.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center mb-2">
                                        {result.aprobado ? (
                                            <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 mr-2" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-red-500 dark:text-red-400 mr-2" />
                                        )}
                                        <span className={`font-bold ${
                                            result.aprobado ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                                            {result.aprobado ? 'APROBADO' : 'NO APROBADO'}
                                        </span>
                                    </div>
                                    {result.calificacion !== null && result.calificacion !== undefined && (
                                        <div className="text-2xl font-bold text-slate-800 dark:text-white">
                                            {result.calificacion}/100
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(result.fecha).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    )
}
