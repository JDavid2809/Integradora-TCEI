"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  CalendarDays,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  FileText,
  Video,
  PenTool,
  MessageSquare
} from "lucide-react"

// Tipos para el horario del profesor
interface Level {
  id_nivel: number
  nombre: string
}

interface Student {
  id: number
  nombre: string
  apellido: string
  email: string
  enrollment_status: string
}

interface Schedule {
  id: number
  day_of_week: string
  start_time: string
  duration_minutes: number
  classroom?: string
  level: string
}

interface Activity {
  id: number
  title: string
  description?: string
  due_date: string
  activity_type: string
  total_points: number
}

interface Course {
  id: number
  nombre: string
  modalidad: string
  descripcion?: string
  nivel_ingles?: string
  estudiantes_inscritos: number
}

interface CourseSchedule {
  curso: Course
  schedules: Schedule[]
  activities: Activity[]
  students: Student[]
}

interface TeacherScheduleResponse {
  success: boolean
  horarios: CourseSchedule[]
  niveles: Level[]
  teacher_name: string
  teacher_id: number
  isExample?: boolean
}

// Mapeo de días
const DAY_NAMES = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes', 
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo'
}

// Tipos de actividades
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

// Función utilitaria para calcular hora final
const calculateEndTime = (startTime: string, durationMinutes: number) => {
  const [hours, minutes] = startTime.split(':').map(Number)
  const startDate = new Date()
  startDate.setHours(hours, minutes, 0, 0)
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000)
  return endDate.toTimeString().slice(0, 5)
}

// Función utilitaria para calcular duración en minutos
const calculateDuration = (startTime: string, endTime: string) => {
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)
  
  const startDate = new Date()
  startDate.setHours(startHours, startMinutes, 0, 0)
  
  const endDate = new Date()
  endDate.setHours(endHours, endMinutes, 0, 0)
  
  // Si la hora final es menor que la inicial, asumimos que es al día siguiente
  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1)
  }
  
  return Math.round((endDate.getTime() - startDate.getTime()) / 60000)
}

