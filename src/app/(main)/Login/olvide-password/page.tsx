
import { sendResetPassword } from '@/actions/auth/Auth-actions'
import ForgotPassword from '@/components/ui/Olvide-password'
import React from 'react'

export default function Page() {
  return <ForgotPassword sendResetPassword={sendResetPassword} />
}
