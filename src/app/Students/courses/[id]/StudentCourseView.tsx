'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, ListChecks } from 'lucide-react'
import StudentCourseDetailComponent from '@/components/student/StudentCourseDetail'
import StudentActivityList from '@/components/student/StudentActivityList'
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

  const handleRefresh = () => {
    // Recargar la página para obtener datos actualizados
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/Students')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course.nombre}</h1>
              <p className="text-sm text-gray-600">
                {course.instructor.nombre} {course.instructor.apellido}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentTab('activities')}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-semibold transition-all ${
                currentTab === 'activities'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ListChecks className="w-5 h-5" />
              Actividades
            </button>
            
            <button
              onClick={() => setCurrentTab('details')}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-semibold transition-all ${
                currentTab === 'details'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Detalles del Curso
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