// Modal para crear/editar horario
function ScheduleModal({ 
  isOpen, 
  onClose, 
  onSave, 
  schedule, 
  courses, 
  levels 
}: { 
  isOpen: boolean
  onClose: () => void
  onSave: (scheduleData: any) => void
  schedule?: Schedule & { course_id: number }
  courses: CourseSchedule[]
  levels: Level[]
}) {
  const [formData, setFormData] = useState({
    course_id: schedule?.course_id || courses[0]?.curso.id || '',
    level_id: levels[0]?.id_nivel || '',
    day_of_week: schedule?.day_of_week || 'MONDAY',
    start_time: schedule?.start_time || '09:00',
    end_time: schedule ? calculateEndTime(schedule.start_time, schedule.duration_minutes) : '10:30',
    classroom: schedule?.classroom || ''
  })

  const durationMinutes = calculateDuration(formData.start_time, formData.end_time)
  const isValidTimeRange = durationMinutes > 0 && durationMinutes <= 480 // Máximo 8 horas

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValidTimeRange) {
      alert('La hora de finalización debe ser posterior a la hora de inicio y la clase no puede durar más de 8 horas.')
      return
    }
    
    onSave({
      ...formData,
      duration_minutes: durationMinutes,
      schedule_id: schedule?.id
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#00246a]">
            {schedule ? 'Editar Horario' : 'Crear Nuevo Horario'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Curso
            </label>
            <select
              value={formData.course_id}
              onChange={(e) => setFormData({...formData, course_id: parseInt(e.target.value)})}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              required
            >
              {courses.map((courseSchedule) => (
                <option key={courseSchedule.curso.id} value={courseSchedule.curso.id}>
                  {courseSchedule.curso.nombre} ({courseSchedule.curso.estudiantes_inscritos} estudiantes)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nivel
            </label>
            <select
              value={formData.level_id}
              onChange={(e) => setFormData({...formData, level_id: parseInt(e.target.value)})}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              required
            >
              {levels.map((level) => (
                <option key={level.id_nivel} value={level.id_nivel}>
                  {level.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Día de la semana
            </label>
            <select
              value={formData.day_of_week}
              onChange={(e) => setFormData({...formData, day_of_week: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              required
            >
              {Object.entries(DAY_NAMES).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  🕐 Hora de inicio
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  🕐 Hora de finalización
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  required
                />
              </div>
            </div>
          </div>

          {/* Mostrar información calculada */}
          <div className={`rounded-lg p-4 border ${
            isValidTimeRange 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Horario de clase:</span>
              <div className={`text-lg font-semibold ${
                isValidTimeRange ? 'text-blue-700' : 'text-red-700'
              }`}>
                {formData.start_time} - {formData.end_time}
              </div>
            </div>
            <div className={`text-xs mt-1 ${
              isValidTimeRange ? 'text-slate-600' : 'text-red-600'
            }`}>
              {isValidTimeRange 
                ? `Duración total: ${durationMinutes} minutos`
                : durationMinutes <= 0 
                  ? 'La hora de finalización debe ser posterior a la hora de inicio'
                  : 'La clase no puede durar más de 8 horas'
              }
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Aula/Ubicación
            </label>
            <input
              type="text"
              value={formData.classroom}
              onChange={(e) => setFormData({...formData, classroom: e.target.value})}
              placeholder="Ej: Aula 101, Laboratorio A, Aula Virtual"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-white bg-[#e30f28] rounded-lg hover:bg-[#e30f28]/90 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {schedule ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Calendario mensual para profesores
function TeacherMonthlyCalendar({ 
  schedules, 
  onEditSchedule, 
  onDeleteSchedule, 
  onCreateSchedule 
}: { 
  schedules: CourseSchedule[]
  onEditSchedule: (schedule: Schedule & { course_id: number }) => void
  onDeleteSchedule: (scheduleId: number) => void
  onCreateSchedule: () => void
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [visibleCourses, setVisibleCourses] = useState<number[]>([])
  const [showDayModal, setShowDayModal] = useState(false)

  // Inicializar cursos visibles
  useEffect(() => {
    const allCourseIds = schedules.map(s => s.curso.id)
    setVisibleCourses(allCourseIds)
  }, [schedules])

  // Funciones de navegación del calendario
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
  }

  const getCalendarDays = (date: Date) => {
    const firstDay = getFirstDayOfMonth(date)
    const lastDay = getLastDayOfMonth(date)
    
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

  // Obtener clases para un día específico
  const getDayClasses = (date: Date) => {
    const dayName = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][date.getDay()]
    const classes: Array<Schedule & { curso: Course, course_id: number }> = []
    
    schedules.forEach(courseSchedule => {
      if (visibleCourses.includes(courseSchedule.curso.id)) {
        courseSchedule.schedules.forEach(schedule => {
          if (schedule.day_of_week === dayName) {
            classes.push({ 
              ...schedule, 
              curso: courseSchedule.curso,
              course_id: courseSchedule.curso.id
            })
          }
        })
      }
    })
    
    return classes.sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  // Obtener actividades para un día específico
  const getDayActivities = (date: Date) => {
    const activities: Array<Activity & { curso: Course }> = []
    const dateString = date.toDateString()
    
    schedules.forEach(courseSchedule => {
      if (visibleCourses.includes(courseSchedule.curso.id)) {
        courseSchedule.activities.forEach(activity => {
          const activityDate = new Date(activity.due_date)
          if (activityDate.toDateString() === dateString) {
            activities.push({ ...activity, curso: courseSchedule.curso })
          }
        })
      }
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

  const toggleCourseVisibility = (courseId: number) => {
    setVisibleCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const toggleAllCourses = () => {
    const allCourseIds = schedules.map(s => s.curso.id)
    setVisibleCourses(prev => 
      prev.length === allCourseIds.length ? [] : allCourseIds
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header del calendario */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#00246a] flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Calendario de Clases
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onCreateSchedule}
              className="px-4 py-2 bg-[#e30f28] text-white rounded-lg hover:bg-[#e30f28]/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Clase
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="text-sm font-medium text-slate-700 min-w-[150px] text-center">
              {currentDate.toLocaleDateString('es-ES', { 
                month: 'long',
                year: 'numeric'
              })}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
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
            className="text-sm bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
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
                  {courseSchedule.curso.nombre} ({courseSchedule.curso.estudiantes_inscritos})
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Días de la semana */}
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
          const hasEvents = dayClasses.length > 0 || dayActivities.length > 0
          
          return (
            <div
              key={index}
              className={`min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] border-r border-b border-slate-100 last:border-r-0 p-1 sm:p-2 ${
                !currentMonth ? 'bg-slate-50/50' : ''
              } ${today ? 'bg-blue-50 border-blue-200' : ''} ${
                hasEvents ? 'cursor-pointer hover:bg-slate-50' : ''
              }`}
              onClick={() => {
                if (hasEvents) {
                  setSelectedDay(date)
                  setShowDayModal(true)
                }
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-medium ${
                    !currentMonth ? 'text-slate-400' : 
                    today ? 'text-blue-600 font-bold' : 'text-slate-700'
                  }`}>
                    {date.getDate()}
                  </span>
                  
                  {/* Indicadores para pantallas pequeñas */}
                  {hasEvents && (
                    <div className="flex gap-1 sm:hidden">
                      {dayClasses.length > 0 && (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      )}
                      {dayActivities.length > 0 && (
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {today && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                      Hoy
                    </span>
                  )}
                  
                  {/* Contador de eventos para pantallas pequeñas */}
                  {hasEvents && (
                    <span className="sm:hidden text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full">
                      {dayClasses.length + dayActivities.length}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                {/* Clases del día - Vista responsiva */}
                {dayClasses.map((classItem, classIndex) => (
                  <motion.div
                    key={`class-${classItem.id}-${date.getDate()}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: classIndex * 0.05 }}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded p-1 sm:p-2 text-xs cursor-pointer hover:from-green-600 hover:to-green-700 transition-colors group relative"
                  >
                    {/* Vista completa para pantallas grandes */}
                    <div className="hidden lg:block">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold">
                            {classItem.start_time} - {calculateEndTime(classItem.start_time, classItem.duration_minutes)}
                          </div>
                          <div className="truncate">{classItem.curso.nombre}</div>
                          <div className="text-xs opacity-90">
                            {classItem.classroom} • {classItem.duration_minutes}min
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditSchedule(classItem)
                            }}
                            className="p-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteSchedule(classItem.id)
                            }}
                            className="p-1 bg-white/20 rounded hover:bg-red-500 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Vista compacta para pantallas medianas */}
                    <div className="hidden sm:block lg:hidden">
                      <div className="font-semibold text-xs">{classItem.start_time}</div>
                      <div className="truncate text-xs">{classItem.curso.nombre}</div>
                    </div>

                    {/* Vista mínima para pantallas pequeñas */}
                    <div className="sm:hidden">
                      <div className="w-2 h-2 bg-white rounded-full mx-auto"></div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Actividades del día - Vista responsiva */}
                {dayActivities.map((activity, activityIndex) => {
                  const ActivityIcon = ACTIVITY_TYPES[activity.activity_type as keyof typeof ACTIVITY_TYPES]?.icon || FileText
                  
                  return (
                    <motion.div
                      key={`activity-${activity.id}-${date.getDate()}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (dayClasses.length + activityIndex) * 0.05 }}
                      className="bg-orange-100 border border-orange-200 text-orange-800 rounded p-1 sm:p-2 text-xs cursor-pointer hover:bg-orange-200 transition-colors"
                      title={`${activity.title} - ${activity.curso.nombre}`}
                    >
                      {/* Vista completa para pantallas grandes */}
                      <div className="hidden lg:flex items-center gap-1">
                        <ActivityIcon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate font-medium">{activity.title}</span>
                      </div>

                      {/* Vista compacta para pantallas medianas */}
                      <div className="hidden sm:block lg:hidden">
                        <ActivityIcon className="w-3 h-3 mx-auto" />
                      </div>

                      {/* Vista mínima para pantallas pequeñas */}
                      <div className="sm:hidden">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mx-auto"></div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex flex-wrap gap-4 justify-center text-xs mb-3">
          <div className="flex items-center gap-1">
            <div className="text-gray-700 w-3 h-3 bg-green-500 rounded"></div>
            <span>Mis clases</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="text-gray-700 w-3 h-3 bg-orange-200 border border-orange-300 rounded"></div>
            <span>Actividades</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="text-gray-700 w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Día actual</span>
          </div>
          <div className="hidden lg:flex items-center gap-1">
            <Edit className="w-3 h-3 text-slate-600" />
            <span>Hover para editar</span>
          </div>
          <div className="flex items-center gap-1 lg:hidden">
            <div className="w-3 h-3 bg-slate-200 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
            </div>
            <span>Toca para ver detalles</span>
          </div>
        </div>
        
        <div className="text-center text-xs text-slate-600">
          <span>
            Clases este mes: {
              calendarDays.filter(date => 
                isCurrentMonth(date) && getDayClasses(date).length > 0
              ).length
            } días • 
          </span>
          <span className="ml-2">
            Total estudiantes: {
              schedules.reduce((total, courseSchedule) => 
                total + courseSchedule.curso.estudiantes_inscritos, 0
              )
            }
          </span>
        </div>
      </div>

      {/* Modal para mostrar eventos del día (pantallas pequeñas) */}
      <AnimatePresence>
        {showDayModal && selectedDay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 lg:hidden">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#00246a]">
                  {selectedDay.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </h3>
                <button
                  onClick={() => setShowDayModal(false)}
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
                      <Calendar className="w-4 h-4" />
                      Clases programadas
                    </h4>
                    <div className="space-y-2">
                      {getDayClasses(selectedDay).map((classItem) => (
                        <div
                          key={classItem.id}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">
                              {classItem.start_time} - {calculateEndTime(classItem.start_time, classItem.duration_minutes)}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setShowDayModal(false)
                                  onEditSchedule(classItem)
                                }}
                                className="p-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setShowDayModal(false)
                                  onDeleteSchedule(classItem.id)
                                }}
                                className="p-1 bg-white/20 rounded hover:bg-red-500 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm opacity-90">
                            <div className="font-medium">{classItem.curso.nombre}</div>
                            <div className="text-xs">
                              {classItem.classroom} • {classItem.duration_minutes} minutos
                            </div>
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
                      <FileText className="w-4 h-4" />
                      Actividades
                    </h4>
                    <div className="space-y-2">
                      {getDayActivities(selectedDay).map((activity) => {
                        const ActivityIcon = ACTIVITY_TYPES[activity.activity_type as keyof typeof ACTIVITY_TYPES]?.icon || FileText
                        const activityStyle = ACTIVITY_TYPES[activity.activity_type as keyof typeof ACTIVITY_TYPES]?.color || 'bg-gray-100 text-gray-800'
                        
                        return (
                          <div
                            key={activity.id}
                            className={`${activityStyle} rounded-lg p-3`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <ActivityIcon className="w-4 h-4" />
                              <span className="font-medium">{activity.title}</span>
                            </div>
                            <div className="text-sm">
                              <div>{activity.curso.nombre}</div>
                              <div className="text-xs opacity-75">
                                {activity.total_points} puntos
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Sin eventos */}
                {getDayClasses(selectedDay).length === 0 && getDayActivities(selectedDay).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay eventos programados para este día</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Componente principal
export default function TeacherScheduleContent() {
  const [scheduleData, setScheduleData] = useState<TeacherScheduleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule & { course_id: number } | undefined>()
  const [actionLoading, setActionLoading] = useState(false)

  // Cargar datos del horario
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('/api/teacher/schedule')
        if (!response.ok) {
          throw new Error('Error al cargar el horario')
        }
        const data: TeacherScheduleResponse = await response.json()
        setScheduleData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [])

  // Crear nuevo horario
  const handleCreateSchedule = () => {
    setEditingSchedule(undefined)
    setShowScheduleModal(true)
  }

  // Editar horario existente
  const handleEditSchedule = (schedule: Schedule & { course_id: number }) => {
    setEditingSchedule(schedule)
    setShowScheduleModal(true)
  }

  // Guardar horario (crear o editar)
  const handleSaveSchedule = async (scheduleData: any) => {
    setActionLoading(true)
    try {
      const url = '/api/teacher/schedule'
      const method = editingSchedule ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
      })

      if (!response.ok) {
        throw new Error('Error al guardar el horario')
      }

      // Recargar datos
      window.location.reload()
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setActionLoading(false)
      setShowScheduleModal(false)
    }
  }

  // Eliminar horario
  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/teacher/schedule?id=${scheduleId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el horario')
      }

      // Recargar datos
      window.location.reload()
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando tu calendario de clases...</p>
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
          <h3 className="text-lg font-semibold text-[#00246a] mb-2">Error al cargar horarios</h3>
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
          <h2 className="text-2xl font-bold text-[#00246a]">Gestión de Horarios</h2>
          <p className="text-slate-600">
            Hola {scheduleData.teacher_name}, aquí puedes gestionar tus horarios de clases
            {scheduleData.isExample && (
              <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                Datos de ejemplo
              </span>
            )}
          </p>
        </div>
        <div className="text-right text-sm text-slate-600">
          {scheduleData.horarios.length} {scheduleData.horarios.length === 1 ? 'curso' : 'cursos'} • 
          {scheduleData.horarios.reduce((total, h) => total + h.schedules.length, 0)} clases programadas
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600">Total Cursos</div>
              <div className="text-xl font-bold text-[#00246a]">{scheduleData.horarios.length}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600">Clases/Semana</div>
              <div className="text-xl font-bold text-[#00246a]">
                {scheduleData.horarios.reduce((total, h) => total + h.schedules.length, 0)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600">Total Estudiantes</div>
              <div className="text-xl font-bold text-[#00246a]">
                {scheduleData.horarios.reduce((total, h) => total + h.curso.estudiantes_inscritos, 0)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-gray-700 bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-gray-700 flex items-center gap-3">
            <div className="text-gray-700 p-2 bg-orange-100 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600">Actividades</div>
              <div className="text-xl font-bold text-[#00246a]">
                {scheduleData.horarios.reduce((total, h) => total + h.activities.length, 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <TeacherMonthlyCalendar 
        schedules={scheduleData.horarios}
        onEditSchedule={handleEditSchedule}
        onDeleteSchedule={handleDeleteSchedule}
        onCreateSchedule={handleCreateSchedule}
      />

      {/* Modal de crear/editar horario */}
      <AnimatePresence>
        {showScheduleModal && (
          <ScheduleModal
            isOpen={showScheduleModal}
            onClose={() => setShowScheduleModal(false)}
            onSave={handleSaveSchedule}
            schedule={editingSchedule}
            courses={scheduleData.horarios}
            levels={scheduleData.niveles}
          />
        )}
      </AnimatePresence>

      {/* Overlay de carga */}
      {actionLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Procesando...</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
