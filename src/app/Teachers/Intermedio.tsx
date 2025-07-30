"use client"
import React from 'react'
import Dashboard from './Dashboard'
import { Session } from 'next-auth'

type Props = {
  user: Session

}

export default function Intermedio({ user}: Props) {
  return (
    <Dashboard  user={user} />
  )
}
