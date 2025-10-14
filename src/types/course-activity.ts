// Types para el sistema de actividades de cursos
// Alineado con Prisma Schema

export type ActivityType = 
  | 'ASSIGNMENT'
  | 'QUIZ'
  | 'PROJECT'
  | 'READING'
  | 'VIDEO'
  | 'PRACTICE'
  | 'DISCUSSION'
  | 'EXAM'

export type SubmissionStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'GRADED'
  | 'RETURNED'
  | 'LATE'
  | 'MISSING'

export interface ActivityAttachment {
  id: number
  activity_id: number
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_at: Date
}

export interface CourseActivity {
  id: number
  course_id: number
  title: string
  description: string | null
  instructions: string | null
  activity_type: ActivityType
  due_date: Date | null
  total_points: number
  min_passing_score: number | null
  allow_late: boolean
  late_penalty: number | null
  max_attempts: number | null
  is_published: boolean
  created_by: number
  created_at: Date
  updated_at: Date
}

export interface CourseActivityWithDetails extends CourseActivity {
  course: {
    nombre: string
    id_curso: number
  }
  attachments: ActivityAttachment[]
  _count?: {
    submissions: number
    attachments: number
  }
}

export interface SubmissionFile {
  id: number
  submission_id: number
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_at: Date
}

export interface ActivitySubmission {
  id: number
  activity_id: number
  student_id: number
  enrollment_id: number
  submission_text: string | null
  submitted_at: Date
  is_late: boolean
  attempt_number: number
  status: SubmissionStatus
  score: number | null
  feedback: string | null
  graded_by: number | null
  graded_at: Date | null
}

export interface ActivitySubmissionWithDetails extends ActivitySubmission {
  files: SubmissionFile[]
  student: {
    id_estudiante: number
    nombre: string
    email: string
    paterno: string | null
    materno: string | null
    usuario: {
      nombre: string
      apellido: string
      email: string
    }
  }
  activity: {
    title: string
    total_points: number
    activity_type: ActivityType
  }
  grader: {
    id_profesor: number
    nombre: string
    paterno: string | null
  } | null
}

// Tipos para formularios
export interface CreateActivityInput {
  course_id: number
  title: string
  description?: string | null
  instructions?: string | null
  activity_type: ActivityType
  due_date?: Date | null
  total_points?: number
  min_passing_score?: number | null
  allow_late?: boolean
  late_penalty?: number | null
  max_attempts?: number | null
  is_published?: boolean
  created_by: number
}

export interface UpdateActivityInput {
  title?: string
  description?: string | null
  instructions?: string | null
  activity_type?: ActivityType
  due_date?: Date | null
  total_points?: number
  min_passing_score?: number | null
  allow_late?: boolean
  late_penalty?: number | null
  max_attempts?: number | null
  is_published?: boolean
}

export interface CreateSubmissionInput {
  activity_id: number
  student_id: number
  enrollment_id: number
  submission_text?: string
  attempt_number?: number
}

export interface GradeSubmissionInput {
  score: number
  feedback?: string | null
  status?: SubmissionStatus
}

// Tipos para estadísticas
export interface ActivityStats {
  total_students: number
  submitted: number
  pending: number
  graded: number
  late: number
  missing: number
  average_score?: number
}

export interface StudentActivityProgress {
  activity_id: number
  activity_title: string
  activity_type: ActivityType
  due_date?: Date | null
  total_points: number
  status: SubmissionStatus
  submission_id?: number
  score?: number | null
  submitted_at?: Date
  is_late: boolean
  attempt_number: number
  max_attempts: number
}

// Configuración de tipos de actividad
export const ActivityTypeConfig = {
  ASSIGNMENT: {
    label: 'Tarea',
    icon: '',
    color: 'blue',
    description: 'Tarea individual o grupal'
  },
  QUIZ: {
    label: 'Cuestionario',
    icon: '',
    color: 'purple',
    description: 'Evaluación con preguntas'
  },
  PROJECT: {
    label: 'Proyecto',
    icon: '',
    color: 'green',
    description: 'Proyecto extenso'
  },
  READING: {
    label: 'Lectura',
    icon: '',
    color: 'orange',
    description: 'Material de lectura'
  },
  VIDEO: {
    label: 'Video',
    icon: '',
    color: 'red',
    description: 'Contenido en video'
  },
  PRACTICE: {
    label: 'Práctica',
    icon: '',
    color: 'yellow',
    description: 'Ejercicios prácticos'
  },
  DISCUSSION: {
    label: 'Discusión',
    icon: '',
    color: 'indigo',
    description: 'Foro de discusión'
  },
  EXAM: {
    label: 'Examen',
    icon: '',
    color: 'pink',
    description: 'Evaluación formal'
  }
} as const

// Configuración de estados de entrega
export const SubmissionStatusConfig = {
  DRAFT: {
    label: 'Borrador',
    icon: '',
    color: 'gray',
    description: 'No enviado'
  },
  SUBMITTED: {
    label: 'Enviado',
    icon: '',
    color: 'blue',
    description: 'Pendiente de calificación'
  },
  GRADED: {
    label: 'Calificado',
    icon: '',
    color: 'green',
    description: 'Calificado por el profesor'
  },
  RETURNED: {
    label: 'Devuelto',
    icon: '',
    color: 'yellow',
    description: 'Requiere corrección'
  },
  LATE: {
    label: 'Tardío',
    icon: '',
    color: 'orange',
    description: 'Entregado después de la fecha'
  },
  MISSING: {
    label: 'No entregado',
    icon: '',
    color: 'red',
    description: 'Sin entrega'
  }
} as const
