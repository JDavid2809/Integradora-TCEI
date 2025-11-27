import { generateStudyGuide } from '@/app/Students/studyGuideAction'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { generateGeminiResponse } from '@/app/Students/geminiAction'

// Mocks
jest.mock('@/lib/prisma', () => ({
  prisma: {
    estudiante: { findUnique: jest.fn() },
    inscripcion: { findMany: jest.fn() },
    historial_academico: { findMany: jest.fn() },
    study_guide: { create: jest.fn() },
    usuario: { findUnique: jest.fn() },
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/app/Students/geminiAction', () => ({
  generateGeminiResponse: jest.fn(),
}))

jest.mock('@/lib/authOptions', () => ({
  authOptions: {},
}))

describe('generateStudyGuide', () => {
  const mockSession = {
    user: {
      id: '123',
      email: 'student@test.com',
    },
  }

  const mockStudent = {
    id_estudiante: 1,
    id_usuario: 123,
    nombre: 'Juan',
    paterno: 'Perez',
  }

  const mockInscripciones = [
    {
      status: 'ACTIVE',
      course: {
        id_curso: 101,
        nombre: 'Inglés Básico',
        nivel_ingles: 'A1',
        modules: [
          {
            title: 'Introducción',
            is_active: true,
            lessons: [
              { title: 'Saludos', is_active: true },
              { title: 'Verbo To Be', is_active: true },
            ],
          },
        ],
        course_content: null,
      },
      submissions: [],
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate a study guide successfully', async () => {
    // Setup mocks
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.estudiante.findUnique as jest.Mock).mockResolvedValue(mockStudent)
    ;(prisma.inscripcion.findMany as jest.Mock).mockResolvedValue(mockInscripciones)
    ;(prisma.historial_academico.findMany as jest.Mock).mockResolvedValue([])
    ;(generateGeminiResponse as jest.Mock).mockResolvedValue({
      reply: '# Guía de Estudio\n\nContenido generado...',
    })
    ;(prisma.study_guide.create as jest.Mock).mockResolvedValue({
      id: 1,
      title: 'Present Simple',
      content: { sections: [ { id: 'main', title: 'Present Simple', type: 'content', content: { blocks: [ { type: 'paragraph', text: 'Contenido generado...' } ] } } ] },
      student_id: 1,
    })

    // Execute
    const result = await generateStudyGuide('Present Simple')

    // Assertions
    expect(getServerSession).toHaveBeenCalled()
    expect(prisma.estudiante.findUnique).toHaveBeenCalledWith({ where: { id_usuario: 123 } })
    
    // Verify prompt construction (indirectly via generateGeminiResponse call)
    expect(generateGeminiResponse).toHaveBeenCalledWith(
      expect.stringContaining('Perfil del Estudiante'),
      expect.any(String)
    )
    expect(generateGeminiResponse).toHaveBeenCalledWith(
      expect.stringContaining('Inglés Básico'), // Should include course name
      expect.any(String)
    )

    expect(prisma.study_guide.create).toHaveBeenCalledWith({
      data: {
        title: 'Present Simple',
        content: expect.any(Object),
        student_id: 1,
      },
    })

    expect(result).toEqual({
      success: true,
      guide: expect.any(Object),
    })
  })

  it('should return error if user is not authorized', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null)

    const result = await generateStudyGuide('Topic')

    expect(result).toEqual({ error: 'No autorizado' })
    expect(prisma.estudiante.findUnique).not.toHaveBeenCalled()
  })

  it('should return error if student is not found', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.estudiante.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await generateStudyGuide('Topic')

    expect(result).toEqual({ error: 'Estudiante no encontrado' })
  })

  it('should fallback to usuario.findUnique by email when estudiante not found by id', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession)
    // findUnique by id fails
    ;(prisma.estudiante.findUnique as jest.Mock).mockResolvedValue(null)
    // fallback returns user with estudiante relation
    ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue({ id: 123, email: 'student@test.com', estudiante: mockStudent })
    ;(prisma.inscripcion.findMany as jest.Mock).mockResolvedValue(mockInscripciones)
    ;(prisma.historial_academico.findMany as jest.Mock).mockResolvedValue([])
    ;(generateGeminiResponse as jest.Mock).mockResolvedValue({ reply: '# Guía' })
    ;(prisma.study_guide.create as jest.Mock).mockResolvedValue({ id: 2, title: 'Topic X', content: { sections: [ { id: 'main', title: 'Topic X', type: 'content', content: { blocks: [ { type: 'paragraph', text: '# Guía' } ] } } ] }, student_id: 1 })

    const result = await generateStudyGuide('Topic')
    expect(result).toEqual({ success: true, guide: expect.any(Object) })
  })

  it('should return error if AI generation fails', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.estudiante.findUnique as jest.Mock).mockResolvedValue(mockStudent)
    ;(generateGeminiResponse as jest.Mock).mockResolvedValue({
      reply: null,
    })

    const result = await generateStudyGuide('Topic')

    expect(result).toEqual({ error: 'Error al generar la guía con IA' })
  })

  it('should handle AI throwing an error gracefully', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.estudiante.findUnique as jest.Mock).mockResolvedValue(mockStudent)
    ;(prisma.inscripcion.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.historial_academico.findMany as jest.Mock).mockResolvedValue([])
    ;(generateGeminiResponse as jest.Mock).mockRejectedValue(new Error('AI service failure'))

    const result = await generateStudyGuide('Topic')
    expect(result).toEqual({ error: 'Error al generar la guía con IA' })
  })

  it('should return a DB internal error when Inscripcion query fails', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.estudiante.findUnique as jest.Mock).mockResolvedValue(mockStudent)
    ;(prisma.inscripcion.findMany as jest.Mock).mockRejectedValue(new Error('DB down'))
    ;(generateGeminiResponse as jest.Mock).mockResolvedValue({ reply: 'OK' })

    const result = await generateStudyGuide('Topic')
    expect(result).toEqual({ error: 'Error interno al consultar datos del estudiante' })
  })
})
