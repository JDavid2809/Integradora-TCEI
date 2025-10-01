"use client"

import { Clock, Users, Star, BookOpen } from "lucide-react"

export default function CoursesDetails() {
  const course = {
    id: 1,
    name: "English Conversation Mastery",
    description:
      "Domina el arte de la conversación en inglés con nuestro curso intensivo. Aprenderás técnicas avanzadas de comunicación, vocabulario esencial para situaciones cotidianas y profesionales, y desarrollarás la confianza necesaria para mantener conversaciones fluidas en cualquier contexto.",
    image: "/english-conversation-class-with-students.jpg",
    instructor: {
      name: "Sarah Johnson",
      title: "Profesora Certificada TESOL",
      experience: "8 años de experiencia",
      avatar: "/professional-english-teacher-portrait.jpg",
    },
    price: 299,
    originalPrice: 399,
    duration: "12 semanas",
    students: 1247,
    rating: 4.8,
    level: "Intermedio-Avanzado",
    features: [
      "Clases en vivo 2 veces por semana",
      "Acceso a material descargable",
      "Certificado de finalización",
      "Soporte 24/7",
      "Práctica con hablantes nativos",
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="relative h-96 bg-gradient-to-r from-slate-100 to-blue-50 flex items-end border-b-4 border-[#00246a]">
        <div className="w-full p-8">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block px-4 py-2 bg-[#e30f28] rounded-full text-sm font-medium mb-4 text-white animate-pulse">
              {course.level}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#00246a] text-balance animate-fade-in-up">
              {course.name}
            </h1>
            <div className="flex items-center gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-800">{course.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">{course.students.toLocaleString()} estudiantes</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">{course.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Image Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <img
                src={course.image || "/placeholder.svg"}
                alt={course.name}
                className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <h2 className="text-2xl font-bold text-[#00246a] mb-6">Descripción del Curso</h2>
              <p className="text-lg text-gray-600 leading-relaxed text-pretty">{course.description}</p>
            </div>

            {/* Features Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-2xl font-bold text-[#00246a] mb-6 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-[#e30f28]" />
                Lo que incluye este curso
              </h3>
              <ul className="space-y-4">
                {course.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 transform hover:translate-x-2 transition-transform duration-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className="w-3 h-3 bg-[#e30f28] rounded-full mt-2 flex-shrink-0 animate-bounce"
                      style={{ animationDelay: `${index * 200}ms` }}
                    />
                    <span className="text-gray-600 text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-xl p-8 border-2 border-[#e30f28]/20 transform hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#e30f28]/40">
              <div className="text-center space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl font-bold text-[#e30f28] animate-pulse">${course.price}</span>
                    <span className="text-xl text-gray-400 line-through">${course.originalPrice}</span>
                  </div>
                  <p className="text-gray-600">Precio de inscripción</p>
                </div>

                <div className="space-y-4">
                  <button className="w-full bg-[#e30f28] hover:bg-[#c20d23] text-white font-bold py-4 px-6 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                    Inscribirse Ahora
                  </button>
                  <button className="w-full border-2 border-[#00246a] text-[#00246a] hover:bg-[#00246a] hover:text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 bg-transparent">
                    Más Información
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Garantía de devolución de 30 días</p>
                </div>
              </div>
            </div>

            {/* Instructor Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-xl font-bold text-[#00246a] mb-6">Tu Instructor</h3>
              <div className="flex items-start gap-4">
                <img
                  src={course.instructor.avatar || "/placeholder.svg"}
                  alt={course.instructor.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-[#e30f28]/20 transform hover:scale-110 transition-transform duration-300"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-[#00246a] text-lg">{course.instructor.name}</h4>
                  <p className="text-[#e30f28] font-medium">{course.instructor.title}</p>
                  <p className="text-gray-600">{course.instructor.experience}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-xl font-bold text-[#00246a] mb-6">Detalles del Curso</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-semibold text-[#00246a]">{course.duration}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Nivel:</span>
                  <span className="font-semibold text-[#00246a]">{course.level}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Estudiantes:</span>
                  <span className="font-semibold text-[#00246a]">{course.students.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Calificación:</span>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-[#00246a]">{course.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}
