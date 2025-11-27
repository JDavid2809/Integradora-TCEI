import { generateStudyGuide } from '@/app/Students/studyGuideAction'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { generateGeminiResponse } from '@/app/Students/geminiAction'

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

describe('generateStudyGuide - extra scenarios', () => {
  const mockSession = {
    user: { id: '123', email: 'student@test.com' }
  }

  beforeEach(() => jest.clearAllMocks())

  it('should handle when there are no inscriptions gracefully', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.estudiante.findUnique as jest.Mock).mockResolvedValue({ id_estudiante: 1, id_usuario: 123 })
    ;(prisma.inscripcion.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.historial_academico.findMany as jest.Mock).mockResolvedValue([])
    ;(generateGeminiResponse as jest.Mock).mockResolvedValue({ reply: '# Guía' })
    ;(prisma.study_guide.create as jest.Mock).mockResolvedValue({ id: 3, title: 'Topic', content: { sections: [] }, student_id: 1 })

    const res = await generateStudyGuide('Verb Tenses')
    expect(res).toEqual({ success: true, guide: expect.any(Object) })
  })

  it('should create a guide with fallback minimal content when AI returns simple text', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.estudiante.findUnique as jest.Mock).mockResolvedValue({ id_estudiante: 1, id_usuario: 123 })
    ;(prisma.inscripcion.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.historial_academico.findMany as jest.Mock).mockResolvedValue([])
    ;(generateGeminiResponse as jest.Mock).mockResolvedValue({ reply: 'Simple reply string' })
    ;(prisma.study_guide.create as jest.Mock).mockResolvedValue({ id: 4, title: 'Topic2', content: { sections: [] }, student_id: 1 })

    const res = await generateStudyGuide('Phrasal verbs')
    expect(res).toEqual({ success: true, guide: expect.any(Object) })
  })

  it('should create a guide when AI responds with a content object', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.estudiante.findUnique as jest.Mock).mockResolvedValue({ id_estudiante: 1, id_usuario: 123 })
    ;(prisma.inscripcion.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.historial_academico.findMany as jest.Mock).mockResolvedValue([])
    ;(generateGeminiResponse as jest.Mock).mockResolvedValue({ reply: '{ "sections": [{ "id": "s1", "title": "Intro" }] }' })
    ;(prisma.study_guide.create as jest.Mock).mockResolvedValue({ id: 5, title: 'Topic3', content: { sections: [] }, student_id: 1 })

    const res = await generateStudyGuide('Conditionals')
    expect(res).toEqual({ success: true, guide: expect.any(Object) })
  })
})
