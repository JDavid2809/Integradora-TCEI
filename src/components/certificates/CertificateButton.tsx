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
  refreshKey?: number
}

interface Progress {
  total: number
  submitted: number
  graded: number
  passed: number
  percentage: number
}

export default function CertificateButton({ inscripcionId, courseId, courseName, refreshKey }: CertificateButtonProps) {
  const [status, setStatus] = useState<{
    canGet: boolean
    reason: string
    hasExisting: boolean
    certificateUrl?: string
    progress?: Progress
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    checkCertificateStatus()
  }, [inscripcionId, refreshKey])

  const checkCertificateStatus = async () => {
    setLoading(true)
    try {
      const result = await canGetCertificate(inscripcionId)
      if (result.success) {
        setStatus({
          canGet: result.canGet,
          reason: result.reason,
          hasExisting: result.hasExisting || false,
          certificateUrl: result.certificateUrl,
          progress: result.progress
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
      console.log('Resultado generación:', result)
      
      if (result.success && result.data) {
        setStatus({
          canGet: false,
          reason: 'Certificado generado',
          hasExisting: true,
          certificateUrl: result.data.url
        })
      } else if (result.error) {
        // Mostrar error al usuario
        alert(`Error al generar certificado: ${result.error}`)
      }
    } catch (error) {
      console.error('Error al generar certificado:', error)
      alert('Error inesperado al generar el certificado')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600 text-sm">Verificando...</span>
      </div>
    )
  }

  if (!status) {
    return null
  }

  // Ya tiene certificado
  if (status.hasExisting && status.certificateUrl) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-green-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4" />
              ¡Certificado Disponible!
            </h3>
            <p className="text-green-700 text-xs">Completaste el curso exitosamente</p>
          </div>
          <Link
            href={status.certificateUrl}
            target="_blank"
            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-xs flex-shrink-0"
          >
            <Award className="w-4 h-4" />
            Ver
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    )
  }

  // Puede obtener certificado
  if (status.canGet) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-blue-900 text-sm">
              🎉 ¡Obtén tu Certificado!
            </h3>
            <p className="text-blue-700 text-xs">Aprobaste todas las actividades</p>
          </div>
          <button
            onClick={handleGenerateCertificate}
            disabled={generating}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs disabled:opacity-50 flex-shrink-0"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                Generar
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // No puede obtener certificado - Solo barra de progreso
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-gray-400" />
            Certificado
          </h3>
          <p className="text-gray-600 text-xs">{status.reason}</p>
        </div>
      </div>
      
      {/* Solo barra de progreso */}
      {status.progress && status.progress.total > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Tu progreso</span>
            <span className="text-sm font-bold text-gray-700">{status.progress.percentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                status.progress.percentage >= 100 
                  ? 'bg-green-500' 
                  : status.progress.percentage >= 50 
                    ? 'bg-yellow-500'
                    : 'bg-orange-500'
              }`}
              style={{ width: `${status.progress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            Completa y aprueba todas las actividades para obtener tu certificado.
          </p>
        </div>
      )}
    </div>
  )
}
