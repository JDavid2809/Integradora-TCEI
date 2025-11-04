# Ejemplos de Integración del Sistema de Certificados

Este documento muestra cómo integrar el sistema de certificados en diferentes partes de la aplicación.

## 1. En la Página de Detalles del Curso

```tsx
import CertificateButton from '@/components/certificates/CertificateButton'

export default function CourseDetailsPage({ curso, inscripcion }) {
  return (
    <div>
      <h1>{curso.nombre}</h1>
      <p>{curso.descripcion}</p>
      
      {/* Mostrar botón de certificado si el estudiante está inscrito */}
      {inscripcion && (
        <div className="mt-8">
          <CertificateButton
            inscripcionId={inscripcion.id}
            courseId={curso.id_curso}
            courseName={curso.nombre}
          />
        </div>
      )}
    </div>
  )
}
```

## 2. En el Perfil del Estudiante

```tsx
import StudentCertificates from '@/components/certificates/StudentCertificates'

export default function StudentProfilePage({ estudiante }) {
  return (
    <div>
      <h1>Perfil de {estudiante.nombre}</h1>
      
      {/* Sección de certificados */}
      <div className="mt-8">
        <StudentCertificates estudianteId={estudiante.id_estudiante} />
      </div>
    </div>
  )
}
```

## 3. En el Panel de Admin - Gestión de Inscripciones

```tsx
import { completeCourse, updateEnrollmentStatus } from '@/actions/enrollment'

export default function AdminEnrollmentManager() {
  const handleCompleteCourse = async (inscripcionId: number) => {
    const result = await completeCourse(inscripcionId)
    
    if (result.success) {
      if (result.certificate) {
        alert(`✅ Curso completado y certificado generado!\nURL: ${result.certificate.url}`)
      } else {
        alert('✅ Curso completado (este curso no genera certificado)')
      }
    } else {
      alert(`❌ Error: ${result.error}`)
    }
  }

  return (
    <div>
      <button onClick={() => handleCompleteCourse(123)}>
        Marcar Curso como Completado
      </button>
    </div>
  )
}
```

## 4. En el Panel de Profesor - Lista de Estudiantes

```tsx
import { completeCourse } from '@/actions/enrollment'

export default function TeacherStudentsList() {
  const handleMarkAsCompleted = async (inscripcionId: number) => {
    if (!confirm('¿Marcar este curso como completado?')) return
    
    const result = await completeCourse(inscripcionId)
    
    if (result.success) {
      alert('✅ Curso completado exitosamente')
    } else {
      alert(`❌ ${result.error}`)
    }
  }

  return (
    <div>
      {/* Lista de estudiantes con botón para completar */}
      <button onClick={() => handleMarkAsCompleted(123)}>
        Completar Curso
      </button>
    </div>
  )
}
```

## 5. API Route para Completar Curso

```tsx
// app/api/enrollments/[id]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { completeCourse } from '@/actions/enrollment'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inscripcionId = parseInt(params.id)
    const result = await completeCourse(inscripcionId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        certificate: result.certificate
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
```

## 6. Página de Verificación de Certificados

```tsx
'use client'

import { useState } from 'react'
import { verifyCertificateByCode } from '@/actions/certificates'
import { Shield, CheckCircle, XCircle } from 'lucide-react'

export default function VerifyCertificatePage() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!code.trim()) return
    
    setLoading(true)
    const verification = await verifyCertificateByCode(code.trim().toUpperCase())
    setResult(verification)
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="text-center mb-8">
        <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h1 className="text-3xl font-bold">Verificar Certificado</h1>
        <p className="text-gray-600 mt-2">
          Ingresa el código de verificación de 8 caracteres
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ej: AB12CD34"
          maxLength={8}
          className="flex-1 px-4 py-3 border rounded-lg uppercase"
        />
        <button
          onClick={handleVerify}
          disabled={loading || code.length !== 8}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Verificar'}
        </button>
      </div>

      {result && (
        <div className={`p-6 rounded-lg ${
          result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        } border-2`}>
          {result.success && result.data ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-green-800">
                  ✅ Certificado Válido
                </h2>
              </div>
              <div className="space-y-2 text-gray-700">
                <p><strong>Estudiante:</strong> {result.data.nombre_estudiante}</p>
                <p><strong>Curso:</strong> {result.data.nombre_curso}</p>
                <p><strong>Instructor:</strong> {result.data.nombre_instructor}</p>
                <p><strong>Fecha de Emisión:</strong> {
                  new Date(result.data.fecha_emision).toLocaleDateString('es')
                }</p>
                <a
                  href={`/certificate/${result.data.token_uuid}`}
                  target="_blank"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Ver Certificado Completo
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold text-red-800">
                  ❌ Certificado No Válido
                </h2>
              </div>
              <p className="text-red-700 mt-2">{result.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
```

## 7. Dashboard de Admin - Estadísticas de Certificados

```tsx
import { prisma } from '@/lib/prisma'

export default async function AdminCertificatesPage() {
  // Obtener estadísticas
  const stats = await prisma.certificado.groupBy({
    by: ['es_valido'],
    _count: true
  })

  const totalCertificates = await prisma.certificado.count()
  const thisMonth = await prisma.certificado.count({
    where: {
      fecha_emision: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    }
  })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de Certificados</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Total</h3>
          <p className="text-4xl font-bold text-blue-600">{totalCertificates}</p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Este Mes</h3>
          <p className="text-4xl font-bold text-green-600">{thisMonth}</p>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800">Válidos</h3>
          <p className="text-4xl font-bold text-purple-600">
            {stats.find(s => s.es_valido)?._count || 0}
          </p>
        </div>
      </div>
    </div>
  )
}
```

## 8. Compartir Certificado en Redes Sociales

```tsx
'use client'

import { Share2, Linkedin, Twitter, Facebook } from 'lucide-react'

export function ShareCertificateButtons({ certificate }) {
  const shareUrl = `${window.location.origin}/certificate/${certificate.token_uuid}`
  const shareText = `¡He completado el curso "${certificate.nombre_curso}"!`

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=600')
  }

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=600')
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=600')
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={shareToLinkedIn}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <Linkedin className="w-5 h-5" />
        LinkedIn
      </button>
      
      <button
        onClick={shareToTwitter}
        className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
      >
        <Twitter className="w-5 h-5" />
        Twitter
      </button>
      
      <button
        onClick={shareToFacebook}
        className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
      >
        <Facebook className="w-5 h-5" />
        Facebook
      </button>
    </div>
  )
}
```

---

## Notas Importantes

- **Validación**: Siempre valida que el usuario tenga permisos antes de llamar funciones de servidor
- **Loading States**: Usa estados de carga para mejorar la UX
- **Error Handling**: Maneja errores apropiadamente y muestra mensajes claros al usuario
- **Confirmaciones**: Pide confirmación antes de acciones importantes como completar cursos
- **Tipos**: Usa TypeScript apropiadamente para type safety
