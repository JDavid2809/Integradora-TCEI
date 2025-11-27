import { saveStudyGuide } from './studyGuideAction'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { searchYouTube } from '@/lib/youtube'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    estudiante: { findUnique: jest.fn() },
    study_guide: { create: jest.fn() },
    usuario: { findUnique: jest.fn() },
  },
}))

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/youtube', () => ({ searchYouTube: jest.fn() }))

describe('saveStudyGuide', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should save and append videos when search returns results', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '123', email: 'student@test.com' } })
    ;(prisma.estudiante.findUnique as jest.Mock).mockResolvedValue({ id_estudiante: 1, id_usuario: 123 })
    ;(searchYouTube as jest.Mock).mockResolvedValue([
      { id: '123', title: 'Sample', channelTitle: 'Chan', url: 'https://youtu.be/123' }
    ])
    ;(prisma.study_guide.create as jest.Mock).mockResolvedValue({ id: 33, title: 'T', content: { sections: [ { id: 'main', title: 'T', type: 'content', content: { blocks: [ { type: 'paragraph', text: '# T' } ] } } ] }, student_id: 1 })

    const res: any = await saveStudyGuide('T', '# T')
    expect(searchYouTube).toHaveBeenCalledWith('T learn English tutorial', 3)
    expect(prisma.study_guide.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'T',
        content: expect.objectContaining({ sections: expect.any(Array) }),
        student_id: 1,
      }),
    })
    expect(res.success).toBe(true)
  })

  it('should save without videos if search returns empty', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '123', email: 'student@test.com' } })
    ;(prisma.estudiante.findUnique as jest.Mock).mockResolvedValue({ id_estudiante: 1, id_usuario: 123 })
    ;(searchYouTube as jest.Mock).mockResolvedValue([])
    ;(prisma.study_guide.create as jest.Mock).mockResolvedValue({ id: 44, title: 'T', content: { sections: [ { id: 'main', title: 'T', type: 'content', content: { blocks: [ { type: 'paragraph', text: '# T' } ] } } ] }, student_id: 1 })

    const res: any = await saveStudyGuide('T', '# T')
    expect(searchYouTube).toHaveBeenCalledWith('T learn English tutorial', 3)
    expect(prisma.study_guide.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'T',
        content: expect.any(Object),
        student_id: 1,
      }),
    })
    expect(res.success).toBe(true)
  })
})

export {}
