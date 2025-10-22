import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { PrismaClient } from '@prisma/client'
import CourseActivitiesPage from '@/components/teacher/activities/CourseActivitiesPage'

const prisma = new PrismaClient()

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TeacherCourseActivitiesPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  // Verificar autenticación y rol
  if (!session || session.user.rol !== 'PROFESOR') {
    redirect('/login')
  }

  // Verificar que tiene información de profesor
  if (!session.user.extra?.id_profesor) {
    redirect('/teacher/courses')
  }

  const courseId = parseInt(id)
  if (isNaN(courseId)) {
    redirect('/teacher/courses')
  }

  // Verificar que el profesor es el dueño del curso
  const course = await prisma.curso.findFirst({
    where: {
      id_curso: courseId,
      created_by: session.user.extra.id_profesor // Usar id_profesor, no user.id
    },
    select: {
      id_curso: true,
      nombre: true
    }
  })

  if (!course) {
    redirect('/teacher/courses')
  }

  return (
    <CourseActivitiesPage
      courseId={course.id_curso}
      teacherId={session.user.extra.id_profesor} // Usar id_profesor, no user.id
      courseName={course.nombre}
    />
  )
}
