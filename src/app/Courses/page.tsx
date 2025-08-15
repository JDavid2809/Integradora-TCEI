import React, { Suspense } from 'react'
import Courses from './Courses'

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

export default function page() {
    return (
        <Suspense fallback={<LoadingCourses />}>
            <Courses/>
        </Suspense>
    )
}
