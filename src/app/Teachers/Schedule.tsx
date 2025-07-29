"use client"

import { motion } from "framer-motion"
import { Calendar } from "lucide-react"

export default function ScheduleContent() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
                <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#00246a] mb-2">Calendario de Clases</h3>
                <p className="text-slate-600">
                    Esta sección mostraría un calendario interactivo con todas tus clases programadas.
                </p>
            </div>
        </motion.div>
    )
}
