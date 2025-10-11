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
