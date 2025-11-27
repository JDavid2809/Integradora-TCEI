import { saveStudyGuide } from '@/app/Students/studyGuideAction'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    usuario: { findUnique: jest.fn() },
    study_guide: { create: jest.fn() },
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

describe('saveStudyGuide', () => {
  const mockSession = { user: { id: '123', email: 'student@test.com' } }

  beforeEach(() => jest.clearAllMocks())

  it('should save a guide and return the saved object', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.usuario.findUnique as jest.Mock).mockResolvedValue({ id: 123, email: 'student@test.com', estudiante: { id_estudiante: 1 } })
    ;(prisma.study_guide.create as jest.Mock).mockResolvedValue({ id: 11, title: 'Sample', content: {} })

    const res = await saveStudyGuide({ title: 'Sample', content: {} })
    expect(res).toEqual({ success: true, guide: expect.any(Object) })
  })

  it('should return error if user not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null)
    const res = await saveStudyGuide({ title: 'Sample', content: {} })
    expect(res).toEqual({ error: 'No autorizado' })
  })
})
