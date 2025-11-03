'use client'

import { motion } from 'framer-motion'
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  UserCheck,
  AlertCircle,
  Award,
  LucideIcon
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  UserCheck,
  AlertCircle,
  Award
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: keyof typeof iconMap
  trend?: {
    value: number
    isPositive: boolean
  }
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  delay?: number
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200'
  },
  orange: {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200'
  },
  purple: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200'
  },
  red: {
    bg: 'bg-red-500',
    bgLight: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200'
  }
}

export default function MetricCard({ title, value, icon: iconName, trend, color, delay = 0 }: MetricCardProps) {
  const colors = colorClasses[color]
  const Icon = iconMap[iconName]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white rounded-xl shadow-md border ${colors.border} p-6 hover:shadow-lg transition-shadow duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">vs mes anterior</span>
            </div>
          )}
        </div>
        
        <div className={`${colors.bgLight} ${colors.text} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  )
}
