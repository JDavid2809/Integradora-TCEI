"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

type UserRole = 'PROFESOR' | 'ESTUDIANTE' | 'ADMIN'

interface UseRoleProtectionProps {
  allowedRoles: UserRole[]
  redirectTo?: string
}

export function useRoleProtection({ allowedRoles, redirectTo }: UseRoleProtectionProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Aún cargando

    // Si no hay sesión, redirigir al login
    if (status === "unauthenticated") {
      router.push("/Login")
      return
    }

    // Si hay sesión pero el rol no está permitido
    if (session?.user?.rol && !allowedRoles.includes(session.user.rol as UserRole)) {
      // Redirigir según el rol del usuario
      const userRole = session.user.rol as UserRole
      
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        switch (userRole) {
          case 'PROFESOR':
            router.push('/Teachers')
            break
          case 'ESTUDIANTE':
            router.push('/Students')
            break
          case 'ADMIN':
            router.push('/Admin')
            break
          default:
            router.push('/Login')
        }
      }
    }
  }, [session, status, allowedRoles, redirectTo, router])

  return {
    session,
    status,
    isAuthorized: session?.user?.rol && allowedRoles.includes(session.user.rol as UserRole),
    isLoading: status === "loading"
  }
}
