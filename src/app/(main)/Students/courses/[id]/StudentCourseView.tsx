'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, ListChecks } from 'lucide-react'
import StudentCourseDetailComponent from '@/components/student/StudentCourseDetail'
import StudentActivityList from '@/components/student/StudentActivityList'
import CertificateButton from '@/components/certificates/CertificateButton'
import { StudentCourseDetail, StudentActivityWithSubmission } from '@/types/student-activity'

interface StudentCourseViewProps {
  course: StudentCourseDetail
  activities: StudentActivityWithSubmission[]
}

type ViewTab = 'details' | 'activities'

export default function StudentCourseView({ course, activities: initialActivities }: StudentCourseViewProps) {
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState<ViewTab>('activities')
  const [activities, setActivities] = useState(initialActivities)
  const [refreshKey, setRefreshKey] = useState(0)

  // Sincronizar estado con los datos del servidor cuando cambien
  useEffect(() => {
    setActivities(initialActivities)
    // Incrementar refreshKey para forzar actualización del CertificateButton
    setRefreshKey(prev => prev + 1)
  }, [initialActivities])

  const handleRefresh = () => {
    // Recargar la página para obtener datos actualizados
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header Compacto */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Info del curso */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/Students')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{course.nombre}</h1>
                <p className="text-xs text-gray-500">
                  {course.instructor.nombre} {course.instructor.apellido}
                </p>
              </div>
            </div>

            {/* Botón de Certificado */}
            <div className="hidden sm:block">
              <CertificateButton
                inscripcionId={course.inscripcionId}
                courseId={course.id}
                courseName={course.nombre}
                refreshKey={refreshKey}
              />
            </div>
          </div>

          {/* Botón de Certificado - Versión móvil */}
          <div className="sm:hidden py-3 border-b border-gray-100">
            <CertificateButton
              inscripcionId={course.inscripcionId}
              courseId={course.id}
              courseName={course.nombre}
              refreshKey={refreshKey}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 pt-2">
            <button
              onClick={() => setCurrentTab('activities')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-all ${
                currentTab === 'activities'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              Actividades
            </button>
            
            <button
              onClick={() => setCurrentTab('details')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-all ${
                currentTab === 'details'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Detalles
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'activities' ? (
          <StudentActivityList
            activities={activities}
            courseId={course.id}
            onRefresh={handleRefresh}
          />
        ) : (
          <StudentCourseDetailComponent course={course} />
        )}
      </div>
    </div>
  )
}
