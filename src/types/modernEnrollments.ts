
// Definir enums localmente hasta que Prisma los reconozca
export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED', 
  DROPPED = 'DROPPED',
  SUSPENDED = 'SUSPENDED',
  TRANSFERRED = 'TRANSFERRED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE', 
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  ONLINE = 'ONLINE',
  OTHER = 'OTHER'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export interface ModernEnrollment {
  id: number
  student_id: number
  course_id: number
  enrolled_at: Date
  status: EnrollmentStatus
  payment_status: PaymentStatus
  notes?: string
  student: {
    id_estudiante: number
    nombre: string
    paterno?: string
    materno?: string
    email: string
    usuario: {
      nombre: string
      apellido: string
      email: string
    }
  }
  course: {
    id_curso: number
    nombre: string
    modalidad: string
    inicio?: Date
    fin?: Date
  }
  payments?: ModernPayment[]
  attendance?: ModernAttendance[]
}

export interface ModernPayment {
  id: number
  enrollment_id: number
  amount: number
  payment_date: Date
  payment_method: PaymentMethod
  status: PaymentStatus
  reference?: string
  notes?: string
}

export interface ModernAttendance {
  id: number
  enrollment_id: number
  class_date: Date
  status: AttendanceStatus
  notes?: string
  recorded_by: number
  recorded_at: Date
  teacher: {
    id_profesor: number
    nombre: string
    paterno?: string
    materno?: string
  }
}

export interface ModernClassSchedule {
  id: number
  course_id: number
  teacher_id: number
  level_id: number
  day_of_week: DayOfWeek
  start_time: string
  duration_minutes: number
  classroom?: string
  is_active: boolean
  course: {
    id_curso: number
    nombre: string
    modalidad: string
  }
  teacher: {
    id_profesor: number
    nombre: string
    paterno?: string
    materno?: string
    usuario: {
      nombre: string
      apellido: string
    }
  }
  level: {
    id_nivel: number
    nombre: string
  }
}

export interface EnrollmentStatusResponse {
  isLoggedIn: boolean
  isEnrolled: boolean
  enrollment?: ModernEnrollment | null
  userId?: string
}

export interface EnrollmentActionResponse {
  success: boolean
  message?: string
  error?: string
  enrollment?: ModernEnrollment
}

// Helpers para el frontend
export interface CourseEnrollmentInfo {
  totalEnrolled: number
  maxStudents: number
  isEnrollmentOpen: boolean
  enrolledStudentsList: Array<{
    name: string
    enrolledAt: Date
  }>
}

// Estados de UI para inscripciones
export interface EnrollmentUIState {
  isLoading: boolean
  isEnrolling: boolean
  isPurchasing: boolean
  enrollmentMessage: string
  enrollmentStatus: EnrollmentStatusResponse
}

// Tipos para reportes y estadísticas
export interface EnrollmentStats {
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  droppedEnrollments: number
  pendingPayments: number
  paidEnrollments: number
}

export interface StudentProgress {
  enrollmentId: number
  studentName: string
  courseName: string
  enrolledDate: Date
  attendancePercentage: number
  totalClasses: number
  attendedClasses: number
  paymentStatus: PaymentStatus
  enrollmentStatus: EnrollmentStatus
}

// Filtros para consultas
export interface EnrollmentFilters {
  status?: EnrollmentStatus[]
  paymentStatus?: PaymentStatus[]
  courseId?: number
  studentId?: number
  dateFrom?: Date
  dateTo?: Date
}

export interface PaymentFilters {
  status?: PaymentStatus[]
  method?: PaymentMethod[]
  amountFrom?: number
  amountTo?: number
  dateFrom?: Date
  dateTo?: Date
}