"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  FileText,
  Video,
  PenTool,
  MessageSquare,
  CalendarDays,
  Filter,
  Eye,
  X
} from "lucide-react"

// Tipos para el horario
interface Teacher {
  nombre: string
  apellido: string
}

interface Schedule {
  id: number
  day_of_week: string
  start_time: string
  duration_minutes: number
  classroom?: string
  teacher: Teacher
}

interface Activity {
  id: number
  title: string
  due_date: string
  activity_type: string
}

interface Course {
  id: number
  nombre: string
  modalidad: string
  nivel: string
}

interface CourseSchedule {
  curso: Course
  schedules: Schedule[]
  activities: Activity[]
}

interface ScheduleResponse {
  success: boolean
  horarios: CourseSchedule[]
  student_name: string
}

// Mapeo de días en inglés a español
const DAY_NAMES = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes', 
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo'
}

// Mapeo de tipos de actividades
const ACTIVITY_TYPES = {
  ASSIGNMENT: { icon: FileText, label: 'Tarea', color: 'bg-blue-100 text-blue-800' },
  QUIZ: { icon: CheckCircle, label: 'Quiz', color: 'bg-green-100 text-green-800' },
  PROJECT: { icon: PenTool, label: 'Proyecto', color: 'bg-purple-100 text-purple-800' },
  READING: { icon: BookOpen, label: 'Lectura', color: 'bg-orange-100 text-orange-800' },
  VIDEO: { icon: Video, label: 'Video', color: 'bg-red-100 text-red-800' },
  PRACTICE: { icon: PenTool, label: 'Práctica', color: 'bg-yellow-100 text-yellow-800' },
  DISCUSSION: { icon: MessageSquare, label: 'Discusión', color: 'bg-indigo-100 text-indigo-800' },
  EXAM: { icon: AlertCircle, label: 'Examen', color: 'bg-red-100 text-red-800' }
}

