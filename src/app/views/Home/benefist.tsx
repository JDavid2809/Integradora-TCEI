import { Globe, UsersIcon, AwardIcon, ClockIcon, HeadphonesIcon, BookOpenIcon } from "lucide-react"

const benefits = [
  {
    icon: Globe,
    title: "Clases Online 24/7",
    description: "Accede a tus lecciones desde cualquier lugar y en cualquier momento que te convenga",
  },
  {
    icon: UsersIcon,
    title: "Profesores Expertos",
    description: "Instructores nativos certificados con años de experiencia enseñando español-hablantes",
  },
  {
    icon: AwardIcon,
    title: "Certificación Oficial",
    description: "Obtén certificados reconocidos internacionalmente al completar cada nivel",
  },
  {
    icon: ClockIcon,
    title: "Aprendizaje Flexible",
    description: "Estudia a tu ritmo con horarios que se adaptan a tu estilo de vida",
  },
  {
    icon: HeadphonesIcon,
    title: "Práctica Conversacional",
    description: "Sesiones de conversación en vivo para mejorar tu fluidez y confianza",
  },
  {
    icon: BookOpenIcon,
    title: "Material Interactivo",
    description: "Recursos multimedia, ejercicios gamificados y contenido actualizado",
  },
]

export function Benefits() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance text-blue-900">
            ¿Por qué elegir nuestros cursos?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
            Descubre las ventajas que hacen de nuestra plataforma la mejor opción para aprender inglés
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl p-8 text-center hover:shadow-xl transition-all duration-500 border border-gray-200 hover:border-[#e30f28]/20 hover:-translate-y-2 transform"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#e30f28]/10 to-[#00246a]/10 rounded-2xl mb-6 group-hover:from-[#e30f28]/20 group-hover:to-[#00246a]/20 transition-all duration-300 group-hover:scale-110">
                <benefit.icon className="w-10 h-10 text-[#e30f28] group-hover:text-[#00246a] transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 group-hover:text-[#e30f28] transition-colors duration-300">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              <div className="w-12 h-1 bg-gradient-to-r from-[#e30f28] to-[#00246a] rounded-full mx-auto mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
