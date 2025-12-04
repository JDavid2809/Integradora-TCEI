"use client"

import { useState, useEffect } from "react"
import Modal from "@/components/Modal"
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
    Info,
  Mail,
  GraduationCap,
  Target
} from "lucide-react"
import { dataProfileStudent } from "@/types"
import { updateStudentProfile } from "@/actions/student/Perfil"
import { useForm } from "react-hook-form"
import Error from "../../../../../docs/ui/Error"



export default  function StudentProfile() {
   const [studentData, setStudentData] = useState<dataProfileStudent>();
   const { update } = useSession();
   
   const { register, handleSubmit, formState: { errors }, reset } = useForm<dataProfileStudent>({
     
    });

useEffect(() => {
  async function fetchStudent() {
    const res = await fetch("/api/student");
    if (res.ok) {
      const data = await res.json();
      setStudentData(data);
      reset(data); // 🔹 actualiza el formulario con los datos del servidor
    }
  }
  fetchStudent();
}, [reset]);



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
  if (isEditing && studentData) {
    reset(studentData);
  }
}, [isEditing, studentData, reset]);
    

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



const handleSave = (formData: dataProfileStudent) => {
  if (!studentData || !studentData.id_estudiante) return;

  updateStudentProfile({
    ...formData,              
    id_estudiante: studentData.id_estudiante,
        edad: Number(formData.edad) 
  })
  .then(updated => {
    console.log("Estudiante actualizado:", updated);
    setIsEditing(false);
    setStudentData(updated as dataProfileStudent);
     
    
   update({
         nombre: updated.nombre,
         apellido: updated.paterno,
         email: updated.email
       });
      
  })
  .catch(err => console.error(err));

};

  

  const handleCancel = () => {
    setIsEditing(false)
  }

  const updateField = (field: string, value: string) => {
     console.log(field, value);
  }

  const userInitials = `${session.user.name?.charAt(0) || ''}${session.user.apellido?.charAt(0) || ''}`.toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden mb-8">
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-900 dark:via-blue-800 dark:to-indigo-900 px-8 py-10">
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
                <h1 className="text-3xl font-bold mb-3">{` ${studentData?.nombre} ${studentData?.paterno} ${studentData?.materno}`}</h1>
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
              {/* Action Button */}
              <div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <Edit3 className="h-5 w-5" />
                  Editar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de edición */}
        <Modal open={isEditing} onClose={handleCancel}>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Editar datos del alumno</h2>
          {studentData &&  (
            <form
              onSubmit={handleSubmit(handleSave)}
              className="space-y-4 overflow-y-auto max-h-[70vh] pr-2"
            >
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Nombre completo"
                {...register("nombre", { required: "El nombre es obligatorio" })}
              />
              {errors.nombre && (<Error>{errors.nombre.message}</Error>)}
             <div className="flex justify-between gap-3">
               <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Apellido Paterno"
                {...register("paterno", { required: "El apellido paterno es obligatorio" })}
              />
             
              <input
                type="text"
                {...register("materno", { required: "El apellido materno es obligatorio" })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Apellido Materno"
              />
               
             </div>
             {errors.materno && (<Error>{errors.materno.message}</Error>)}
              {errors.paterno && (<Error>{errors.paterno.message}</Error>)}
              <input
                type="number"
                {...register("edad", { required: "La edad es obligatoria" })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Edad"
              />
              {errors.edad && (<Error>{errors.edad.message}</Error>)}
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Email"
                {...register("email", { required: "El email es obligatorio" })}
              />
              {errors.email && (<Error>{errors.email.message}</Error>)}
              <textarea
                {...register("descripcion", { required: "La descripción es obligatoria" })}
                rows={2}
                placeholder="Descripción"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-blue-900"

              />
              {errors.descripcion && (<Error>{errors.descripcion.message}</Error>)}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Guardar
                </button>
              </div>
            </form>
          )}
          
        </Modal>
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                Sobre mí
              </h2>
              
                <textarea
                  value={studentData?.descripcion || ""}
                  rows={5}
                  placeholder="Hola 😉, por favor selecciona editar  perfil y escribe sobre ti en la descripción"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-blue-900"
                />
              
            </div>

            {/* Learning Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Mi aprendizaje</h3>
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
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-center gap-3 text-blue-800 dark:text-blue-300">
                  <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
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
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Mi progreso</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-gray-700 dark:text-slate-300 font-medium">Promedio</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">{profileData.rating}/10</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-700 dark:text-slate-300 font-medium">Cursos</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">5</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-slate-300 font-medium">Completado</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">75%</span>
                </div>
              </div>
            </div>
            

            {/* Info Cards */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Información personal</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-slate-400 font-medium">Ubicación</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      className="text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white font-semibold">{profileData.location}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-slate-400 font-medium">Idiomas</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.languages}
                      onChange={(e) => updateField("languages", e.target.value)}
                      className="text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white font-semibold">{profileData.languages}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-slate-400 font-medium">Email</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-semibold">{session.user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
