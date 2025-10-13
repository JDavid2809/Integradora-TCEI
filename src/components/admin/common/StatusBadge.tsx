"use client"
import React from 'react'
import clsx from 'clsx'

interface StatusBadgeProps {
  children: React.ReactNode
  color?: 'green' | 'red' | 'blue' | 'gray' | 'purple'
  solid?: boolean
  className?: string
}

const colorMap: Record<string, string> = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
  purple: 'bg-purple-100 text-purple-800'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ children, color = 'gray', solid, className }) => {
  return (
    <span className={clsx('inline-flex px-2 py-1 text-xs font-semibold rounded-full',
      solid && 'text-white',
      solid && color === 'green' && 'bg-green-600',
      solid && color === 'red' && 'bg-red-600',
      solid && color === 'blue' && 'bg-blue-600',
      solid && color === 'gray' && 'bg-gray-600',
      solid && color === 'purple' && 'bg-purple-600',
      !solid && colorMap[color],
      className
    )}>
      {children}
    </span>
  )
}
