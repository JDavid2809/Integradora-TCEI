// ========================
// INTERFACES PARA ESTUDIANTES - SOLO LO QUE PUEDEN LEER/ACTUALIZAR
// ========================

// LEER: Su propio perfil únicamente
export interface StudentProfile {
  id_estudiante: number;
  nombre: string;
  paterno?: string;
  materno?: string;
  email: string;
  telefono?: string;
  edad: number;
  descripcion?: string;
  categoria_edad?: {
    rango: string;
  };
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
  };
  activo: boolean;
}

// LEER: Cursos en los que está inscrito únicamente
export interface StudentEnrolledCourse {
  id_horario: number;
  curso: {
    id_curso: number;
    nombre: string;
    modalidad: string;
    inicio?: Date;
    fin?: Date;
    activo: boolean;
  };
  profesores: Array<{
    id_profesor: number;
    nombre: string;
    email: string;
    nivel: string;
  }>;
  comentario?: string;
}

// LEER: Historial de pagos propio únicamente
export interface StudentOwnPayment {
  id_pago: number;
  monto: number;
  fecha: Date;
  tipo: string;
  curso: {
    nombre: string;
    modalidad: string;
    nivel: string;
    profesor: string;
  };
}

// LEER: Historial de asistencia propio únicamente
export interface StudentOwnAttendance {
  id_historial: number;
  fecha: Date;
  asistencia?: number;
  calificacion?: number;
  tipo?: string;
  tipo_evaluacion?: string;
  comentario?: string;
  tipo_capturo?: string;
  curso: {
    nombre: string;
    modalidad: string;
    nivel: string;
    profesor: string;
  };
}

// LEER: Resultados de sus exámenes únicamente
export interface StudentOwnExamResult {
  id_resultado: number;
  fecha: Date;
  calificacion?: number;
  aprobado: boolean;
  examen: {
    id_examen: number;
    nombre: string;
    nivel: string;
    activo: boolean;
  } | null;
}

export interface StudentExamAttempt {
  id_resultado: number;
  calificacion: number;
  aprobado: boolean;
  respuestas_correctas: number;
  total_preguntas: number;
  porcentaje: string;
  fecha: Date;
  examen: {
    nombre: string;
    nivel: string;
  } | null;
}

// Requests para estudiantes
export interface UpdateStudentProfileRequest {
  nombre: string;
  paterno?: string;
  materno?: string;
  telefono?: string;
  descripcion?: string;
}

export interface CreatePaymentRequest {
  id_imparte: number;
  monto: number;
  tipo: string;
}

export interface CreateExamAttemptRequest {
  id_examen: number;
  respuestas: Array<{
    id_pregunta: number;
    id_respuesta: number;
  }>;
  tiempo_empleado?: number;
}

// ========================
// INTERFACES PARA PROFESORES
// ========================

// LEER y ESCRIBIR: Perfil propio del profesor únicamente
export interface TeacherOwnProfile {
  id_profesor: number;
  nombre: string;
  paterno?: string;
  materno?: string;
  telefono?: string;
  edad?: number;
  observaciones?: string;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
  };
  activo: boolean;
}

// LEER: Cursos que enseña únicamente
export interface TeacherAssignedCourse {
  id_imparte: number;
  curso: {
    id_curso: number;
    nombre: string;
    modalidad: string;
    inicio?: Date;
    fin?: Date;
    activo: boolean;
  };
  nivel: {
    id_nivel: number;
    nombre: string;
  } | null;
  estudiantes: Array<{
    id_estudiante: number;
    nombre: string;
    paterno?: string;
    materno?: string;
    email: string;
    usuario: {
      nombre: string;
      apellido: string;
      email: string;
    };
  }>;
  total_estudiantes: number;
  dias?: string;
  hora_inicio?: number;
  duracion_min?: number;
  tipo?: string;
}

// LEER: Estudiantes en sus cursos únicamente
export interface TeacherCourseStudent {
  id_estudiante: number;
  nombre: string;
  paterno?: string;
  materno?: string;
  email: string;
  telefono?: string;
  edad: number;
  descripcion?: string;
  categoria_edad?: string;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
  };
  activo: boolean;
  curso: {
    id_curso: number;
    nombre: string;
    modalidad: string;
    inicio?: Date;
    fin?: Date;
  };
  nivel: string;
  comentario_inscripcion?: string;
  estadisticas?: {
    asistencia: {
      total_clases: number;
      clases_asistidas: number;
      porcentaje: number;
    };
    calificaciones: {
      total_evaluaciones: number;
      promedio: number;
    };
    examenes: {
      total_examenes: number;
      examenes_aprobados: number;
      porcentaje_aprobacion: string;
    };
  };
}

