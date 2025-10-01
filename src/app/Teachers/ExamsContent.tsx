"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Eye, User, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { TeacherLevelExam, TeacherStudentExamResult } from '@/types/api'

export default function ExamsContent() {
    const [exams, setExams] = useState<TeacherLevelExam[]>([])
    const [examResults, setExamResults] = useState<TeacherStudentExamResult[]>([])
    const [activeTab, setActiveTab] = useState<'exams' | 'results'>('exams')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch exams
                const examsResponse = await fetch('/api/teacher/exams')
                if (!examsResponse.ok) {
                    throw new Error('Error al cargar exámenes')
                }
                const examsData = await examsResponse.json()
                setExams(examsData.data || [])

                // Fetch exam results
                const resultsResponse = await fetch('/api/teacher/exam-results')
                if (!resultsResponse.ok) {
                    throw new Error('Error al cargar resultados')
                }
                const resultsData = await resultsResponse.json()
                setExamResults(resultsData.data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
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
                <GraduationCap className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-slate-800">Gestión de Exámenes</h2>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
                <button
                    onClick={() => setActiveTab('exams')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'exams'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    Exámenes de mi Nivel ({exams.length})
                </button>
                <button
                    onClick={() => setActiveTab('results')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'results'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    Resultados de Estudiantes ({examResults.length})
                </button>
            </div>

            {/* Exams Tab */}
            {activeTab === 'exams' && (
                <div className="space-y-4">
                    {exams.length === 0 ? (
                        <div className="text-center py-12">
                            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No hay exámenes para tu nivel</p>
                        </div>
                    ) : (
                        exams.map((exam) => (
                            <motion.div
                                key={exam.id_examen}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                            {exam.nombre}
                                        </h3>
                                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                                            <span>Nivel: {exam.nivel}</span>
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                                exam.activo 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {exam.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                        <Eye className="w-4 h-4" />
                                        <span>Ver Detalles</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Results Tab */}
            {activeTab === 'results' && (
                <div className="space-y-4">
                    {examResults.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No hay resultados de exámenes</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Estudiante
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Examen
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Fecha
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Calificación
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {examResults.map((result) => (
                                            <tr key={result.id_resultado} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                            <User className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900">
                                                                {result.estudiante.nombre} {result.estudiante.paterno}
                                                            </div>
                                                            <div className="text-sm text-slate-500">
                                                                {result.estudiante.usuario.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-900">
                                                        {result.examen?.nombre || 'Examen eliminado'}
                                                    </div>
                                                    <div className="text-sm text-slate-500">
                                                        Nivel: {result.examen?.nivel || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                                        {new Date(result.fecha).toLocaleDateString('es-ES')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {result.calificacion !== null && result.calificacion !== undefined
                                                            ? `${result.calificacion}/100`
                                                            : 'Sin calificar'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {result.aprobado ? (
                                                            <>
                                                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                                                <span className="text-green-800 text-sm font-medium">
                                                                    Aprobado
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-4 h-4 text-red-500 mr-2" />
                                                                <span className="text-red-800 text-sm font-medium">
                                                                    No Aprobado
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    )
}
