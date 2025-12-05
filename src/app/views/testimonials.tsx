import CardSwap, { Card } from "@/components/CardSwap";


export function Testimonials() {
    return (
        <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance bg-[#ef182e] bg-clip-text text-transparent">
                        Lo que dicen nuestros estudiantes
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto text-balance">
                        Miles de personas han transformado sus vidas aprendiendo inglés con nosotros
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Lado izquierdo - Mensaje descriptivo mejorado */}
                    <div className="space-y-8 max-lg:text-center">
                        <div className="space-y-4">
                            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                                Historias reales de{' '}
                                <span className="bg-[#ef182e] bg-clip-text text-transparent">
                                    éxito
                                </span>
                            </h3>
                            
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Nuestros estudiantes no solo aprenden inglés, construyen nuevas oportunidades. 
                                Desde conseguir mejores empleos hasta viajar con confianza por el mundo.
                            </p>
                        </div>

                        {/* Estadísticas destacadas */}
                        <div className="grid grid-cols-3 gap-4 py-6">
                            <div className="text-center p-4 bg-white rounded-xl shadow-md border border-blue-100">
                                <div className="text-3xl font-bold text-blue-600">95%</div>
                                <div className="text-sm text-gray-600 mt-1">Satisfacción</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-xl shadow-md border border-purple-100">
                                <div className="text-3xl font-bold text-purple-600">10k+</div>
                                <div className="text-sm text-gray-600 mt-1">Estudiantes</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-xl shadow-md border border-green-100">
                                <div className="text-3xl font-bold text-green-600">4.9</div>
                                <div className="text-sm text-gray-600 mt-1">Rating</div>
                            </div>
                        </div>

                        {/* Beneficios mejorados */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow max-lg:justify-center border border-blue-50">
                                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-left flex-1">
                                    <h4 className="font-bold text-gray-900 text-lg">Método comprobado</h4>
                                    <p className="text-gray-600 text-sm mt-1">Aprende de forma práctica y efectiva con resultados garantizados</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow max-lg:justify-center border border-green-50">
                                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div className="text-left flex-1">
                                    <h4 className="font-bold text-gray-900 text-lg">Profesores expertos</h4>
                                    <p className="text-gray-600 text-sm mt-1">Guía personalizada en cada paso de tu aprendizaje</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow max-lg:justify-center border border-purple-50">
                                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div className="text-left flex-1">
                                    <h4 className="font-bold text-gray-900 text-lg">Resultados garantizados</h4>
                                    <p className="text-gray-600 text-sm mt-1">Mejora visible desde la primera semana de clases</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lado derecho - Cards animadas */}
                    <div style={{ height: '700px', position: 'relative' }} className="max-lg:hidden">
                        <CardSwap
                            cardDistance={60}
                            verticalDistance={70}
                            delay={4000}
                            pauseOnHover={false}
                            width={450}
                            height={550}
                        >
                            <Card
                                name="María González"
                                role="Estudiante de Negocios"
                                rating={5}
                                comment="Gracias a este curso conseguí mi trabajo soñado en una empresa internacional. Los profesores son increíbles y el método realmente funciona."
                                backgroundImage="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop"
                            />
                            <Card
                                name="Carlos Ramírez"
                                role="Ingeniero de Software"
                                rating={5}
                                comment="El mejor curso de inglés que he tomado. En solo 3 meses pasé de nivel básico a poder tener conversaciones fluidas con clientes extranjeros."
                                backgroundImage="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop"
                            />
                            <Card
                                name="Ana Martínez"
                                role="Médica Residente"
                                rating={5}
                                comment="Necesitaba inglés médico para mi especialización. Este curso superó todas mis expectativas. Ahora puedo leer papers y asistir a conferencias internacionales."
                                backgroundImage="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000&auto=format&fit=crop"
                            />
                            <Card
                                name="Jorge López"
                                role="Emprendedor"
                                rating={5}
                                comment="Invertir en este curso fue la mejor decisión. Ahora puedo negociar con proveedores internacionales y expandir mi negocio a otros países."
                                backgroundImage="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop"
                            />
                            <Card
                                name="Laura Fernández"
                                role="Diseñadora UX/UI"
                                rating={5}
                                comment="Como diseñadora, necesitaba comunicarme con equipos globales. Este curso me dio la confianza para participar activamente en reuniones internacionales."
                                backgroundImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop"
                            />
                        </CardSwap>
                    </div>
                </div>
            </div>
        </section>
    )
}
