import React from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/authOptions'
import AuthInterface from './authInterface'

export default async function LoginPage() {
  // Verificar si el usuario ya está autenticado
  const session = await getServerSession(authOptions)
  
  if (session) {
    // Si ya está autenticado, redirigir según su rol
    console.log('User already authenticated:', session.user?.email, 'Role:', session.user?.rol)
    
    switch (session.user?.rol) {
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
        // Si el rol no es reconocido, cerrar sesión y permitir login
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <AuthInterface />
    </div>
  )
}
