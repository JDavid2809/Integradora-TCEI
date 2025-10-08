"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, User, Edit, Save, X } from 'lucide-react'
import { TeacherManagedAttendance, TeacherUpdateAttendanceRequest } from '@/types/api'

export default function AttendanceContent() {
    const [attendance, setAttendance] = useState<TeacherManagedAttendance[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editData, setEditData] = useState<Partial<TeacherUpdateAttendanceRequest>>({})

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await fetch('/api/teacher/attendance')
                if (!response.ok) {
                    throw new Error('Error al cargar asistencia')
                }
                const data = await response.json()
                setAttendance(data.data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido')
            } finally {
                setLoading(false)
            }
        }

        fetchAttendance()
    }, [])

    const handleEdit = (record: TeacherManagedAttendance) => {
        setEditingId(record.id_historial)
        setEditData({
            id_historial: record.id_historial,
            asistencia: record.asistencia,
            calificacion: record.calificacion,
            tipo: record.tipo,
            tipo_evaluacion: record.tipo_evaluacion,
            comentario: record.comentario
        })
    }

    const handleSave = async () => {
        if (!editingId || !editData) return

        try {
            const response = await fetch('/api/teacher/attendance', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editData),
            })

            if (!response.ok) {
                throw new Error('Error al actualizar asistencia')
            }

            // Actualizar la lista local
            setAttendance(prev => prev.map(record => 
                record.id_historial === editingId 
                    ? { ...record, ...editData }
                    : record
            ))

            setEditingId(null)
            setEditData({})
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar')
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditData({})
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
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
                <CheckSquare className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-slate-800">Gestión de Asistencia</h2>
                <span className="ml-4 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {attendance.length} registros
                </span>
            </div>

            {attendance.length === 0 ? (
                <div className="text-center py-12">
                    <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No hay registros de asistencia</p>
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
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Asistencia
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Calificación
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {attendance.map((record) => (
                                    <tr key={record.id_historial} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {record.estudiante.nombre} {record.estudiante.paterno}
                                                    </div>
                                                    <div className="text-sm text-slate-500">
                                                        {record.estudiante.usuario.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {new Date(record.fecha).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingId === record.id_historial ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="1"
                                                    step="0.1"
                                                    value={editData.asistencia || ''}
                                                    onChange={(e) => setEditData(prev => ({
                                                        ...prev,
                                                        asistencia: parseFloat(e.target.value)
                                                    }))}
                                                    className="w-20 px-2 py-1 border border-slate-300 rounded text-sm"
                                                />
                                            ) : (
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    record.asistencia === 1 
                                                        ? 'bg-green-100 text-green-800'
                                                        : record.asistencia === 0
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {record.asistencia === 1 ? 'Presente' : 
                                                     record.asistencia === 0 ? 'Ausente' : 
                                                     record.asistencia ? `${record.asistencia * 100}%` : 'Sin registrar'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingId === record.id_historial ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={editData.calificacion || ''}
                                                    onChange={(e) => setEditData(prev => ({
                                                        ...prev,
                                                        calificacion: parseFloat(e.target.value)
                                                    }))}
                                                    className="w-20 px-2 py-1 border border-slate-300 rounded text-sm"
                                                />
                                            ) : (
                                                <span className="text-sm text-slate-900">
                                                    {record.calificacion ? `${record.calificacion}/100` : 'Sin calificar'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingId === record.id_historial ? (
                                                <select
                                                    value={editData.tipo || ''}
                                                    onChange={(e) => setEditData(prev => ({
                                                        ...prev,
                                                        tipo: e.target.value
                                                    }))}
                                                    className="px-2 py-1 border border-slate-300 rounded text-sm"
                                                >
                                                    <option value="">Seleccionar</option>
                                                    <option value="CLASE">Clase</option>
                                                    <option value="EXAMEN">Examen</option>
                                                    <option value="TAREA">Tarea</option>
                                                </select>
                                            ) : (
                                                <span className="text-sm text-slate-900">
                                                    {record.tipo || 'No especificado'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {editingId === record.id_historial ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={handleSave}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleEdit(record)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    )
}
