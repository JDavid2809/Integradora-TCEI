'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import ChangePasswordModal from './ChangePasswordModal'

export default function PasswordChangeWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    // Verificar si el usuario necesita cambiar su contraseña
    if (session?.user?.debe_cambiar_password) {
      setShowPasswordModal(true)
    }
  }, [session])

  const handlePasswordChanged = async () => {
    // Actualizar la sesión para reflejar que ya no necesita cambiar contraseña
    await update({
      ...session,
      debe_cambiar_password: false
    })
    setShowPasswordModal(false)
  }

  return (
    <>
      {children}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onPasswordChanged={handlePasswordChanged}
      />
    </>
  )
}