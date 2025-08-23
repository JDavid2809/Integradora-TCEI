"use client"

import { useState, useEffect } from "react"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  MapPin,
  Star,
  Users,
  //Award,
  Globe,
  //MessageCircle,
  Calendar,
  BookOpen,
  //CheckCircle,
  Edit3,
  Save,
  X,
  Info,
  Mail,
  GraduationCap,
  Target
} from "lucide-react"

export default function StudentProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    title: "Estudiante de Inglés",
    description:
      "Estudiante motivado enfocado en mejorar mis habilidades en inglés. Mi objetivo es alcanzar un nivel avanzado para futuras oportunidades académicas y profesionales.",
    location: "Madrid, España",
    languages: "Español (Nativo), Inglés (Intermedio)",
    level: "Intermedio",
    courses: "5 cursos",
    rating: "8.5",
    progress: "75% completado",
  })

  useEffect(() => {
    if (status === "loading") return
    
    if (!session?.user || session.user.rol !== 'ESTUDIANTE') {
      router.push('/Login')
    } else {
      setProfileData(prev => ({
        ...prev,
        name: `${session.user.name} ${session.user.apellido}` || "Estudiante"
      }))
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!session?.user || session.user.rol !== 'ESTUDIANTE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Redirigiendo...</div>
      </div>
    )
  }

  const handleSave = () => {
    setIsEditing(false)
    console.log("Perfil actualizado:", profileData)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const updateField = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const userInitials = `${session.user.name?.charAt(0) || ''}${session.user.apellido?.charAt(0) || ''}`.toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-10">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative flex flex-col lg:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl">
                  <span className="text-3xl font-bold text-white">{userInitials}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center lg:text-left text-white">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="text-3xl font-bold bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white placeholder-white/70 focus:bg-white/30 outline-none w-full"
                    />
                    <input
                      type="text"
                      value={profileData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      className="text-xl bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white placeholder-white/70 focus:bg-white/30 outline-none w-full"
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold mb-3">{profileData.name}</h1>
                    <p className="text-xl text-blue-100 mb-4">{profileData.title}</p>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-blue-100">
                      <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                        <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                        <span className="font-semibold text-white">{profileData.rating}</span>
                        <span>promedio</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{profileData.courses}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                        <Target className="h-4 w-4" />
                        <span>{profileData.progress}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <Edit3 className="h-5 w-5" />
                    Editar Perfil
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 inline-flex items-center gap-2 shadow-lg"
                    >
                      <Save className="h-4 w-4" />
                      Guardar
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 inline-flex items-center gap-2 shadow-lg"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                Sobre mí
              </h2>
              {isEditing ? (
                <textarea
                  value={profileData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={5}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed text-lg">{profileData.description}</p>
              )}
            </div>

            {/* Learning Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Mi aprendizaje</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group">
                  <BookOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Mis Cursos
                </button>
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 inline-flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group">
                  <Calendar className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Mi Horario
                </button>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3 text-blue-800">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <Info className="h-4 w-4" />
                  </div>
                  <p className="font-medium">¡Sigue así! Estás muy cerca de completar tu objetivo mensual</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Mi progreso</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-gray-700 font-medium">Promedio</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{profileData.rating}/10</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700 font-medium">Cursos</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">5</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 font-medium">Completado</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">75%</span>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Información personal</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600 font-medium">Ubicación</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      className="text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none w-full"
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold">{profileData.location}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600 font-medium">Idiomas</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.languages}
                      onChange={(e) => updateField("languages", e.target.value)}
                      className="text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none w-full"
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold">{profileData.languages}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600 font-medium">Email</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{session.user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
