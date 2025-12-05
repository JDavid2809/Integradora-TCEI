'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign } from 'lucide-react'

interface TopCoursesProps {
  courses: Array<{
    name: string
    enrollments: number
    revenue: number
  }>
}

export default function TopCourses({ courses }: TopCoursesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top 5 Cursos</h3>
      </div>
      
      <div className="space-y-4">
        {courses.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay datos disponibles</p>
        ) : (
          courses.map((course, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold">
                    {index + 1}
                  </span>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{course.name}</h4>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.enrollments} estudiantes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>${course.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}
