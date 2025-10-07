import { z } from 'zod'

export const UserFormSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().optional(),
  nombre: z.string().min(1, 'Nombre es requerido'),
  apellido: z.string().min(1, 'Apellido es requerido'),
  rol: z.enum(['ADMIN', 'PROFESOR', 'ESTUDIANTE']),
  telefono: z.string().optional(),
  edad: z.number().int().min(1).max(120).optional(),
  id_categoria_edad: z.number().int().optional(), // Se calculará automáticamente
  nivel_estudios: z.string().optional(),
  observaciones: z.string().optional()
}).refine((data) => {
  // Si es estudiante, solo edad es requerida (categoría se calcula automáticamente)
  if (data.rol === 'ESTUDIANTE') {
    return data.edad
  }
  return true
}, {
  message: 'Edad es requerida para estudiantes',
  path: ['edad']
}).refine((data) => {
  // Si es profesor, nivel de estudios es requerido
  if (data.rol === 'PROFESOR') {
    return data.nivel_estudios && data.nivel_estudios.length > 0
  }
  return true
}, {
  message: 'Nivel de estudios es requerido para profesores',
  path: ['nivel_estudios']
})

export const CourseFormSchema = z.object({
  nombre: z.string().min(1, 'Nombre del curso es requerido'),
  modalidad: z.enum(['PRESENCIAL', 'ONLINE']),
  inicio: z.string().min(1, 'Fecha de inicio es requerida'),
  fin: z.string().min(1, 'Fecha de fin es requerida'),
  b_activo: z.boolean()
}).refine((data) => {
  const inicio = new Date(data.inicio)
  const fin = new Date(data.fin)
  return fin > inicio
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fin']
})

export type UserFormData = z.infer<typeof UserFormSchema>
export type CourseFormData = z.infer<typeof CourseFormSchema>