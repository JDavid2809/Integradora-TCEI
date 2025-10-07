import { useState, useCallback } from 'react'

interface ConfirmationConfig {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

interface ConfirmationState extends ConfirmationConfig {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function useConfirmation() {
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null)

  const confirm = useCallback((config: ConfirmationConfig): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmation({
        ...config,
        isOpen: true,
        confirmText: config.confirmText || 'Confirmar',
        cancelText: config.cancelText || 'Cancelar',
        type: config.type || 'info',
        onConfirm: () => {
          setConfirmation(null)
          resolve(true)
        },
        onCancel: () => {
          setConfirmation(null)
          resolve(false)
        }
      })
    })
  }, [])

  const closeConfirmation = useCallback(() => {
    setConfirmation(null)
  }, [])

  return {
    confirmation,
    confirm,
    closeConfirmation
  }
}