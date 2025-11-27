import { getCertificateByToken } from '@/actions/certificates'
import { notFound } from 'next/navigation'
import CertificateView from '@/components/certificates/CertificateView'
import { Metadata } from 'next'

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await params
  const result = await getCertificateByToken(p.token)
  
  if (!result.success || !result.data) {
    return {
      title: 'Certificado no encontrado',
    }
  }

  const cert = result.data

  return {
    title: `Certificado de ${cert.nombre_estudiante} - ${cert.nombre_curso}`,
    description: `Certificado de finalización del curso ${cert.nombre_curso}`,
    openGraph: {
      title: `Certificado de Finalización - ${cert.nombre_curso}`,
      description: `${cert.nombre_estudiante} ha completado exitosamente el curso`,
      type: 'website',
    },
  }
}

export default async function CertificatePage({ params }: PageProps) {
  const p = await params
  const result = await getCertificateByToken(p.token)

  if (!result.success || !result.data) {
    notFound()
  }

  return <CertificateView certificate={result.data} />
}
