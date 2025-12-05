'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'framer-motion'

interface EnrollmentChartProps {
  data: Array<{ month: string; enrollments: number }>
}

export default function EnrollmentChart({ data }: EnrollmentChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white dark:bg-slate-900 rounded-xl shadow-md p-6"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Inscripciones Mensuales</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
          <XAxis 
            dataKey="month" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            formatter={(value: number) => [value, 'Inscripciones']}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              color: '#1f2937'
            }}
          />
          <Legend />
          <Bar 
            dataKey="enrollments" 
            fill="#3b82f6" 
            radius={[8, 8, 0, 0]}
            name="Inscripciones"
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
