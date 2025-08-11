"use client"

import { ReactNode } from "react"
import { useRoleProtection } from "@/hooks/useRoleProtection"
import Loader from "@/components/Loader"

type UserRole = 'PROFESOR' | 'ESTUDIANTE' | 'ADMIN'

interface RoleProtectedProps {
  children: ReactNode
  allowedRoles: UserRole[]
  fallback?: ReactNode
}

export default function RoleProtected({ 
  children, 
  allowedRoles, 
  fallback 
}: RoleProtectedProps) {
  const { isAuthorized, isLoading } = useRoleProtection({ allowedRoles })

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!isAuthorized) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
