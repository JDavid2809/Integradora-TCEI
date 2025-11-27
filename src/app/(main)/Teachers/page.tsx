
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Intermedio from './Intermedio'
import { authOptions } from '@/lib/authOptions'

export default async function page() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/Login")
  }

  // Verificación estricta de rol
  if (session.user?.rol !== 'PROFESOR') {
    // Redirigir según el rol actual
    switch (session.user?.rol) {
      case 'ESTUDIANTE':
        redirect("/Students")
        break
      case 'ADMIN':
        redirect("/Admin")
        break
      default:
        redirect("/Login")
    }
  }

  console.log('Teacher access granted:', session.user.email, 'Role:', session.user.rol)
 
  return (
    <Intermedio user={session} />
  )
}
