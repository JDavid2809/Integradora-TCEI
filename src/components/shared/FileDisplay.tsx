'use client'

import { FileText, Image as ImageIcon, File, Download, Trash2, ExternalLink } from 'lucide-react'

interface FileDisplayProps {
  files: Array<{
    id?: number
    file_name: string
    file_url: string
    file_type: string
    file_size: number
  }>
  onDelete?: (fileId: number) => void
  showDelete?: boolean
  isDeleting?: boolean
  title?: string
  emptyMessage?: string
}

export default function FileDisplay({
  files,
  onDelete,
  showDelete = false,
  isDeleting = false,
  title = 'Archivos adjuntos',
  emptyMessage = 'No hay archivos adjuntos'
}: FileDisplayProps) {

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return ImageIcon
    if (fileType === 'application/pdf') return FileText
    return File
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileExtension = (fileName: string): string => {
    const parts = fileName.split('.')
    return parts.length > 1 ? parts.pop()?.toUpperCase() || '' : ''
  }

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error descargando archivo:', error)
      // Fallback: abrir en nueva pestaña
      window.open(url, '_blank')
    }
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <File className="w-10 h-10 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {title && (
        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          {title} ({files.length})
        </h4>
      )}
      
      <div className="grid gap-2">
        {files.map((file, index) => {
          const Icon = getFileIcon(file.file_type)
          const isImage = file.file_type.startsWith('image/')
          
          return (
            <div
              key={file.id || index}
              className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              {/* Preview para imágenes o ícono */}
              {isImage ? (
                <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  <img
                    src={file.file_url}
                    alt={file.file_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
              )}

              {/* Info del archivo */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.file_name}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">
                    {getFileExtension(file.file_name)}
                  </span>
                  <span>{formatFileSize(file.file_size)}</span>
                </p>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1">
                {/* Ver (abrir en nueva pestaña) */}
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Ver archivo"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                
                {/* Descargar */}
                <button
                  onClick={() => handleDownload(file.file_url, file.file_name)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Descargar"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Eliminar (solo si tiene permiso) */}
                {showDelete && onDelete && file.id && (
                  <button
                    onClick={() => onDelete(file.id!)}
                    disabled={isDeleting}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