// Componente de calendario mensual
function MonthlyCalendar({ schedules }: { schedules: CourseSchedule[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [visibleCourses, setVisibleCourses] = useState<number[]>([])
  
  // Inicializar todos los cursos como visibles
  useState(() => {
    const allCourseIds = schedules.map(s => s.curso.id)
    setVisibleCourses(allCourseIds)
  })
  
  // Obtener el primer día del mes
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  // Obtener el último día del mes
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
  }

  // Obtener los días a mostrar en el calendario (incluyendo días previos y siguientes)
  const getCalendarDays = (date: Date) => {
    const firstDay = getFirstDayOfMonth(date)
    const lastDay = getLastDayOfMonth(date)
    
    // Ajustar para que la semana comience en lunes
    const firstDayWeekday = firstDay.getDay()
    const adjustedFirstWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1
    
    const calendarStart = new Date(firstDay)
    calendarStart.setDate(firstDay.getDate() - adjustedFirstWeekday)
    
    const calendarEnd = new Date(lastDay)
    const lastDayWeekday = lastDay.getDay()
    const adjustedLastWeekday = lastDayWeekday === 0 ? 6 : lastDayWeekday - 1
    const daysToAdd = 6 - adjustedLastWeekday
    calendarEnd.setDate(lastDay.getDate() + daysToAdd)
    
    const days = []
    const current = new Date(calendarStart)
    
    while (current <= calendarEnd) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const calendarDays = getCalendarDays(currentDate)

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Obtener las clases para un día específico
  const getDayClasses = (date: Date) => {
    const dayName = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][date.getDay()]
    const classes: Array<Schedule & { curso: Course }> = []
    
    schedules.forEach(courseSchedule => {
      // Filtrar por cursos visibles
      if (visibleCourses.includes(courseSchedule.curso.id)) {
        courseSchedule.schedules.forEach(schedule => {
          if (schedule.day_of_week === dayName) {
            classes.push({ ...schedule, curso: courseSchedule.curso })
          }
        })
      }
    })
    
    return classes.sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  // Función para alternar la visibilidad de un curso
  const toggleCourseVisibility = (courseId: number) => {
    setVisibleCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  // Mostrar/ocultar todos los cursos
  const toggleAllCourses = () => {
    const allCourseIds = schedules.map(s => s.curso.id)
    setVisibleCourses(prev => 
      prev.length === allCourseIds.length ? [] : allCourseIds
    )
  }

  // Obtener actividades para un día específico
  const getDayActivities = (date: Date) => {
    const activities: Array<Activity & { curso: Course }> = []
    const dateString = date.toDateString()
    
    schedules.forEach(courseSchedule => {
      courseSchedule.activities.forEach(activity => {
        const activityDate = new Date(activity.due_date)
        if (activityDate.toDateString() === dateString) {
          activities.push({ ...activity, curso: courseSchedule.curso })
        }
      })
    })
    
    return activities
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#00246a] flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Calendario Mensual
          </h3>
          
          <div className="flex items-center gap-2">
            {/* Filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Filtros"
            >
              <Filter className="w-5 h-5" />
            </button>
            
            {/* Navegación de meses */}
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="text-sm font-medium text-slate-700 min-w-[150px] text-center">
              {currentDate.toLocaleDateString('es-ES', { 
                month: 'long',
                year: 'numeric'
              })}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-600">
            {schedules.length} {schedules.length === 1 ? 'curso' : 'cursos'} • 
            {visibleCourses.length} {visibleCourses.length === 1 ? 'visible' : 'visibles'}
          </div>
          <button
            onClick={goToToday}
            className="text-sm bg-[#e30f28] text-white px-4 py-2 rounded-lg hover:bg-[#e30f28]/90 transition-colors"
          >
            Ir a Hoy
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-slate-50 rounded-lg border"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-700">Filtrar por curso</h4>
              <button
                onClick={toggleAllCourses}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                {visibleCourses.length === schedules.length ? 'Ocultar todos' : 'Mostrar todos'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {schedules.map((courseSchedule) => (
                <button
                  key={courseSchedule.curso.id}
                  onClick={() => toggleCourseVisibility(courseSchedule.curso.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    visibleCourses.includes(courseSchedule.curso.id)
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'bg-slate-200 text-slate-600 border-2 border-transparent hover:bg-slate-300'
                  }`}
                >
                  <Eye className={`w-3 h-3 inline mr-1 ${
                    visibleCourses.includes(courseSchedule.curso.id) ? 'opacity-100' : 'opacity-50'
                  }`} />
                  {courseSchedule.curso.nombre}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Encabezado de días de la semana */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {Object.values(DAY_NAMES).map((dayName) => (
          <div key={dayName} className="p-3 text-center border-r border-slate-100 last:border-r-0 bg-slate-50">
            <div className="text-sm font-medium text-slate-700">{dayName.substring(0, 3)}</div>
          </div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, index) => {
          const dayClasses = getDayClasses(date)
          const dayActivities = getDayActivities(date)
          const today = isToday(date)
          const currentMonth = isCurrentMonth(date)
          
          return (
            <div
              key={index}
              className={`min-h-[120px] border-r border-b border-slate-100 last:border-r-0 p-2 ${
                !currentMonth ? 'bg-slate-50/50' : ''
              } ${today ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-medium ${
                  !currentMonth ? 'text-slate-400' : 
                  today ? 'text-blue-600 font-bold' : 'text-slate-700'
                }`}>
                  {date.getDate()}
                </span>
                {today && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    Hoy
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                {/* Clases del día */}
                {dayClasses.map((classItem, classIndex) => (
                  <motion.div
                    key={`class-${classItem.id}-${date.getDate()}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: classIndex * 0.05 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded p-2 text-xs cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-colors"
                    title={`${classItem.curso.nombre} - ${classItem.teacher.nombre} ${classItem.teacher.apellido} - ${classItem.classroom || 'Sin aula'}`}
                    onClick={() => setSelectedDay(date)}
                  >
                    <div className="font-semibold">{classItem.start_time}</div>
                    <div className="truncate">{classItem.curso.nombre}</div>
                  </motion.div>
                ))}
                
                {/* Actividades del día */}
                {dayActivities.map((activity, activityIndex) => {
                  const ActivityIcon = ACTIVITY_TYPES[activity.activity_type as keyof typeof ACTIVITY_TYPES]?.icon || FileText
                  const activityColor = ACTIVITY_TYPES[activity.activity_type as keyof typeof ACTIVITY_TYPES]?.color || 'bg-gray-100 text-gray-800'
                  
                  return (
                    <motion.div
                      key={`activity-${activity.id}-${date.getDate()}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (dayClasses.length + activityIndex) * 0.05 }}
                      className="bg-orange-100 border border-orange-200 text-orange-800 rounded p-2 text-xs cursor-pointer hover:bg-orange-200 transition-colors"
                      title={`${activity.title} - ${activity.curso.nombre}`}
                    >
                      <div className="flex items-center gap-1">
                        <ActivityIcon className="w-3 h-3" />
                        <span className="truncate font-medium">{activity.title}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Leyenda y estadísticas */}
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex flex-wrap gap-4 justify-center text-xs mb-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Clases regulares</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-200 border border-orange-300 rounded"></div>
            <span>Actividades/Tareas</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Día actual</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-slate-100 rounded"></div>
            <span>Otros meses</span>
          </div>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="text-center text-xs text-slate-600">
          <span>
            Clases este mes: {
              calendarDays.filter(date => 
                isCurrentMonth(date) && getDayClasses(date).length > 0
              ).length
            } días • 
          </span>
          <span className="ml-2">
            Actividades pendientes: {
              schedules.reduce((total, courseSchedule) => 
                total + courseSchedule.activities.filter(activity => 
                  new Date(activity.due_date) >= new Date() &&
                  new Date(activity.due_date).getMonth() === currentDate.getMonth() &&
                  new Date(activity.due_date).getFullYear() === currentDate.getFullYear()
                ).length, 0
              )
            }
          </span>
        </div>
      </div>
      
      {/* Modal de detalles del día seleccionado */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDay(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#00246a]">
                {selectedDay.toLocaleDateString('es-ES', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Clases del día */}
              {getDayClasses(selectedDay).length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Clases programadas
                  </h4>
                  <div className="space-y-2">
                    {getDayClasses(selectedDay).map((classItem) => (
                      <div key={classItem.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-medium text-blue-800">{classItem.curso.nombre}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          <div>⏰ {classItem.start_time} ({classItem.duration_minutes} min)</div>
                          <div>👨‍🏫 {classItem.teacher.nombre} {classItem.teacher.apellido}</div>
                          {classItem.classroom && <div>📍 {classItem.classroom}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actividades del día */}
              {getDayActivities(selectedDay).length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    Actividades que vencen
                  </h4>
                  <div className="space-y-2">
                    {getDayActivities(selectedDay).map((activity) => {
                      const ActivityIcon = ACTIVITY_TYPES[activity.activity_type as keyof typeof ACTIVITY_TYPES]?.icon || FileText
                      return (
                        <div key={activity.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-2 mb-1">
                            <ActivityIcon className="w-4 h-4 text-orange-600" />
                            <div className="font-medium text-orange-800">{activity.title}</div>
                          </div>
                          <div className="text-sm text-slate-600">
                            📚 {activity.curso.nombre}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Si no hay eventos */}
              {getDayClasses(selectedDay).length === 0 && getDayActivities(selectedDay).length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">No hay clases ni actividades programadas para este día</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

// Componente del horario tradicional
function TraditionalSchedule({ schedules }: { schedules: CourseSchedule[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-[#00246a]">Horario de Clases</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {schedules.map((courseSchedule) => (
            <div key={courseSchedule.curso.id} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#00246a]">{courseSchedule.curso.nombre}</h4>
                    <p className="text-sm text-slate-600">
                      {courseSchedule.curso.modalidad} • Nivel {courseSchedule.curso.nivel}
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-600">
                    {courseSchedule.schedules.length} {courseSchedule.schedules.length === 1 ? 'clase' : 'clases'} por semana
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courseSchedule.schedules.map((schedule) => (
                    <div key={schedule.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-slate-800">
                          {DAY_NAMES[schedule.day_of_week as keyof typeof DAY_NAMES]}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock className="w-4 h-4" />
                          <span>{schedule.start_time} ({schedule.duration_minutes} min)</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <User className="w-4 h-4" />
                          <span>{schedule.teacher.nombre} {schedule.teacher.apellido}</span>
                        </div>
                        {schedule.classroom && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <MapPin className="w-4 h-4" />
                            <span>{schedule.classroom}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente de actividades próximas
function UpcomingActivities({ schedules }: { schedules: CourseSchedule[] }) {
  const allActivities = schedules.flatMap(schedule => 
    schedule.activities.map(activity => ({
      ...activity,
      course_name: schedule.curso.nombre
    }))
  ).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil <= 1) return 'border-red-200 bg-red-50'
    if (daysUntil <= 3) return 'border-orange-200 bg-orange-50'
    if (daysUntil <= 7) return 'border-yellow-200 bg-yellow-50'
    return 'border-blue-200 bg-blue-50'
  }

  if (allActivities.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-[#00246a] mb-4">Actividades Próximas</h3>
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <p className="text-slate-600">¡No tienes actividades pendientes!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-[#00246a]">Actividades Próximas</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {allActivities.slice(0, 5).map((activity) => {
            const ActivityIcon = ACTIVITY_TYPES[activity.activity_type as keyof typeof ACTIVITY_TYPES]?.icon || FileText
            const activityTypeData = ACTIVITY_TYPES[activity.activity_type as keyof typeof ACTIVITY_TYPES]
            const daysUntil = getDaysUntilDue(activity.due_date)
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`border-2 rounded-lg p-4 ${getUrgencyColor(daysUntil)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <ActivityIcon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-800">{activity.title}</h4>
                      {activityTypeData && (
                        <span className={`text-xs px-2 py-1 rounded-full ${activityTypeData.color}`}>
                          {activityTypeData.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{activity.course_name}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600">
                        Vence: {new Date(activity.due_date).toLocaleDateString('es-ES', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </span>
                      <span className={`font-medium ${
                        daysUntil <= 1 ? 'text-red-600' :
                        daysUntil <= 3 ? 'text-orange-600' :
                        daysUntil <= 7 ? 'text-yellow-600' : 'text-blue-600'
                      }`}>
                        {daysUntil <= 0 ? 'Vencido' : 
                         daysUntil === 1 ? 'Mañana' : 
                         `En ${daysUntil} días`}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function ScheduleContent() {
  const [scheduleData, setScheduleData] = useState<ScheduleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('/api/student/schedule')
        if (!response.ok) {
          throw new Error('Error al cargar el horario')
        }
        const data: ScheduleResponse = await response.json()
        setScheduleData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando tu horario...</p>
        </div>
      </motion.div>
    )
  }

  if (error || !scheduleData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#00246a] mb-2">Error al cargar horario</h3>
          <p className="text-slate-600 mb-4">{error || 'No se pudo cargar la información'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#e30f28] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#e30f28]/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </motion.div>
    )
  }

  if (scheduleData.horarios.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#00246a] mb-2">No tienes clases programadas</h3>
          <p className="text-slate-600 mb-4">
            Inscríbete en cursos para ver tu horario de clases aquí.
          </p>
          <button 
            onClick={() => window.location.href = '/Courses'}
            className="bg-[#e30f28] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#e30f28]/90 transition-colors"
          >
            Explorar Cursos
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#00246a]">Mi Horario</h2>
          <p className="text-slate-600">
            Hola {scheduleData.student_name}, aquí está tu horario de clases
          </p>
        </div>
        <div className="text-right text-sm text-slate-600">
          {scheduleData.horarios.length} {scheduleData.horarios.length === 1 ? 'curso' : 'cursos'} activos
        </div>
      </div>

      {/* Actividades próximas */}
      <UpcomingActivities schedules={scheduleData.horarios} />

      {/* Calendario mensual */}
      <MonthlyCalendar schedules={scheduleData.horarios} />

      {/* Horario tradicional */}
      <TraditionalSchedule schedules={scheduleData.horarios} />
    </motion.div>
  )
}
