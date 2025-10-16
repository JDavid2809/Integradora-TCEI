'use client'

import { BookOpen, User, Calendar, Award, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { StudentCourseDetail } from '@/types/student-activity'
import { useState } from 'react'

interface StudentCourseDetailProps {
  course: StudentCourseDetail
}

export default function StudentCourseDetailComponent({ course }: StudentCourseDetailProps) {
  const [showContent, setShowContent] = useState(false)

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.nombre}</h1>
            {course.resumen && (
              <p className="text-blue-100 text-sm md:text-base">{course.resumen}</p>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b-2 border-gray-200">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-xs text-gray-500">Instructor</div>
            <div className="font-semibold text-gray-900">
              {course.instructor.nombre} {course.instructor.apellido}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-purple-600" />
          <div>
            <div className="text-xs text-gray-500">Nivel</div>
            <div className="font-semibold text-gray-900">{course.nivel || 'N/A'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-green-600" />
          <div>
            <div className="text-xs text-gray-500">Modalidad</div>
            <div className="font-semibold text-gray-900">{course.modalidad}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-orange-600" />
          <div>
            <div className="text-xs text-gray-500">Duración</div>
            <div className="font-semibold text-gray-900 text-sm">
              {course.inicio && course.fin 
                ? `${new Date(course.inicio).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - ${new Date(course.fin).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`
                : 'Flexible'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {course.descripcion && (
        <div className="p-6 border-b-2 border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
            Descripción del Curso
          </h3>
          <p className="text-gray-700 leading-relaxed">{course.descripcion}</p>
        </div>
      )}

      {/* What You Learn */}
      {course.whatYouLearn && course.whatYouLearn.length > 0 && (
        <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            ¿Qué aprenderás?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {course.whatYouLearn.map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-blue-200">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Content - Collapsible */}
      {course.courseContent && course.courseContent.length > 0 && (
        <div className="border-b-2 border-gray-200">
          <button
            onClick={() => setShowContent(!showContent)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Contenido del Curso ({course.courseContent.length} módulos)
            </h3>
            {showContent ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
          
          {showContent && (
            <div className="px-6 pb-6 space-y-3">
              {course.courseContent.map((section, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      Módulo {index + 1}: {section.title}
                    </h4>
                    {section.duration && (
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-300">
                        {section.duration}
                      </span>
                    )}
                  </div>
                  {section.topics && section.topics.length > 0 && (
                    <ul className="space-y-1 mt-2">
                      {section.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span className="flex-1">{topic.title}</span>
                          {topic.duration && (
                            <span className="text-xs text-gray-500">({topic.duration})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Requirements */}
      {course.requirements && course.requirements.length > 0 && (
        <div className="p-6 bg-yellow-50">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-yellow-600 rounded-full"></span>
            Requisitos
          </h3>
          <ul className="space-y-2">
            {course.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-2 h-2 bg-yellow-600 rounded-full mt-1.5 flex-shrink-0"></span>
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
