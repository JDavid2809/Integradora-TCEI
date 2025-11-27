import { createSlug } from '@/lib/slugUtils'

export default function TestPage() {
    const sampleCourses = [
        { id: 1, name: "Inglés Básico A1" },
        { id: 2, name: "Inglés Intermedio B1" },
        { id: 3, name: "Conversación en Inglés" },
        { id: 4, name: "Inglés para Negocios" },
        { id: 5, name: "Preparación TOEFL" }
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-[#00246a]">Prueba de URLs con Slug</h1>
            
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#e30f28]">Comparación de URLs</h2>
                <div className="space-y-4">
                    <div>
                        <p className="font-medium text-gray-700">URL Anterior (por ID):</p>
                        <code className="text-sm text-gray-600">/Courses/1</code>
                    </div>
                    <div>
                        <p className="font-medium text-gray-700">URL Nueva (por Slug):</p>
                        <code className="text-sm text-green-600">/Courses/ingles-basico-a1</code>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-[#e30f28]">Ejemplos de Cursos con Slug</h2>
                <div className="space-y-3">
                    {sampleCourses.map(course => {
                        const slug = createSlug(course.name)
                        return (
                            <div key={course.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{course.name}</h3>
                                        <p className="text-sm text-gray-600">Slug: <code className="text-blue-600">{slug}</code></p>
                                    </div>
                                    <a 
                                        href={`/Courses/${slug}`}
                                        className="bg-[#e30f28] hover:bg-[#c20e24] text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Ver curso
                                    </a>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Beneficios de usar Slugs</h3>
                <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    <li>URLs más legibles y amigables para SEO</li>
                    <li>Mejor experiencia de usuario</li>
                    <li>URLs que describen el contenido</li>
                    <li>Más fácil de compartir y recordar</li>
                </ul>
            </div>
        </div>
    )
}