'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap,
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Upload,
  Paperclip
} from 'lucide-react'

interface TeacherRequestForm {
  nombre: string
  apellido: string
  email: string
  telefono?: string
  edad?: number
  curp?: string
  rfc?: string
  direccion?: string
  nivel_estudios?: string
  observaciones?: string
  documentos_adjuntos?: { name: string; url: string; type: string }[]
}

interface RequestStatus {
  id_solicitud?: number
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
  fecha_solicitud: string
  comentario_revision?: string
}

export default function TeacherRequestPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(null)
  const [checkingEmail, setCheckingEmail] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; type: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<TeacherRequestForm>()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const newFiles: { name: string; url: string; type: string }[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'tareas_estudiantes')

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) throw new Error('Error uploading file')

        const data = await response.json()
        newFiles.push({
          name: file.name,
          url: data.secure_url,
          type: file.type
        })
      }

      setUploadedFiles(prev => [...prev, ...newFiles])
    } catch (error) {
      console.error('Error uploading files:', error)
      setError('Error al subir archivos. Intenta de nuevo.')
    } finally {
      setIsUploading(false)
      // Limpiar input
      e.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: TeacherRequestForm) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/teacher-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          documentos_adjuntos: uploadedFiles
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar la solicitud')
      }

      setIsSubmitted(true)
      reset()
      setUploadedFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const checkRequestStatus = async (email: string) => {
    if (!email.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/teacher-request?email=${encodeURIComponent(email)}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al consultar solicitud')
      }

      setRequestStatus(result.solicitud)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Solicitud Enviada!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu solicitud para unirte como profesor ha sido enviada exitosamente. 
              Nuestro equipo la revisará y te contactaremos pronto.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full bg-[#00246a] text-white py-3 rounded-lg hover:bg-[#003875] transition-colors"
            >
              Enviar otra solicitud
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#00246a] mb-4">
            Únete a Nuestro Equipo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            ¿Te apasiona enseñar inglés? Envía tu solicitud para ser parte de nuestro equipo de profesores.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de solicitud */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Solicitud de Profesor
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Información Personal */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información Personal
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        {...register('nombre', { 
                          required: 'El nombre es requerido',
                          minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                        placeholder="Tu nombre"
                      />
                      {errors.nombre && (
                        <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        {...register('apellido', { 
                          required: 'El apellido es requerido',
                          minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                        placeholder="Tu apellido"
                      />
                      {errors.apellido && (
                        <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email *
                      </label>
                      <input
                        type="email"
                        {...register('email', { 
                          required: 'El email es requerido',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido'
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                        placeholder="tu@email.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        {...register('telefono')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                        placeholder="555-123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Edad
                      </label>
                      <input
                        type="number"
                        {...register('edad', { 
                          min: { value: 18, message: 'Debe ser mayor de 18 años' },
                          max: { value: 80, message: 'Edad máxima 80 años' }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                        placeholder="25"
                      />
                      {errors.edad && (
                        <p className="text-red-500 text-sm mt-1">{errors.edad.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CURP
                      </label>
                      <input
                        type="text"
                        {...register('curp')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                        placeholder="CURP (opcional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RFC
                      </label>
                      <input
                        type="text"
                        {...register('rfc')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                        placeholder="RFC (opcional)"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Dirección
                      </label>
                      <input
                        type="text"
                        {...register('direccion')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                        placeholder="Tu dirección completa"
                      />
                    </div>
                  </div>
                </div>

                {/* Información Académica */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Información Académica
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel de Estudios
                    </label>
                    <select
                      {...register('nivel_estudios')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                    >
                      <option value="">Selecciona tu nivel de estudios</option>
                      <option value="Licenciatura">Licenciatura</option>
                      <option value="Ingeniería">Ingeniería</option>
                      <option value="Maestría">Maestría</option>
                      <option value="Doctorado">Doctorado</option>
                      <option value="Certificación en Inglés">Certificación en Inglés</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                {/* Información Adicional */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Información Adicional
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuéntanos sobre ti
                    </label>
                    <textarea
                      {...register('observaciones')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                      placeholder="Experiencia docente, certificaciones, especialidades, etc."
                    />
                  </div>

                  {/* Subida de Documentos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Documentos de Soporte (CV, Certificaciones, etc.)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#00246a] transition-colors">
                      <div className="space-y-1 text-center">
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
                            <p className="mt-2 text-sm text-gray-500">Subiendo archivos...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-[#00246a] hover:text-[#003875] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#00246a]"
                              >
                                <span>Sube un archivo</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  multiple
                                  onChange={handleFileSelect}
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                />
                              </label>
                              <p className="pl-1">o arrastra y suelta</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PDF, DOC, DOCX, PNG, JPG hasta 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Lista de archivos subidos */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Archivos adjuntos:</h4>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <span className="text-sm text-gray-600 truncate">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#00246a] text-white py-4 rounded-lg hover:bg-[#003875] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar Solicitud
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Sidebar con información y verificador de estado */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Información sobre el proceso */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Proceso de Solicitud
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#00246a] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Envía tu solicitud</h4>
                    <p className="text-sm text-gray-600">Completa el formulario con tu información</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#00246a] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Revisión</h4>
                    <p className="text-sm text-gray-600">Nuestro equipo evaluará tu perfil</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#00246a] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Respuesta</h4>
                    <p className="text-sm text-gray-600">Te contactaremos con la decisión</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verificador de estado */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Verificar Estado
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Ya enviaste una solicitud? Verifica su estado aquí:
              </p>
              
              <div className="space-y-3">
                <input
                  type="email"
                  value={checkingEmail}
                  onChange={(e) => setCheckingEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  placeholder="tu@email.com"
                />
                <button
                  onClick={() => checkRequestStatus(checkingEmail)}
                  disabled={isLoading || !checkingEmail.trim()}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Consultando...' : 'Verificar Estado'}
                </button>
              </div>

              {requestStatus && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Estado de tu solicitud:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-700">Estado:</span>
                      <span className={`text-sm font-semibold px-2 py-1 rounded ${
                        requestStatus.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                        requestStatus.estado === 'APROBADA' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {requestStatus.estado === 'PENDIENTE' ? 'En revisión' :
                         requestStatus.estado === 'APROBADA' ? 'Aprobada' : 'Rechazada'}
                      </span>
                    </div>
                    <div className="text-sm text-blue-700">
                      Fecha: {new Date(requestStatus.fecha_solicitud).toLocaleDateString()}
                    </div>
                    {requestStatus.comentario_revision && (
                      <div className="text-sm text-blue-700">
                        <strong>Comentario:</strong> {requestStatus.comentario_revision}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}