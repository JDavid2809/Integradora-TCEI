// Tipos para las vistas del estudiante relacionadas con actividades

export interface StudentCourseDetail {
  id: number
  nombre: string
  descripcion: string | null
  resumen: string | null
  modalidad: 'PRESENCIAL' | 'ONLINE'
  inicio: Date | null
  fin: Date | null
  inscripcionId: number // ID de la inscripción del estudiante
  instructor: {
    nombre: string
    apellido: string
  }
  nivel: string | null
  whatYouLearn?: string[]
  requirements?: string[]
  targetAudience?: string[]
  courseContent?: {
    title: string
    duration?: string
    topics: {
      title: string
      duration?: string
    }[]
  }[]
}

export interface StudentActivityWithSubmission {
  id: number
  title: string
  description: string | null
  instructions: string | null
  activity_type: 'ASSIGNMENT' | 'QUIZ' | 'PROJECT' | 'EXAM' | 'READING' | 'VIDEO' | 'PRACTICE' | 'DISCUSSION'
  due_date: Date | null
  total_points: number
  min_passing_score: number | null
  allow_late: boolean
  late_penalty: number | null
  max_attempts: number | null
  is_published: boolean
  created_at: Date
  attachments: ActivityAttachment[]
  submission?: StudentSubmission | null // Última entrega del estudiante
}

export interface ActivityAttachment {
  id: number
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_at: Date
}

export interface StudentSubmission {
  id: number
  submission_text: string | null
  submitted_at: Date
  is_late: boolean
  attempt_number: number
  status: 'SUBMITTED' | 'GRADED' | 'RETURNED' | 'DRAFT' | 'LATE' | 'MISSING'
  score: number | null
  feedback: string | null
  graded_at: Date | null
  files: SubmissionFile[]
}

export interface SubmissionFile {
  id: number
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_at: Date
}

export interface SubmitActivityInput {
  activityId: number
  courseId: number
  submissionText?: string
  files?: File[]
}

export interface SubmitActivityResult {
  success: boolean
  message: string
}
