import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Función para crear slug (copiada de slugUtils)
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  console.log('🚀 Poblando slugs para cursos existentes...')

  const cursos = await prisma.curso.findMany({
    where: {
      slug: null
    }
  })

  console.log(`📚 Encontrados ${cursos.length} cursos sin slug`)

  for (const curso of cursos) {
    const slug = createSlug(curso.nombre)
    
    try {
      await prisma.curso.update({
        where: { id_curso: curso.id_curso },
        data: { slug }
      })
      console.log(`✅ Slug generado para "${curso.nombre}": ${slug}`)
    } catch (error) {
      console.error(`❌ Error al generar slug para "${curso.nombre}":`, error)
    }
  }

  console.log('✨ ¡Proceso completado!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
