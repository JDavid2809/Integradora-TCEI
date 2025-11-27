import { PrismaClient } from '@prisma/client'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const prisma = new PrismaClient()

async function main() {
  const argv = yargs(hideBin(process.argv)).option('email', {
    type: 'string',
    demandOption: true,
    description: 'Correo del usuario a buscar',
  }).argv as { email: string }

  try {
    const user = await prisma.usuario.findUnique({ where: { email: argv.email }, include: { estudiante: true } })
    console.log('Usuario encontrado:', user ? { id: user.id, email: user.email, rol: user.rol } : null)
    console.log('Estudiante asociado:', user?.estudiante ?? null)
  } catch (e) {
    console.error('Error querying DB', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
