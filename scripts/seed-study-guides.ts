import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const email = 'estudiante@test.com'
    const user = await prisma.usuario.findUnique({ where: { email }, include: { estudiante: true } })
    if (!user || !user.estudiante) {
      console.error(`No se encontró usuario/estudiante con email ${email}`)
      process.exit(1)
    }
    const studentId = user.estudiante.id_estudiante
    const guides = [
      {
        title: 'Guía: Present Simple - Básico',
        content: '# Present Simple\n\nExplicación breve del present simple.'
      },
      {
        title: 'Guía: Vocabulario - Viajes',
        content: '# Vocabulario de viajes\n\nPalabras clave y ejercicios.'
      },
      {
        title: 'Guía: Phrasal Verbs - Introducción',
        content: '# Phrasal Verbs\n\nTop Phrasal Verbs con ejemplos.'
      },
    ]

    for (const g of guides) {
      const created = await prisma.study_guide.create({
        data: { title: g.title, content: { sections: [ { id: 'main', title: g.title, type: 'content', content: { blocks: [ { type: 'paragraph', text: g.content } ] } } ] }, student_id: studentId },
      })
      console.log(`Created guide: ${created.title} (id=${created.id})`)
    }
    console.log('All guides created')
  } catch (e) {
    console.error('Error creating guides', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
