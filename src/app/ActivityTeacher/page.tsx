
import React, { Suspense } from 'react'
import ActivityCRUD from '@/app/ActivityTeacher/ActivityPro'
import { getPaginatedCourses } from '@/actions/courses/manageCourses'
import { CourseSearchParams } from '@/types/courses'

// Componente de fallback mientras se carga
function LoadingCourses() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#e30f28] mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Cargando cursos...</p>
            </div>
        </div>
    )
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CoursesPage({ searchParams }: PageProps) {
    // Resolver la promesa de searchParams
    const resolvedSearchParams = await searchParams
    
    // Extraer y validar parámetros de búsqueda
    const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : ''
    const level = typeof resolvedSearchParams.level === 'string' ? resolvedSearchParams.level : 'all'
    const modalidad = typeof resolvedSearchParams.modalidad === 'string' ? resolvedSearchParams.modalidad : 'all'
    const pageParam = typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : '1'
    const page = parseInt(pageParam, 10) || 1

    // Construir parámetros para la consulta
    const courseSearchParams: CourseSearchParams = {
        search: search || undefined,
        level: level !== 'all' ? level : undefined,
        modalidad: modalidad !== 'all' ? modalidad : undefined,
        page,
        limit: 6
    }

    // Obtener cursos paginados del servidor
    const paginatedData = await getPaginatedCourses(courseSearchParams)
    
    return (
        <Suspense fallback={<LoadingCourses />}>
            <ActivityCRUD paginatedData={paginatedData} />
        </Suspense>
    )
}
