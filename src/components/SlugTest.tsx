import { createSlug } from '@/lib/slugUtils'

// Ejemplos de nombres de cursos
const courseNames = [
    "Inglés Básico A1",
    "Inglés Intermedio B1", 
    "Inglés Avanzado C1",
    "Conversación en Inglés",
    "Inglés para Negocios",
    "Preparación TOEFL",
    "Inglés Médico Especializado"
]

export function testSlugs() {
    console.log("=== PRUEBA DE SLUGS ===")
    courseNames.forEach(name => {
        const slug = createSlug(name)
        console.log(`${name} -> ${slug}`)
    })
}

export default function SlugTest() {
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Prueba de Slugs</h2>
            <div className="space-y-2">
                {courseNames.map((name, index) => {
                    const slug = createSlug(name)
                    return (
                        <div key={index} className="flex justify-between p-2 bg-gray-100 rounded">
                            <span>{name}</span>
                            <span className="font-mono text-blue-600">{slug}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}