// ========================================
// TYPES FOR COURSE CREATION & MANAGEMENT
// ========================================

export interface WhatYouLearnItem {
  id: string
  text: string
}

export interface CourseFeature {
  id: string
  title: string
  description: string
  icon: string
}

export interface RequirementItem {
  id: string
  text: string
}

export interface TargetAudienceItem {
  id: string
  text: string
}

export interface CourseTopic {
  id: string
  title: string
  duration: string
  isPreview?: boolean
}

export interface CourseSection {
  id: string
  title: string
  lessons: number
  duration: string
  topics: CourseTopic[]
}

// ========================================
// FORM DATA INTERFACES
// ========================================

export interface CourseBasicInfo {
  nombre: string
  descripcion: string
  resumen: string
  modalidad: 'PRESENCIAL' | 'ONLINE'
  inicio: string
  fin: string
  precio?: number
  nivel_ingles?: string
  imagen_url?: string
  video_url?: string
}

export interface CourseDetails {
  whatYouLearn: WhatYouLearnItem[]
  features: CourseFeature[]
  requirements: RequirementItem[]
  targetAudience: TargetAudienceItem[]
  courseContent: CourseSection[]
}

export interface CourseCreationData {
  basicInfo: CourseBasicInfo
  details: CourseDetails
}

// ========================================
// DATABASE INTERFACES
// ========================================

export interface CourseFromDB {
  id_curso: number
  nombre: string
  descripcion: string | null
  resumen: string | null
  modalidad: 'PRESENCIAL' | 'ONLINE'
  inicio: Date | null
  fin: Date | null
  precio?: number | null
  nivel_ingles?: string | null
  imagen_url?: string | null
  video_url?: string | null
  b_activo: boolean | null
  what_you_learn: string | null
  features: string | null
  requirements: string | null
  target_audience: string | null
  course_content: string | null
  created_by: number | null
  created_at: Date | null
  updated_at: Date | null
  creator?: {
    id_profesor: number
    nombre: string
    paterno: string | null
    materno: string | null
    usuario: {
      nombre: string
      apellido: string
      email: string
    }
  } | null
  _count?: {
    inscripciones: number
    imparte: number
  }
}

export interface CourseWithDetails extends CourseFromDB {
  whatYouLearnParsed: WhatYouLearnItem[]
  featuresParsed: CourseFeature[]
  requirementsParsed: RequirementItem[]
  targetAudienceParsed: TargetAudienceItem[]
  courseContentParsed: CourseSection[]
  inscripciones?: EnrolledStudent[]
}

// ========================================
// ENROLLED STUDENTS
// ========================================

export interface EnrolledStudent {
  id: number
  student_id: number
  course_id: number
  enrolled_at: Date
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'SUSPENDED' | 'TRANSFERRED'
  payment_status: 'PENDING' | 'PAID' | 'OVERDUE' | 'REFUNDED' | 'CANCELLED'
  notes: string | null
  student: {
    id_estudiante: number
    nombre: string
    paterno: string | null
    materno: string | null
    email: string
    telefono: string | null
    edad: number
    descripcion: string | null
    usuario: {
      id: number
      nombre: string
      apellido: string
      email: string
    }
  }
  payments?: Array<{
    id: number
    amount: any  // Prisma Decimal
    payment_date: Date
    payment_method: string
    status: string
  }>
  attendance?: Array<{
    id: number
    class_date: Date
    status: string
    notes: string | null
  }>
}

// ========================================
// TEACHER COURSE MANAGEMENT
// ========================================

export interface TeacherCourseStats {
  totalCourses: number
  activeCourses: number
  totalStudents: number
  pendingApprovals: number
}

export interface TeacherCourseListItem {
  id_curso: number
  nombre: string
  descripcion: string | null
  modalidad: 'PRESENCIAL' | 'ONLINE'
  inicio: Date | null
  fin: Date | null
  b_activo: boolean | null
  created_at: Date | null
  studentCount: number
  status: 'draft' | 'active' | 'completed' | 'suspended'
}

// ========================================
// SERVER ACTIONS RETURN TYPES
// ========================================

export interface CourseActionResult {
  success: boolean
  message: string
  data?: CourseFromDB
  errors?: Record<string, string[]>
}

export interface CourseListResult {
  success: boolean
  courses: TeacherCourseListItem[]
  stats: TeacherCourseStats
  message?: string
}

// ========================================
// VALIDATION SCHEMAS (for forms)
// ========================================

export interface CourseValidationErrors {
  basicInfo?: {
    nombre?: string[]
    descripcion?: string[]
    resumen?: string[]
    modalidad?: string[]
    inicio?: string[]
    fin?: string[]
    nivel_ingles?: string[]
  }
  details?: {
    whatYouLearn?: string[]
    features?: string[]
    requirements?: string[]
    targetAudience?: string[]
    courseContent?: string[]
  }
}

// ========================================
// DATABASE TYPES
// ========================================

export interface CourseFromDBWithRelations {
  id_curso: number
  nombre: string
  descripcion: string | null
  resumen: string | null
  modalidad: 'PRESENCIAL' | 'ONLINE'
  inicio: Date | null
  fin: Date | null
  nivel_ingles?: string | null
  what_you_learn: string | null
  features: string | null
  requirements: string | null
  target_audience: string | null
  course_content: string | null
  created_by: number | null
  created_at: Date | null
  updated_at: Date | null
  b_activo: boolean | null
  creator?: {
    id_profesor: number
    usuario: {
      id: number
      nombre: string
      apellido: string
      email: string
    }
  } | null
  _count: {
    inscripciones: number
    imparte: number
  }
}
