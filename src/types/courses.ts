// Tipos para los cursos obtenidos de la base de datos
export interface CursoFromDB {
  id_curso: number
  nombre: string
  modalidad: 'PRESENCIAL' | 'ONLINE'
  inicio: Date | null
  fin: Date | null
  b_activo: boolean | null
  imparte: {
    profesor: {
      usuario: {
        nombre: string
        apellido: string
      }
    }
    nivel: {
      nombre: string
    }
  }[]
  _count: {
    inscripciones: number
  }
}

// Tipo para curso detallado con información completa
export interface DetailedCursoFromDB {
  id_curso: number
  nombre: string
  modalidad: 'PRESENCIAL' | 'ONLINE'
  inicio: Date | null
  fin: Date | null
  b_activo: boolean | null
  imparte: {
    profesor: {
      usuario: {
        nombre: string
        apellido: string
        email: string
      }
    }
    nivel: {
      nombre: string
    }
  }[]
  inscripciones?: {
    student: {
      usuario: {
        nombre: string
        apellido: string
      }
    }
  }[]
  _count: {
    inscripciones: number
  }
}

// Tipo para mostrar curso detallado en el frontend
export interface DetailedCourseForDisplay {
  id: number
  title: string
  description: string
  instructor: {
    name: string
    email: string
  }
  level: string
  modalidad: 'PRESENCIAL' | 'ONLINE'
  duration: string
  startDate: string
  endDate: string
  enrolledStudents: number
  maxStudents: number
  price: string
  originalPrice?: string
  image: string
  features: string[]
  curriculum: {
    module: string
    topics: string[]
  }[]
  enrolledStudentsList: {
    name: string
  }[]
  isEnrollmentOpen: boolean
  status: 'upcoming' | 'active' | 'completed'
}

// Tipo para el resultado paginado de cursos
export interface PaginatedCourses {
  cursos: CursoFromDB[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// Tipo para los parámetros de búsqueda y filtros
export interface CourseSearchParams {
  search?: string
  level?: string
  modalidad?: string
  page?: number
  limit?: number
}

// Tipo para el curso convertido para el frontend
export interface CourseForDisplay {
  id: number
  title: string
  description: string
  instructor: string
  duration: string
  students: number
  rating: number
  price: string
  level: string
  image: string
  skills: string[]
  lessons: number
  modalidad: 'PRESENCIAL' | 'ONLINE'
  inicio: string
  fin: string
}

// Tipo para los props del componente Courses
export interface CoursesProps {
  paginatedData: PaginatedCourses
}

// Tipo para los niveles de inglés
export interface EnglishLevel {
  value: string
  label: string
}

// Tipo para los filtros de búsqueda
export interface CourseFilters {
  search: string
  level: string
  modalidad: string
  page: number
}