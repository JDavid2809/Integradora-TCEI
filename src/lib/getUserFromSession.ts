import { prisma } from './prisma'

export async function getUserFromSession(session: any) {
  if (!session?.user) return null

  // Try by email
  const email = session.user.email as string | undefined
  if (email) {
    const found = await prisma.usuario.findUnique({ where: { email } })
    if (found) return found
  }

  // Try by id
  const id = session.user.id as string | number | undefined
  if (id) {
    const idNumber = Number(id)
    if (!Number.isNaN(idNumber)) {
      const found = await prisma.usuario.findUnique({ where: { id: idNumber } })
      if (found) return found
    }
  }

  return null
}
