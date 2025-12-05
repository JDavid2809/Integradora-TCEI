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
    bgLight: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  green: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800'
  },
  orange: {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-50 dark:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800'
  },
  purple: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-50 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800'
  },
  red: {
    bg: 'bg-red-500',
    bgLight: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800'
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
      className={`bg-white dark:bg-slate-900 rounded-xl shadow-md border ${colors.border} p-6 hover:shadow-lg transition-shadow duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">vs mes anterior</span>
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
