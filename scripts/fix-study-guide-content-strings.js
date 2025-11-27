const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    console.log('Fixing study_guide content entries: converting stringified JSON into objects and wrapping strings into blocks')

    const guides = await prisma.study_guide.findMany({ where: { }, take: 200 })
    let fixes = 0
    for (const g of guides) {
      const c = g.content
      if (c == null) continue
      if (typeof c === 'string') {
        // Attempt to parse string
        try {
          const parsed = JSON.parse(c)
          // If parse success and we got object/array, save as JSON
          if (parsed && (typeof parsed === 'object')) {
            await prisma.study_guide.update({ where: { id: g.id }, data: { content: parsed } })
            fixes++
            console.log(`converted id=${g.id} string->json`)
            continue
          }
        } catch (e) {
          // not JSON
        }
        // Not valid JSON, wrap as paragraph block
        const wrapped = { blocks: [{ type: 'paragraph', text: c }] }
        await prisma.study_guide.update({ where: { id: g.id }, data: { content: wrapped } })
        fixes++
        console.log(`wrapped id=${g.id} into blocks`)
        continue
      }

      if (typeof c === 'object') {
        // If content is object but top-level is a string (rare), check blocks
        if (Array.isArray(c) || c.blocks) continue
        // If it's an object but not with blocks, do nothing or wrap
        // Optionally, we can wrap into blocks if the object appears to be a stringified JSON.
      }
    }
    console.log(`Done. Changes applied: ${fixes}`)
  } catch (e) {
    console.error('Fix failed', e)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
}

main()
