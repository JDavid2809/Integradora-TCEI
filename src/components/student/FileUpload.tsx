'use client'

import { useState, useRef, DragEvent } from 'react'
import { Upload, X, FileText, File, Image as ImageIcon, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
  disabled?: boolean
}

interface FileWithPreview extends File {
  preview?: string
}

export default function FileUpload({
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  disabled = false
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    if (file.size > maxSizeBytes) {
      return `El archivo "${file.name}" excede el tamaño máximo de ${maxSizeMB}MB`
    }

    // Validar tipo
    const fileType = file.type
    const fileName = file.name.toLowerCase()
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileName.endsWith(type)
      }
      if (type.includes('*')) {
        const category = type.split('/')[0]
        return fileType.startsWith(category)
      }
      return fileType === type
    })

    if (!isValidType) {
      return `El tipo de archivo "${file.name}" no es permitido`
    }

    return null
  }

  const processFiles = (fileList: FileList) => {
    setError('')
    const newFiles: FileWithPreview[] = []

    // Verificar cantidad
    if (files.length + fileList.length > maxFiles) {
      setError(`Solo puedes subir hasta ${maxFiles} archivos`)
      return
    }

    // Procesar cada archivo
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const validationError = validateFile(file)

      if (validationError) {
        setError(validationError)
        return
      }

      // Crear preview para imágenes
      const fileWithPreview = file as FileWithPreview
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file)
      }

      newFiles.push(fileWithPreview)
    }

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
  }

  const removeFile = (index: number) => {
    const file = files[index]
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }

    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
    setError('')
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return ImageIcon
    if (file.type === 'application/pdf') return FileText
    return File
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-blue-400 hover:bg-blue-50/50'}
          ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 bg-gray-50'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isDragging ? 'bg-blue-500 scale-110' : 'bg-blue-100'
          }`}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-blue-600'}`} />
          </div>

          <div>
            <p className="text-base font-semibold text-gray-700 mb-1">
              {isDragging ? '¡Suelta los archivos aquí!' : 'Arrastra archivos aquí'}
            </p>
            <p className="text-sm text-gray-500 mb-2">
              o haz <span className="text-blue-600 font-medium">click para buscar</span>
            </p>
            <p className="text-xs text-gray-400">
              Máximo {maxFiles} archivos • Hasta {maxSizeMB}MB cada uno
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Formatos: PDF, DOC, DOCX, TXT, Imágenes
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700 font-medium">{error}</div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              Archivos seleccionados ({files.length}/{maxFiles})
            </p>
            {files.length > 0 && (
              <button
                onClick={() => {
                  files.forEach(f => f.preview && URL.revokeObjectURL(f.preview))
                  setFiles([])
                  onFilesChange([])
                }}
                disabled={disabled}
                className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
              >
                Eliminar todos
              </button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((file, index) => {
              const Icon = getFileIcon(file)
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  {/* Preview or Icon */}
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    disabled={disabled}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
