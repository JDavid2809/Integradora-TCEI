// Metadata central para consistencia visual y lógica en el panel admin

export const ROLES = {
  ADMIN: 'ADMIN',
  PROFESOR: 'PROFESOR', 
  ESTUDIANTE: 'ESTUDIANTE'
} as const

export type Role = keyof typeof ROLES

export const ROLE_METADATA: Record<Role, {
  label: string
  color: 'green' | 'red' | 'blue' | 'gray' | 'purple'
  description: string
}> = {
  ADMIN: {
    label: 'Administrador',
    color: 'red',
    description: 'Acceso completo al sistema'
  },
  PROFESOR: {
    label: 'Profesor',
    color: 'blue', 
    description: 'Gestión de cursos y estudiantes'
  },
  ESTUDIANTE: {
    label: 'Estudiante',
    color: 'green',
    description: 'Acceso a cursos y exámenes'
  }
}

export const MODALITIES = {
  PRESENCIAL: 'PRESENCIAL',
  ONLINE: 'ONLINE'
} as const

export type Modality = keyof typeof MODALITIES

export const MODALITY_METADATA: Record<Modality, {
  label: string
  color: 'green' | 'blue'
  icon: string
}> = {
  PRESENCIAL: {
    label: 'Presencial',
    color: 'green',
    icon: 'MapPin'
  },
  ONLINE: {
    label: 'Online', 
    color: 'blue',
    icon: 'Globe'
  }
}

export const STATUS_COLORS = {
  active: 'green',
  inactive: 'red',
  pending: 'yellow',
  draft: 'gray'
} as const

// Utilidades para formateo consistente
export function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(num)
}

export function formatDate(dateString: string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return 'No definida'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    ...options
  })
}

export function truncateText(text: string, length: number = 50): string {
  return text.length > length ? `${text.substring(0, length)}...` : text
}

// Configuración de paginación por defecto
export const PAGINATION_CONFIG = {
  defaultLimit: 10,
  limitOptions: [5, 10, 25, 50, 100]
}

// Configuración de debounce
export const DEBOUNCE_CONFIG = {
  search: 400,
  filter: 300,
  form: 500
}