import { generateStudyGuide } from './studyGuideAction'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { generateGeminiResponse } from './geminiAction'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    estudiante: { findUnique: jest.fn() },
    inscripcion: { findMany: jest.fn() },
    historial_academico: { findMany: jest.fn() },
    study_guide: { create: jest.fn() },
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('./geminiAction', () => ({
  generateGeminiResponse: jest.fn(),
}))

jest.mock('@/lib/authOptions', () => ({
  authOptions: {},
}))

describe('generateStudyGuide - extra scenarios', () => {
  const mockSession = {
    user: { id: '123', email: 'student@test.com' }
  }

  beforeEach(() => jest.clearAllMocks())

  it('should fallback to JSON course_content when modules are absent', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession)
    const mockStudent = { id_estudiante: 2, id_usuario: 123, nombre: 'Ana', paterno: 'Lopez' }
    const mockInscripciones = [
      {
        status: 'ACTIVE',
        course: {
          id_curso: 202,
          nombre: 'Inglés Avanzado',
          nivel_ingles: 'C1',
          modules: [],
          course_content: JSON.stringify([{ title: 'Unidad 1', topics: [{ title: 'Tema A'}, {title: 'Tema B'}] }])
        },
        submissions: [],
      }
    ]

    ;(prisma.estudiante.findUnique as jest.Mock).mockResolvedValue(mockStudent)
    ;(prisma.inscripcion.findMany as jest.Mock).mockResolvedValue(mockInscripciones)
    ;(prisma.historial_academico.findMany as jest.Mock).mockResolvedValue([])
    ;(generateGeminiResponse as jest.Mock).mockResolvedValue({ reply: 'OK' })
    ;(prisma.study_guide.create as jest.Mock).mockResolvedValue({ id: 3, title: 'Topic X', content: { sections: [ { id: 'main', title: 'Topic X', type: 'content', content: { blocks: [ { type: 'paragraph', text: 'OK' } ] } } ] }, student_id: 2 })

    const res = await generateStudyGuide('Verb Tenses')

    expect(generateGeminiResponse).toHaveBeenCalled()
    const args = (generateGeminiResponse as jest.Mock).mock.calls[0]
    expect(args[0]).toMatch(/Inglés Avanzado/)
    expect(args[0]).toMatch(/Unidad 1/)
    expect(res).toEqual(expect.objectContaining({ success: true }))
  })

  it('should generate even if student has no active courses', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession)
    const mockStudent = { id_estudiante: 4, id_usuario: 123, nombre: 'Paco' }
    ;(prisma.estudiante.findUnique as jest.Mock).mockResolvedValue(mockStudent)
    ;(prisma.inscripcion.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.historial_academico.findMany as jest.Mock).mockResolvedValue([])
    ;(generateGeminiResponse as jest.Mock).mockResolvedValue({ reply: 'Content' })
    ;(prisma.study_guide.create as jest.Mock).mockResolvedValue({ id: 4, title: 'Topic Y', content: { sections: [ { id: 'main', title: 'Topic Y', type: 'content', content: { blocks: [ { type: 'paragraph', text: 'Content' } ] } } ] }, student_id: 4 })

    const res = await generateStudyGuide('Phrasal verbs')
    expect(generateGeminiResponse).toHaveBeenCalled()
    expect(res).toEqual(expect.objectContaining({ success: true }))
  })

  it('should return error and log when AI returns nothing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession)
    const mockStudent = { id_estudiante: 5, id_usuario: 123, nombre: 'Carmen' }
    ;(prisma.estudiante.findUnique as jest.Mock).mockResolvedValue(mockStudent)
    ;(prisma.inscripcion.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.historial_academico.findMany as jest.Mock).mockResolvedValue([])
    ;(generateGeminiResponse as jest.Mock).mockResolvedValue({ reply: null })

    const res = await generateStudyGuide('Conditionals')
    expect(res).toEqual({ error: 'Error al generar la guía con IA' })
  })
})
