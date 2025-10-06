import { Star } from "lucide-react"
import Image from "next/image"

const testimonials = [
    {
        name: "María González",
        role: "Ingeniera de Software",
        image: "/logos/logoIngles.jpg",
        rating: 5,
        text: "Gracias a estos cursos conseguí mi trabajo soñado en una empresa internacional. Los profesores son increíbles y el método realmente funciona.",
    },
    {
        name: "Carlos Rodríguez",
        role: "Estudiante Universitario",
        image: "/logos/logoIngles.jpg",
        rating: 5,
        text: "La flexibilidad de horarios me permitió estudiar mientras trabajaba. En 6 meses pasé de básico a intermedio-avanzado.",
    },
    {
        name: "Ana Martínez",
        role: "Doctora",
        image: "/logos/logoIngles.jpg",
        rating: 5,
        text: "Necesitaba mejorar mi inglés médico y encontré exactamente lo que buscaba. El contenido especializado es excelente.",
    },
    {
        name: "Luis Fernández",
        role: "Empresario",
        image: "/logos/logoIngles.jpg",
        rating: 5,
        text: "Mi confianza al hablar inglés en reuniones internacionales mejoró drasticamente. Recomiendo estos cursos al 100%.",
    },
    {
        name: "Sofia Herrera",
        role: "Diseñadora Gráfica",
        image: "/logos/logoIngles.jpg",
        rating: 5,
        text: "El enfoque práctico y las clases interactivas hicieron que aprender fuera divertido. Ahora trabajo con clientes internacionales.",
    },
    {
        name: "Diego Morales",
        role: "Contador",
        image: "/logos/logoIngles.jpg",
        rating: 5,
        text: "La certificación que obtuve me ayudó a conseguir una promoción. El curso de inglés de negocios es excepcional.",
    },
]

export function Testimonials() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance text-blue-900">
                        Lo que dicen nuestros estudiantes
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto text-balance">
                        Miles de personas han transformado sus vidas aprendiendo inglés con nosotros
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                        >
                            <div className="flex items-center mb-6">
                                <Image
                                    src={testimonial.image || "/placeholder.svg"}
                                    alt={testimonial.name}
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-100"
                                />
                                <div>
                                    <h4 className="font-semibold text-lg text-gray-900">{testimonial.name}</h4>
                                    <p className="text-gray-600">{testimonial.role}</p>
                                </div>
                            </div>

                            <div className="flex mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            <p className="text-gray-600 leading-relaxed italic">&ldquo;{testimonial.text}&rdquo;</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
