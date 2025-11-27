"use client"
import React from 'react'
import Dashboard from './Dashboard'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Props = {
  user: Session
}

export default function Intermedio({ user }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ 
      redirect: false,
      callbackUrl: '/' 
    })
    router.push('/')
  }

  return (
    <Dashboard user={user} onLogout={handleLogout} />
  )
}
