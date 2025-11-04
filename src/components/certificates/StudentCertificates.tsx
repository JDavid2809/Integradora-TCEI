'use client'

import { useState, useEffect } from 'react'
import { getStudentCertificates } from '@/actions/certificates'
import { Award, Calendar, ExternalLink, Download } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

interface Certificate {
  id: number
  token_uuid: string
  nombre_curso: string
  fecha_emision: Date
  codigo_verificacion: string
  url_verificacion: string
  duracion_horas: number | null
  nivel_ingles: string | null
  curso: {
    nombre: string
  }
}

interface StudentCertificatesProps {
  estudianteId: number
}

export default function StudentCertificates({ estudianteId }: StudentCertificatesProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCertificates()
  }, [estudianteId])

  const loadCertificates = async () => {
    try {
      const result = await getStudentCertificates(estudianteId)
      if (result.success && result.data) {
        setCertificates(result.data as Certificate[])
      }
    } catch (error) {
      console.error('Error al cargar certificados:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-lg">
        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aún no tienes certificados
        </h3>
        <p className="text-gray-600">
          Completa tus cursos para obtener certificados oficiales
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-7 h-7 text-blue-600" />
          Mis Certificados
        </h2>
        <p className="text-sm text-gray-600">
          {certificates.length} {certificates.length === 1 ? 'certificado' : 'certificados'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Header del certificado */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
              <Award className="w-8 h-8 mb-2" />
              <h3 className="font-bold text-lg line-clamp-2">{cert.nombre_curso}</h3>
            </div>

            {/* Contenido */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Emitido el {format(new Date(cert.fecha_emision), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>

              {cert.nivel_ingles && (
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Nivel: {cert.nivel_ingles}
                </div>
              )}

              {cert.duracion_horas && (
                <p className="text-sm text-gray-600">
                  Duración: {cert.duracion_horas} horas
                </p>
              )}

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Código de verificación</p>
                <p className="font-mono font-bold text-gray-900">{cert.codigo_verificacion}</p>
              </div>
            </div>

            {/* Acciones */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-2">
              <Link
                href={`/certificate/${cert.token_uuid}`}
                target="_blank"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Ver
              </Link>
              <Link
                href={`/certificate/${cert.token_uuid}`}
                target="_blank"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                title="Descargar PDF"
              >
                <Download className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
