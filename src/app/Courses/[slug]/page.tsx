import React, { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getCourseBySlug } from '@/actions/courses/manageCourses'

import NewCourseDetails from './NewCourseDetails'

// Componente de fallback mientras se carga
function LoadingCourseDetails() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#e30f28] mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Cargando detalles del curso...</p>
            </div>
        </div>
    )
}

interface CoursePageProps {
    params: Promise<{ slug: string }>
}

export default async function CoursePage({ params }: CoursePageProps) {
    // Resolver la promesa de params
    const resolvedParams = await params
    const slug = resolvedParams.slug

    // Validar que el slug no esté vacío
    if (!slug || slug.trim() === '') {
        notFound()
    }

    try {
        // Obtener curso desde la base de datos por slug
        const courseData = await getCourseBySlug(slug)
        
        return (
            <Suspense fallback={<LoadingCourseDetails />}>
                <NewCourseDetails courseData={courseData!} />
            </Suspense>
        )
    } catch (error) {
        console.error('Error loading course:', error)
        notFound()
    }
}

// Generar metadata dinámica para SEO
export async function generateMetadata({ params }: CoursePageProps) {
    try {
        const resolvedParams = await params
        const slug = resolvedParams.slug
        
        if (!slug) {
            return {
                title: 'Curso no encontrado',
            }
        }

        const courseData = await getCourseBySlug(slug)
        
        return {
            title: `${courseData.nombre} - Cursos de Inglés`,
            description: `Aprende inglés con nuestro curso ${courseData.nombre} modalidad ${courseData.modalidad.toLowerCase()}. Instructor experto y metodología probada.`,
            keywords: `inglés, curso, ${courseData.modalidad.toLowerCase()}, todos los niveles`,
        }
    } catch (error) {
        return {
            title: 'Curso no encontrado',
            error
        }
    }
}