"use client"

import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import CourseManagement from "@/components/teacher/CourseManagement"

export default function CoursesContent() {
    const { data: session } = useSession()
    const [teacherId, setTeacherId] = useState<number | null>(null)

    useEffect(() => {
        // Obtener el ID del profesor desde la sesión
        if (session?.user?.rol === 'PROFESOR' && session?.user?.extra?.id_profesor) {
            setTeacherId(session.user.extra.id_profesor)
        }
    }, [session])

    if (!teacherId) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center h-64"
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00246a] mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando información del profesor...</p>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <CourseManagement teacherId={teacherId} />
        </motion.div>
    )
}
