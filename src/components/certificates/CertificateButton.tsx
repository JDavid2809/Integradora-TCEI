'use client'

import { useState, useEffect } from 'react'
import { Award, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import { canGetCertificate } from '@/actions/enrollment'
import { generateCertificate } from '@/actions/certificates'
import Link from 'next/link'

interface CertificateButtonProps {
  inscripcionId: number
  courseId: number
  courseName: string
}

export default function CertificateButton({ inscripcionId, courseId, courseName }: CertificateButtonProps) {
  const [status, setStatus] = useState<{
    canGet: boolean
    reason: string
    hasExisting: boolean
    certificateUrl?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    checkCertificateStatus()
  }, [inscripcionId])

  const checkCertificateStatus = async () => {
    try {
      const result = await canGetCertificate(inscripcionId)
      if (result.success) {
        setStatus({
          canGet: result.canGet,
          reason: result.reason,
          hasExisting: result.hasExisting || false
        })
      }
    } catch (error) {
      console.error('Error al verificar certificado:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCertificate = async () => {
    setGenerating(true)
    try {
      const result = await generateCertificate({ inscripcionId })
      if (result.success && result.data) {
        setStatus({
          canGet: false,
          reason: 'Certificado generado',
          hasExisting: true,
          certificateUrl: result.data.url
        })
      }
    } catch (error) {
      console.error('Error al generar certificado:', error)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Verificando elegibilidad...</span>
      </div>
    )
  }

  if (!status) {
    return null
  }

  // Ya tiene certificado
  if (status.hasExisting && status.certificateUrl) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
              <Award className="w-5 h-5" />
              ¡Certificado Disponible!
            </h3>
            <p className="text-green-700 mb-4">
              Has completado exitosamente el curso <strong>{courseName}</strong>
            </p>
            <Link
              href={status.certificateUrl}
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
            >
              <Award className="w-5 h-5" />
              Ver Mi Certificado
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Puede obtener certificado
  if (status.canGet) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 mb-2">
              ¡Felicidades! Obtén tu Certificado
            </h3>
            <p className="text-blue-700 mb-4">
              Has completado todos los requisitos del curso. Genera tu certificado oficial ahora.
            </p>
            <button
              onClick={handleGenerateCertificate}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Award className="w-5 h-5" />
                  Generar Certificado
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // No puede obtener certificado aún
  return (
    <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-gray-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Award className="w-5 h-5 text-gray-400" />
            Certificado
          </h3>
          <p className="text-gray-700 mb-2">{status.reason}</p>
          <p className="text-sm text-gray-500">
            Completa el curso para obtener tu certificado oficial.
          </p>
        </div>
      </div>
    </div>
  )
}
