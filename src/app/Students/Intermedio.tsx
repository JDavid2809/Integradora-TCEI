"use client"
import React from 'react'
import Dashboard from './Dashboard'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CursoFromDB } from '@/types/courses'

type Props = {
  user: Session
  studentCourses?: CursoFromDB[]
  allCourses?: CursoFromDB[]
}

export default function Intermedio({ user, studentCourses, allCourses }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ 
      redirect: false,
      callbackUrl: '/' 
    })
    router.push('/')
  }

  return (
    <Dashboard 
      onLogout={handleLogout} 
      user={user} 
      studentCourses={studentCourses || []}
      allCourses={allCourses || []}
    />
  )
}
