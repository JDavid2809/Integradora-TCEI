const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    console.log('Checking study_guide content column type...')
    const cols = await prisma.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'study_guide';")
    console.log('Columns:')
    console.table(cols)

    console.log('\nSelecting sample rows from study_guide (10)')
    const guides = await prisma.study_guide.findMany({ take: 10 })
    for (const g of guides) {
      const type = g.content === null ? 'null' : typeof g.content
      const hasBlocks = g.content && g.content.blocks ? true : false
      console.log(`id=${g.id} type=${type} hasBlocks=${hasBlocks} content_preview=${JSON.stringify(g.content && g.content.blocks ? g.content.blocks.slice(0,1) : g.content).slice(0,200)}`)
    }
  } catch (e) {
    console.error('Failed to query DB', e)
  } finally {
    process.exit(0)
  }
}

main()
