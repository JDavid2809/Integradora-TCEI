"use client"
import React from 'react'
import { CheckCircle, AlertTriangle, Info } from 'lucide-react'
import clsx from 'clsx'

interface FeedbackAlertProps {
  type?: 'success' | 'error' | 'info'
  children: React.ReactNode
  className?: string
}

export const FeedbackAlert: React.FC<FeedbackAlertProps> = ({ type = 'info', children, className }) => {
  const base = 'px-4 py-3 rounded flex items-center gap-2 text-sm'
  const variants: Record<string, string> = {
    success: 'bg-green-100 border border-green-400 text-green-700',
    error: 'bg-red-100 border border-red-400 text-red-700',
    info: 'bg-blue-50 border border-blue-200 text-blue-700'
  }
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertTriangle : Info
  return (
    <div className={clsx(base, variants[type], className)}>
      <Icon className="w-5 h-5" />
      {children}
    </div>
  )
}
