
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/authOptions'
import { Benefist } from './views/Home/benefist'
import { Testimonials } from './views/testimonials'
import { Hero } from './views/Home/Hero'
import { SplashScreen } from '@/components/Splash'
import { Footer } from '@/components/Footer'

// Marcar como ruta dinámica
export const dynamic = 'force-dynamic'

export default async function Home() {
  // Verificar si hay una sesión activa
  let session = null
  
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.error('Error getting session:', error)
    // Si hay error al obtener la sesión, continuar sin sesión
  }
  
  if (session?.user) {
    // Si hay sesión, redirigir al dashboard correspondiente
    console.log('Authenticated user accessing home, redirecting to dashboard:', session.user.rol)
    
    switch (session.user.rol) {
      case 'PROFESOR':
        redirect('/Teachers')
        break
      case 'ESTUDIANTE':
        redirect('/Students')
        break
      case 'ADMIN':
        redirect('/Admin')
        break
      default:
        // Si el rol no es reconocido, mantener en home
        break
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <SplashScreen />
      <Hero />
      <Benefist/>
      <Testimonials/>
      <Footer/>
    </div>
  )
}
