const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const migrationFile = path.join(__dirname, '..', 'prisma', 'migrations', '20251123_migrate-study-guide-content-to-json', 'migration.sql')
    if (!fs.existsSync(migrationFile)) {
      console.error('Migration file not found:', migrationFile)
      process.exit(1)
    }
    const sql = fs.readFileSync(migrationFile, 'utf8')

    console.log('This script will run the following SQL migration against the configured DB:')
    console.log('---')
    console.log(sql.substring(0, 1000))
    console.log('---')

    // Basic safety checks
    const confirm = process.argv.includes('--force')
    if (!confirm) {
      console.log('Run this script with --force to execute the migration against the database (development only).')
      process.exit(0)
    }

    console.log('Executing migration...')
    // Split SQL into individual statements while preserving DO $$ blocks
    const statements = []
    let current = ''
    let inDollar = false
    let inSingleQuote = false
    let inDoubleQuote = false
    let inSingleLineComment = false
    let inMultiLineComment = false
    for (let i = 0; i < sql.length; i++) {
      const ch = sql[i]
      const next2 = sql.substr(i, 2)
      // Toggle inDollar when encountering $$
      if (!inSingleLineComment && !inMultiLineComment && !inSingleQuote && !inDoubleQuote && next2 === '$$') {
        current += '$$'
        inDollar = !inDollar
        i += 1 // skip the extra $
        continue
      }
      // Handle comments and quoted strings to avoid splitting on semicolons inside them
      const next2raw = sql.substr(i, 2)
      if (!inSingleQuote && !inDoubleQuote && !inDollar && !inMultiLineComment && next2raw === '--') {
        inSingleLineComment = true
        current += '--'
        i += 1
        continue
      }
      if (!inSingleQuote && !inDoubleQuote && !inDollar && !inSingleLineComment && next2raw === '/*') {
        inMultiLineComment = true
        current += '/*'
        i += 1
        continue
      }
      if (inSingleLineComment && ch === '\n') {
        inSingleLineComment = false
      }
      if (inMultiLineComment && i + 1 < sql.length && sql.substr(i, 2) === '*/') {
        inMultiLineComment = false
        current += '*/'
        i += 1
        continue
      }
      if (!inSingleLineComment && !inMultiLineComment && ch === "'" && !inDoubleQuote && !inDollar) {
        inSingleQuote = !inSingleQuote
      }
      if (!inSingleLineComment && !inMultiLineComment && ch === '"' && !inSingleQuote && !inDollar) {
        inDoubleQuote = !inDoubleQuote
      }
      if (!inDollar && !inSingleLineComment && !inMultiLineComment && !inSingleQuote && !inDoubleQuote && ch === ';') {
        const stmt = current.trim()
        if (stmt.length) statements.push(stmt + ';')
        current = ''
        continue
      }
      current += ch
    }
    // push the last statement if any
    const last = current.trim()
    if (last.length) statements.push(last)

    // Execute statements sequentially
    for (const [idx, stmt] of statements.entries()) {
      const short = stmt.replace(/\s+/g, ' ').trim().slice(0, 200)
      console.log(`Executing statement ${idx + 1}/${statements.length}: ${short}${short.length >= 200 ? ' ...' : ''}`)
      await prisma.$executeRawUnsafe(stmt)
    }
    console.log('Migration executed successfully.')
  } catch (e) {
    console.error('Migration execution failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
