"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useAuthRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (session?.user) {
      const redirectPath = getRedirectPathByRole(session.user.rol)
      const currentPath = window.location.pathname

      // Si no está en la ruta correcta para su rol, redirigir
      if (!currentPath.startsWith(redirectPath)) {
        console.log('Redirecting authenticated user to correct dashboard:', redirectPath)
        router.replace(redirectPath)
      }
    }
  }, [session, status, router])

  return { session, status }
}

function getRedirectPathByRole(role: string | undefined): string {
  switch (role) {
    case 'PROFESOR':
      return '/Teachers'
    case 'ESTUDIANTE':
      return '/Students'
    case 'ADMIN':
      return '/Admin'
    default:
      return '/Login'
  }
}
