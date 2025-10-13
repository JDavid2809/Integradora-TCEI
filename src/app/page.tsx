
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/authOptions'
import { Benefits } from './views/Home/benefist'
import { Testimonials } from './views/testimonials'
import { Hero } from './views/Home/Hero'
import { SplashScreen } from '@/components/Splash'

export default async function Home() {
  // Verificar si hay una sesión activa
  const session = await getServerSession(authOptions)
  
  if (session?.user) {
    // Si hay sesión, redirigir al dashboard correspondiente
    console.log('🏠 Authenticated user accessing home, redirecting to dashboard:', session.user.rol)
    
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
      <Benefits/>
      <Testimonials/>
    </div>
  )
}
