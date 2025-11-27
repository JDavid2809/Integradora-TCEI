import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import cloudinary from '@/lib/cloudinary'

// Tipos permitidos
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = (formData.get('folder') as string) || 'submissions'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron archivos' },
        { status: 400 }
      )
    }

    // Validar número de archivos
    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Máximo 5 archivos permitidos' },
        { status: 400 }
      )
    }

    const uploadResults = []

    for (const file of files) {
      // Validar tipo de archivo
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Tipo de archivo no permitido: ${file.type}` },
          { status: 400 }
        )
      }

      // Validar tamaño
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Archivo demasiado grande: ${file.name} (máximo 10MB)` },
          { status: 400 }
        )
      }

      // Convertir archivo a buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Determinar tipo de recurso
      const resourceType = file.type.startsWith('image/') ? 'image' : 'raw'

      // Subir a Cloudinary
      const result = await new Promise<{
        secure_url: string
        public_id: string
        format: string
        bytes: number
      }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `tareas/${folder}`,
            resource_type: resourceType,
            // Preservar el nombre original en el public_id
            public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}`,
          },
          (error, result) => {
            if (error) reject(error)
            else if (result) resolve(result)
            else reject(new Error('No result from Cloudinary'))
          }
        ).end(buffer)
      })

      uploadResults.push({
        originalName: file.name,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format || file.name.split('.').pop(),
        size: result.bytes,
        type: file.type,
      })
    }

    return NextResponse.json({
      success: true,
      files: uploadResults,
    })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { error: 'Error al subir archivos' },
      { status: 500 }
    )
  }
}