// LEER y ESCRIBIR: Asistencia de estudiantes en sus cursos únicamente
export interface TeacherManagedAttendance {
  id_historial: number;
  fecha: Date;
  asistencia?: number;
  calificacion?: number;
  tipo?: string;
  tipo_evaluacion?: string;
  comentario?: string;
  tipo_capturo?: string;
  estudiante: {
    id_estudiante: number;
    nombre: string;
    paterno?: string;
    materno?: string;
    usuario: {
      nombre: string;
      apellido: string;
      email: string;
    };
  };
  curso: {
    nombre: string;
    modalidad: string;
    nivel: string;
  };
}

// LEER: Exámenes de su nivel únicamente
export interface TeacherLevelExam {
  id_examen: number;
  nombre: string;
  nivel: string;
  activo: boolean;
  total_preguntas: number;
  total_intentos: number;
  preguntas: Array<{
    id_pregunta: number;
    descripcion: string;
    ruta_file_media?: string;
    respuestas: Array<{
      id_respuesta: number;
      descripcion: string;
      es_correcta: boolean;
    }>;
  }>;
  resultados_recientes: Array<{
    id_resultado: number;
    fecha: Date;
    calificacion: number;
    estudiante: {
      nombre: string;
      email: string;
    };
  }>;
}

// LEER y ESCRIBIR: Resultados de exámenes de sus estudiantes únicamente
export interface TeacherStudentExamResult {
  id_resultado: number;
  fecha: Date;
  calificacion?: number;
  aprobado: boolean;
  estudiante: {
    id_estudiante: number;
    nombre: string;
    paterno?: string;
    materno?: string;
    usuario: {
      nombre: string;
      apellido: string;
      email: string;
    };
  };
  examen: {
    id_examen: number;
    nombre: string;
    nivel: string;
    activo: boolean;
  } | null;
}

// Requests para profesores - solo acciones permitidas
export interface UpdateTeacherProfileRequest {
  nombre: string;
  paterno?: string;
  materno?: string;
  telefono?: string;
  observaciones?: string;
}

export interface TeacherCreateAttendanceRequest {
  id_estudiante: number;
  id_imparte: number;
  fecha: string;
  asistencia?: number;
  calificacion?: number;
  tipo?: string;
  tipo_evaluacion?: string;
  comentario?: string;
}

export interface TeacherUpdateAttendanceRequest {
  id_historial: number;
  asistencia?: number;
  calificacion?: number;
  tipo?: string;
  tipo_evaluacion?: string;
  comentario?: string;
}

export interface TeacherCreateExamResultRequest {
  id_estudiante: number;
  id_examen: number;
  calificacion?: number;
  aprobado: boolean;
}

// ========================
// INTERFACES COMUNES
// ========================

export interface ApiResponse<T> {
  message?: string;
  error?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  total: number;
  page?: number;
  limit?: number;
  data: T[];
}

export interface StatsResponse {
  total_registros: number;
  [key: string]: any;
}

// ========================
// ENUMS Y CONSTANTES
// ========================

export enum UserRole {
  ADMIN = 'ADMIN',
  PROFESOR = 'PROFESOR',
  ESTUDIANTE = 'ESTUDIANTE'
}

export enum PaymentType {
  Mensualidad = 'Mensualidad'
}

export enum CourseModality {
  PRESENCIAL = 'PRESENCIAL',
  ONLINE = 'ONLINE'
}

export enum AttendanceType {
  PARCIAL = 'PARCIAL',
  FINAL = 'FINAL'
}

export enum CaptureType {
  PROFESOR = 'PROFESOR',
  USER = 'USER'
}

export enum EvaluationType {
  ORD = 'ORD',
  RE = 'RE',
  EX = 'EX',
  EX2 = 'EX2'
}

export enum ClassType {
  PRESENCIAL = 'PRESENCIAL',
  ONLINE = 'ONLINE'
}
