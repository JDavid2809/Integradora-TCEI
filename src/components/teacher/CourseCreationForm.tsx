'use client'

import React, { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Save,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Globe,
  MapPin,
  Target,
  Users,
  Clock
} from 'lucide-react'
import { 
  CourseCreationData, 
  CourseBasicInfo, 
  CourseDetails
} from '@/types/course-creation'
import { createCourse, getCourseDetails, updateCourse } from '@/actions/teacher/courseActions'

interface CourseCreationFormProps {
  teacherId: number
  editingCourseId?: number | null
  isEditing?: boolean
  onSuccess: () => void
  onCancel: () => void
}

export default function CourseCreationForm({ 
  teacherId, 
  editingCourseId = null, 
  isEditing = false, 
  onSuccess, 
  onCancel 
}: CourseCreationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Estados del formulario
  const [basicInfo, setBasicInfo] = useState<CourseBasicInfo>({
    nombre: '',
    descripcion: '',
    resumen: '',
    modalidad: 'PRESENCIAL',
    inicio: '',
    fin: ''
  })

  const [details, setDetails] = useState<CourseDetails>({
    whatYouLearn: [],
    features: [],
    requirements: [],
    targetAudience: [],
    courseContent: []
  })

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const generateId = () => Math.random().toString(36).substr(2, 9)

  // ========================================
  // CARGAR DATOS PARA EDICIÓN
  // ========================================

  useEffect(() => {
    const loadCourseData = async () => {
      if (isEditing && editingCourseId) {
        setIsLoading(true)
        try {
          const courseDetails = await getCourseDetails(editingCourseId, teacherId)
          if (courseDetails) {
            // Cargar información básica
            setBasicInfo({
              nombre: courseDetails.nombre,
              descripcion: courseDetails.descripcion || '',
              resumen: courseDetails.resumen || '',
              modalidad: courseDetails.modalidad,
              inicio: courseDetails.inicio ? new Date(courseDetails.inicio).toISOString().split('T')[0] : '',
              fin: courseDetails.fin ? new Date(courseDetails.fin).toISOString().split('T')[0] : '',
              precio: courseDetails.precio || undefined,
              nivel_ingles: courseDetails.nivel_ingles || undefined
            })

            // Cargar detalles con verificación de estructura
            setDetails({
              whatYouLearn: (courseDetails.whatYouLearnParsed || []).map((item: any) => ({
                id: item.id || generateId(),
                text: item.text || item.title || ''
              })),
              features: courseDetails.featuresParsed || [],
              requirements: (courseDetails.requirementsParsed || []).map((item: any) => ({
                id: item.id || generateId(),
                text: item.text || item.title || ''
              })),
              targetAudience: (courseDetails.targetAudienceParsed || []).map((item: any) => ({
                id: item.id || generateId(),
                text: item.text || item.title || ''
              })),
              courseContent: courseDetails.courseContentParsed || []
            })
          }
        } catch {
          setSubmitError('Error al cargar los datos del curso')
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadCourseData()
  }, [isEditing, editingCourseId, teacherId])

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  const addWhatYouLearn = () => {
    setDetails(prev => ({
      ...prev,
      whatYouLearn: [...prev.whatYouLearn, { id: generateId(), text: '' }]
    }))
  }

  const updateWhatYouLearn = (id: string, text: string) => {
    setDetails(prev => ({
      ...prev,
      whatYouLearn: prev.whatYouLearn.map(item => 
        item.id === id ? { ...item, text } : item
      )
    }))
  }

  const removeWhatYouLearn = (id: string) => {
    setDetails(prev => ({
      ...prev,
      whatYouLearn: prev.whatYouLearn.filter(item => item.id !== id)
    }))
  }

  const addRequirement = () => {
    setDetails(prev => ({
      ...prev,
      requirements: [...prev.requirements, { id: generateId(), text: '' }]
    }))
  }

  const updateRequirement = (id: string, text: string) => {
    setDetails(prev => ({
      ...prev,
      requirements: prev.requirements.map(item => 
        item.id === id ? { ...item, text } : item
      )
    }))
  }

  const removeRequirement = (id: string) => {
    setDetails(prev => ({
      ...prev,
      requirements: prev.requirements.filter(item => item.id !== id)
    }))
  }

  const addTargetAudience = () => {
    setDetails(prev => ({
      ...prev,
      targetAudience: [...prev.targetAudience, { id: generateId(), text: '' }]
    }))
  }

  const updateTargetAudience = (id: string, text: string) => {
    setDetails(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.map(item => 
        item.id === id ? { ...item, text } : item
      )
    }))
  }

  const removeTargetAudience = (id: string) => {
    setDetails(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.filter(item => item.id !== id)
    }))
  }

  // ========================================
  // FUNCIONES PARA CONTENIDO DEL CURSO
  // ========================================

  const addCourseSection = () => {
    const newSection = {
      id: Date.now().toString(),
      title: '',
      lessons: 0,
      duration: '',
      topics: []
    }
    setDetails(prev => ({
      ...prev,
      courseContent: [...prev.courseContent, newSection]
    }))
  }

  const updateCourseSection = (sectionId: string, field: string, value: string | number) => {
    setDetails(prev => ({
      ...prev,
      courseContent: prev.courseContent.map(section =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    }))
  }

  const removeCourseSection = (sectionId: string) => {
    setDetails(prev => ({
      ...prev,
      courseContent: prev.courseContent.filter(section => section.id !== sectionId)
    }))
  }

  const addTopic = (sectionId: string) => {
    const newTopic = {
      id: Date.now().toString(),
      title: '',
      duration: '',
      isPreview: false
    }
    setDetails(prev => ({
      ...prev,
      courseContent: prev.courseContent.map(section =>
        section.id === sectionId
          ? { ...section, topics: [...section.topics, newTopic] }
          : section
      )
    }))
  }

  const updateTopic = (sectionId: string, topicId: string, field: string, value: string | boolean) => {
    setDetails(prev => ({
      ...prev,
      courseContent: prev.courseContent.map(section =>
        section.id === sectionId
          ? {
              ...section,
              topics: section.topics.map(topic =>
                topic.id === topicId ? { ...topic, [field]: value } : topic
              )
            }
          : section
      )
    }))
  }

  const removeTopic = (sectionId: string, topicId: string) => {
    setDetails(prev => ({
      ...prev,
      courseContent: prev.courseContent.map(section =>
        section.id === sectionId
          ? { ...section, topics: section.topics.filter(topic => topic.id !== topicId) }
          : section
      )
    }))
  }

  // ========================================
  // VALIDACIONES
  // ========================================

  const validateStep1 = () => {
    if (!basicInfo.nombre.trim()) return false
    if (!basicInfo.descripcion.trim()) return false
    if (!basicInfo.resumen.trim()) return false
    if (!basicInfo.inicio) return false
    if (!basicInfo.fin) return false
    
    const startDate = new Date(basicInfo.inicio)
    const endDate = new Date(basicInfo.fin)
    if (startDate >= endDate) return false
    
    return true
  }

  const validateStep2 = () => {
    return details.whatYouLearn.some(item => item.text && item.text.trim()) &&
           details.requirements.some(item => item.text && item.text.trim())
  }

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    setSubmitMessage('')

    try {
      const courseData: CourseCreationData = {
        basicInfo,
        details: {
          ...details,
          // Filtrar elementos vacíos
          whatYouLearn: details.whatYouLearn.filter(item => item.text && item.text.trim()),
          requirements: details.requirements.filter(item => item.text && item.text.trim()),
          targetAudience: details.targetAudience.filter(item => item.text && item.text.trim()),
          courseContent: details.courseContent
            .filter(section => section.title && section.title.trim())
            .map(section => ({
              ...section,
              topics: section.topics.filter(topic => topic.title && topic.title.trim())
            }))
        }
      }

      let result
      if (isEditing && editingCourseId) {
        result = await updateCourse(editingCourseId, courseData, teacherId)
        setSubmitMessage(result.success ? '¡Curso actualizado exitosamente!' : result.message)
      } else {
        result = await createCourse(courseData, teacherId)
        setSubmitMessage(result.success ? '¡Curso creado exitosamente!' : result.message)
      }

      if (result.success) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setSubmitError(result.message)
      }
    } catch {
      setSubmitError(`Error inesperado al ${isEditing ? 'actualizar' : 'crear'} el curso`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========================================
  // RENDER
  // ========================================

  // Mostrar loading cuando estamos cargando datos del curso para editar
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00246a] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos del curso...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-[#00246a] text-white p-6 rounded-t-lg">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Editar Curso' : 'Crear Nuevo Curso'}
            </h1>
            <p className="opacity-90">Paso {currentStep} de 3</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-[#00246a]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-[#00246a] text-white' : 'bg-gray-300'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Información Básica</span>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400" />
          
          <div className={`flex items-center ${currentStep >= 2 ? 'text-[#00246a]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-[#00246a] text-white' : 'bg-gray-300'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Detalles del Curso</span>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400" />
          
          <div className={`flex items-center ${currentStep >= 3 ? 'text-[#00246a]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-[#00246a] text-white' : 'bg-gray-300'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Revisión</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Step 1: Información Básica */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#00246a] mb-4">Información Básica del Curso</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Curso *
              </label>
              <input
                type="text"
                value={basicInfo.nombre}
                onChange={(e) => setBasicInfo(prev => ({ ...prev, nombre: e.target.value }))}
                className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                placeholder="Ej: English Conversation Mastery"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={basicInfo.descripcion}
                onChange={(e) => setBasicInfo(prev => ({ ...prev, descripcion: e.target.value }))}
                rows={4}
                className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                placeholder="Describe brevemente qué aprenderán los estudiantes en este curso..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resumen *
              </label>
              <textarea
                value={basicInfo.resumen}
                onChange={(e) => setBasicInfo(prev => ({ ...prev, resumen: e.target.value }))}
                rows={3}
                className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                placeholder="Un resumen conciso que aparecerá en la vista de cursos..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modalidad *
                </label>
                <select
                  value={basicInfo.modalidad}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, modalidad: e.target.value as 'PRESENCIAL' | 'ONLINE' }))}
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                >
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Inglés
                </label>
                <select
                  value={basicInfo.nivel_ingles || ''}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, nivel_ingles: e.target.value || undefined }))}
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                >
                  <option value="">Seleccionar nivel</option>
                  <option value="A1">A1 - Principiante</option>
                  <option value="A2">A2 - Básico</option>
                  <option value="B1">B1 - Intermedio</option>
                  <option value="B2">B2 - Intermedio Alto</option>
                  <option value="C1">C1 - Avanzado</option>
                  <option value="C2">C2 - Experto</option>
                  <option value="TODOS">Todos los niveles</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  value={basicInfo.inicio}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, inicio: e.target.value }))}
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin *
                </label>
                <input
                  type="date"
                  value={basicInfo.fin}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, fin: e.target.value }))}
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio del Curso ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={basicInfo.precio || ''}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, precio: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Dejar vacío para curso gratuito</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Detalles del Curso */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-[#00246a] mb-4">Detalles del Curso</h2>
            
            {/* Lo que aprenderás */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#00246a]" />
                <h3 className="text-gray-700 text-lg font-semibold">Lo que aprenderás *</h3>
              </div>
              <div className="space-y-3">
                {details.whatYouLearn.map((item, index) => (
                  <div key={item.id} className="flex gap-3">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateWhatYouLearn(item.id, e.target.value)}
                      className="text-gray-700 flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                      placeholder={`Objetivo de aprendizaje ${index + 1}`}
                    />
                    <button
                      onClick={() => removeWhatYouLearn(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addWhatYouLearn}
                  className="flex items-center gap-2 px-4 py-2 text-[#00246a] border border-[#00246a] rounded-lg hover:bg-[#00246a] hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar objetivo
                </button>
              </div>
            </div>

            {/* Requisitos */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-[#00246a]" />
                <h3 className="text-gray-700 text-lg font-semibold">Requisitos *</h3>
              </div>
              <div className="space-y-3">
                {details.requirements.map((item, index) => (
                  <div key={item.id} className="flex gap-3">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateRequirement(item.id, e.target.value)}
                      className="text-gray-700 flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                      placeholder={`Requisito ${index + 1}`}
                    />
                    <button
                      onClick={() => removeRequirement(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addRequirement}
                  className="flex items-center gap-2 px-4 py-2 text-[#00246a] border border-[#00246a] rounded-lg hover:bg-[#00246a] hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar requisito
                </button>
              </div>
            </div>

            {/* Para quién es este curso */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#00246a]" />
                <h3 className="text-gray-700 text-lg font-semibold">¿Para quién es este curso?</h3>
              </div>
              <div className="space-y-3">
                {details.targetAudience.map((item, index) => (
                  <div key={item.id} className="flex gap-3">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateTargetAudience(item.id, e.target.value)}
                      className="text-gray-700 flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                      placeholder={`Audiencia objetivo ${index + 1}`}
                    />
                    <button
                      onClick={() => removeTargetAudience(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addTargetAudience}
                  className="flex items-center gap-2 px-4 py-2 text-[#00246a] border border-[#00246a] rounded-lg hover:bg-[#00246a] hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar audiencia
                </button>
              </div>
            </div>

            {/* Contenido del curso */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-[#00246a]" />
                <h3 className="text-gray-700 text-lg font-semibold">Contenido del curso</h3>
                <span className="text-sm text-gray-500">(Opcional)</span>
              </div>
              <div className="space-y-6">
                {details.courseContent.map((section, sectionIndex) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="text-gray-700 flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-800">
                        Módulo {sectionIndex + 1}
                      </h4>
                      <button
                        onClick={() => removeCourseSection(section.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateCourseSection(section.id, 'title', e.target.value)}
                        className="text-gray-700 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                        placeholder="Título del módulo"
                      />
                      <input
                        type="number"
                        value={section.lessons}
                        onChange={(e) => updateCourseSection(section.id, 'lessons', parseInt(e.target.value) || 0)}
                        className="text-gray-700 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                        placeholder="# de lecciones"
                        min="0"
                      />
                      <input
                        type="text"
                        value={section.duration}
                        onChange={(e) => updateCourseSection(section.id, 'duration', e.target.value)}
                        className="text-gray-700 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent"
                        placeholder="Duración (ej: 2 semanas)"
                      />
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Temas:</h5>
                      {section.topics.map((topic) => (
                        <div key={topic.id} className="flex gap-2">
                          <input
                            type="text"
                            value={topic.title}
                            onChange={(e) => updateTopic(section.id, topic.id, 'title', e.target.value)}
                            className="text-gray-700 flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent text-sm"
                            placeholder="Título del tema"
                          />
                          <input
                            type="text"
                            value={topic.duration}
                            onChange={(e) => updateTopic(section.id, topic.id, 'duration', e.target.value)}
                            className="text-gray-700 w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00246a] focus:border-transparent text-sm"
                            placeholder="15 min"
                          />
                          <button
                            onClick={() => removeTopic(section.id, topic.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addTopic(section.id)}
                        className="flex items-center gap-2 px-3 py-1 text-sm text-[#00246a] border border-[#00246a] rounded hover:bg-[#00246a] hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Agregar tema
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addCourseSection}
                  className="flex items-center gap-2 px-4 py-2 text-[#00246a] border border-[#00246a] rounded-lg hover:bg-[#00246a] hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar módulo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Revisión */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#00246a] mb-4">Revisión del Curso</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-gray-700 text-lg font-semibold mb-4">{basicInfo.nombre}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-700 font-medium">Modalidad:</span>
                  <div className="text-gray-700 flex items-center gap-2 mt-1">
                    {basicInfo.modalidad === 'ONLINE' ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    {basicInfo.modalidad}
                  </div>
                </div>
                <div>
                  <span className="text-gray-700 font-medium">Duración:</span>
                  <div className="text-gray-700 flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4" />
                    {basicInfo.inicio} - {basicInfo.fin}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-700">{basicInfo.descripcion}</p>
              </div>

              <div className="mt-4">
                <h4 className="text-gray-700 font-medium mb-2">Lo que aprenderás:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {details.whatYouLearn.filter(item => item.text && item.text.trim()).map(item => (
                    <li key={item.id}>{item.text}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <h4 className="text-gray-700 font-medium mb-2">Requisitos:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {details.requirements.filter(item => item.text && item.text.trim()).map(item => (
                    <li key={item.id}>{item.text}</li>
                  ))}
                </ul>
              </div>

              {/* Contenido del curso */}
              {details.courseContent.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-gray-700 font-medium mb-2">Contenido del curso:</h4>
                  <div className="space-y-3">
                    {details.courseContent.filter(section => section.title.trim()).map((section, index) => (
                      <div key={section.id} className="text-gray-700 bg-white p-3 rounded border">
                        <h5 className="text-gray-700 font-medium text-sm">
                          {index + 1}. {section.title}
                          {section.lessons > 0 && ` (${section.lessons} lecciones)`}
                          {section.duration && ` - ${section.duration}`}
                        </h5>
                        {section.topics.filter(topic => topic.title.trim()).length > 0 && (
                          <ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-xs text-gray-600">
                            {section.topics.filter(topic => topic.title.trim()).map(topic => (
                              <li key={topic.id}>
                                {topic.title} {topic.duration && `(${topic.duration})`}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            {submitMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {submitMessage}
              </div>
            )}

            {submitError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {submitError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-gray-700 bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between">
        <div>
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>

          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={currentStep === 1 ? !validateStep1() : currentStep === 2 ? !validateStep2() : false}
              className="flex items-center gap-2 px-6 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-[#00246a] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="text-gray-700 animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting ? 'Procesando...' : (isEditing ? 'Actualizar Curso' : 'Crear Curso')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}