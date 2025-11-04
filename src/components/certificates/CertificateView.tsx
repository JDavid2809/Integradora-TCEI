'use client'

import { Award, Share2, Download, CheckCircle, Shield } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface CertificateData {
  id: number
  token_uuid: string
  nombre_estudiante: string
  nombre_curso: string
  nombre_instructor: string
  duracion_horas: number | null
  nivel_ingles: string | null
  fecha_inicio: Date
  fecha_finalizacion: Date
  fecha_emision: Date
  codigo_verificacion: string
  url_verificacion: string
  es_valido: boolean
  veces_visto: number
}

interface CertificateViewProps {
  certificate: CertificateData
}

export default function CertificateView({ certificate }: CertificateViewProps) {
  const [copied, setCopied] = useState(false)

  // Ocultar elementos externos al imprimir
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'certificate-print-style'
    style.textContent = `
      @media print {
        @page {
          size: A4;
          margin: 0;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        body * {
          visibility: hidden;
        }
        #certificate-container,
        #certificate-container * {
          visibility: visible;
        }
        #certificate-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100vh;
          page-break-after: avoid;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        #certificate-container > div {
          max-height: 100vh;
          height: auto !important;
          border: none !important;
          box-shadow: none !important;
        }
        header, footer, nav, aside, .chatbot, #chatbot, 
        [class*="chat"], [class*="Chat"], [id*="chat"], [id*="Chat"],
        button, [role="button"] {
          display: none !important;
          visibility: hidden !important;
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      const styleElement = document.getElementById('certificate-print-style')
      if (styleElement) {
        styleElement.remove()
      }
    }
  }, [])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificado - ${certificate.nombre_curso}`,
          text: `¡Mira mi certificado de ${certificate.nombre_curso}!`,
          url: certificate.url_verificacion
        })
      } catch (error) {
        console.log('Error al compartir:', error)
      }
    } else {
      navigator.clipboard.writeText(certificate.url_verificacion)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 print:p-0 print:bg-white">
      {/* Botones de acción - Solo visible en pantalla */}
      <div className="max-w-5xl mx-auto flex justify-end gap-4 mb-6 print:hidden">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 border border-blue-300 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Share2 className="w-4 h-4" />
          {copied ? '¡Copiado!' : 'Compartir'}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <Download className="w-4 h-4" />
          Descargar PDF
        </button>
      </div>

      {/* Certificado Principal - Contenedor con ID para impresión */}
      <div id="certificate-container" className="max-w-5xl mx-auto print:max-w-none print:h-screen">
        <div className="bg-white shadow-2xl border-8 border-gray-800 relative print:shadow-none print:border-0 h-full print:min-h-screen"
          style={{ minHeight: '1000px' }}>
          
          {/* Header: Logos alineados (izquierda y derecha) */}
          <div className="relative p-8 pb-6 print:p-12 print:pb-8">
            <div className="flex justify-between items-center">
              {/* Logo izquierda */}
              <Image
                src="/logos/logoCertificado.png"
                alt='Logo certificado'
                width={200}
                height={200}
                className='rounded-lg bg-white print:w-[220px] print:h-[220px]'
              />
              
              {/* Logo derecha - alineado a la misma altura */}
              <Image
                src="/logos/medallaCertificado.png"
                alt="Logo TCEI"
                width={200}
                height={200}
                className="rounded-lg print:w-[220px] print:h-[220px]"
              />
            </div>
          </div>

          {/* Contenido Central - Optimizado para pantalla e impresión */}
          <div className="px-16 py-6 print:px-20 print:py-4 text-center space-y-5 print:space-y-4">
            {/* Título del certificado */}
            <div className="mb-6 print:mb-4">
              <h1 className="text-4xl print:text-5xl font-bold text-gray-800 mb-2 print:mb-3">Certificado de estudios</h1>
              <div className="w-32 print:w-48 h-1 print:h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
            </div>

            {/* Texto principal */}
            <div className="space-y-4 print:space-y-3 mb-8 print:mb-6">
              <p className="text-lg print:text-xl text-gray-700">para acreditar que</p>
              
              <h2 className="text-5xl print:text-6xl font-bold text-gray-900 my-5 print:my-5 uppercase">
                {certificate.nombre_estudiante}
              </h2>
              
              <p className="text-lg print:text-xl text-gray-700">completó y aprobó los estudios de</p>
              
              <h3 className="text-3xl print:text-4xl font-bold text-gray-900 my-4 print:my-4">
                {certificate.nombre_curso}
              </h3>
            </div>

            {/* Información del curso en grid */}
            <div className="grid grid-cols-2 gap-6 print:gap-12 max-w-2xl print:max-w-3xl mx-auto my-8 print:my-6 text-center">
              <div>
                <p className="text-sm print:text-base text-gray-600">Fecha de finalización</p>
                <p className="text-lg print:text-xl font-semibold text-gray-900">
                  {format(new Date(certificate.fecha_finalizacion), 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
                </p>
              </div>
              
              <div>
                <p className="text-sm print:text-base text-gray-600">Periodo</p>
                <p className="text-lg print:text-xl font-semibold text-gray-900">
                  {format(new Date(certificate.fecha_inicio), 'MMM yyyy', { locale: es })} - {format(new Date(certificate.fecha_finalizacion), 'MMM yyyy', { locale: es })}
                </p>
              </div>
            </div>

            {/* Firma del instructor */}
            <div className="mt-10 print:mt-8 mb-16 print:mb-6">
              <div className="inline-block">
                <div className="w-64 print:w-80 border-t-2 print:border-t-3 border-gray-800 pt-2 print:pt-3">
                  <p className="font-bold text-gray-900 print:text-lg">{certificate.nombre_instructor}</p>
                  <p className="text-sm print:text-base text-gray-600">Instructor del curso</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Certificado Verificado - Con mayor separación visual */}
          <div className="absolute bottom-8 print:relative print:bottom-0 print:mt-4 left-8 right-8 print:left-0 print:right-0 print:px-16">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 print:p-6 border-2 border-green-200 shadow-md print:shadow-none print:mx-auto print:max-w-4xl">
              <div className="flex items-center gap-3 print:gap-4">
                {/* Icono de verificación */}
                <div className="flex-shrink-0 w-12 h-12 print:w-14 print:h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 print:w-8 print:h-8 text-green-600" />
                </div>
                
                {/* Información de verificación */}
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900 print:text-lg flex items-center gap-2 mb-1 print:mb-2">
                    <Shield className="w-4 h-4 print:w-5 print:h-5 text-blue-600" />
                    Certificado Verificado
                  </h4>
                  <div className="grid grid-cols-2 gap-4 print:gap-6 text-xs print:text-sm">
                    <div>
                      <p className="text-gray-600">Código de verificación:</p>
                      <p className="font-mono font-bold text-gray-900 text-sm print:text-base">
                        {certificate.codigo_verificacion}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">ID del certificado:</p>
                      <p className="font-mono text-gray-900 print:text-sm">
                        UC-{certificate.token_uuid.slice(0, 20)}...
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 print:mt-3 text-xs print:text-sm text-gray-500">
                    <p>Emisión: {format(new Date(certificate.fecha_emision), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                    <p className="mt-0.5 print:mt-1">
                      Verificar en: <span className="text-blue-600 break-all">{certificate.url_verificacion}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Información adicional - Solo visible en pantalla */}
      <div className="mt-8 text-center text-gray-600 text-sm print:hidden">
        <p className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" />
          Este certificado es verificable y válido
        </p>
        <p className="mt-2">
          Visto {certificate.veces_visto} {certificate.veces_visto === 1 ? 'vez' : 'veces'}
        </p>
      </div>
    </div>
  )
}
