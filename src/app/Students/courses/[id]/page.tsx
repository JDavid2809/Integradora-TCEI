import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import StudentCourseView from '@/app/Students/courses/[id]/StudentCourseView'
import { getStudentCourseDetails, getStudentActivities } from '@/actions/student/activityActions'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

function LoadingCourse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Cargando curso...</p>
      </div>
    </div>
  )
}

export default async function StudentCoursePage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  // Verificar autenticación
  if (!session || session.user.rol !== 'ESTUDIANTE') {
    redirect('/Login')
  }

  // Await params en Next.js 15
  const { id } = await params
  const courseId = parseInt(id)

  if (isNaN(courseId)) {
    redirect('/Students')
  }

  try {
    // Obtener datos del curso y actividades
    const [courseDetails, activities] = await Promise.all([
      getStudentCourseDetails(courseId),
      getStudentActivities(courseId)
    ])

    if (!courseDetails) {
      redirect('/Students')
    }

    return (
      <Suspense fallback={<LoadingCourse />}>
        <StudentCourseView
          course={courseDetails}
          activities={activities}
        />
      </Suspense>
    )
  } catch (error) {
    console.error('Error loading course:', error)
    redirect('/Students')
  }
}
