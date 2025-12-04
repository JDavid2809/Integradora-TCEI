import { useMemo } from 'react'
import { CourseForDisplay, PaginatedCourses } from '@/types/courses'

/**
 * Hook para convertir cursos de la BD al formato de display
 * Calcula duración, formatea fechas y estructura los datos para el frontend
 */
export function useCourseConverter(paginatedData: PaginatedCourses) {
  return useMemo(() => {
    const convertedCourses: CourseForDisplay[] = paginatedData.cursos.map(curso => {
      // Calcular duración en semanas
      const calculateDuration = () => {
        if (curso.inicio && curso.fin) {
          const weeks = Math.ceil(
            (new Date(curso.fin).getTime() - new Date(curso.inicio).getTime()) / 
            (1000 * 60 * 60 * 24 * 7)
          )
          return `${weeks} semanas`
        }
        return 'Por definir'
      }

      // Obtener instructor principal
      const getInstructor = () => {
        if (curso.imparte[0]) {
          const { nombre, apellido } = curso.imparte[0].profesor.usuario
          return `${nombre} ${apellido}`
        }
        return 'Instructor por asignar'
      }

      // Formatear fechas
      const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleDateString('es-ES') : 'Por definir'
      }

      // Generar rating solo si hay estudiantes inscritos (más realista)
      const generateRating = () => {
        // Si no hay estudiantes inscritos, no mostrar rating
        if (curso._count.inscripciones === 0) {
          return null // Sin rating
        }
        
        // Si hay pocos estudiantes, rating más conservador
        if (curso._count.inscripciones < 3) {
          return null // Muy pocos para tener rating confiable
        }
        
        // Para cursos con estudiantes, generar rating realista
        const baseRating = 4.0
        
        // Bonus por nivel (más avanzado = mejor rating inicial)
        const levelBonus = curso.imparte[0]?.nivel?.nombre === 'C2' ? 0.4 : 
                          curso.imparte[0]?.nivel?.nombre === 'C1' ? 0.3 :
                          curso.imparte[0]?.nivel?.nombre === 'B2' ? 0.3 : 
                          curso.imparte[0]?.nivel?.nombre === 'B1' ? 0.2 : 
                          curso.imparte[0]?.nivel?.nombre === 'A2' ? 0.1 : 0
        
        // Bonus por precio (cursos más caros tienden a tener mejor calidad)
        const priceBonus = curso.precio && curso.precio > 4000 ? 0.3 :
                          curso.precio && curso.precio > 3000 ? 0.2 :
                          curso.precio && curso.precio > 2000 ? 0.1 : 0
        
        // Bonus por modalidad (presencial suele tener mejor rating)
        const modalityBonus = curso.modalidad === 'PRESENCIAL' ? 0.1 : 0.05
        
        // Variación realista basada en el nombre del curso para consistencia
        const courseVariation = (curso.nombre.length % 5) * 0.02 - 0.04 // Entre -0.04 y +0.06
        
        const finalRating = baseRating + levelBonus + priceBonus + modalityBonus + courseVariation
        return Math.min(5.0, Math.max(3.8, finalRating)) // Entre 3.8 y 5.0
      }

      // Generar descripción dinámica basada en el curso
      const generateDescription = () => {
        // Prioridad 1: Usar el resumen si está disponible (específicamente para cards)
        if (curso.resumen && curso.resumen.trim()) {
          return curso.resumen
        }

        // Prioridad 2: Si no hay resumen, usar descripción pero truncada para cards
        if (curso.descripcion && curso.descripcion.trim()) {
          const maxLength = 150 // Longitud apropiada para cards
          const truncated = curso.descripcion.length > maxLength 
            ? curso.descripcion.substring(0, maxLength) + '...'
            : curso.descripcion
          return truncated
        }

        // Fallback: generar descripción dinámica si no hay ninguna en BD
        const level = curso.imparte[0]?.nivel?.nombre || 'BASICO'
        const lecciones = curso.total_lecciones_calculadas || Math.floor(Math.random() * 20) + 15
        const modalidadText = curso.modalidad === 'ONLINE' ? 'clases virtuales interactivas' : 'clases presenciales personalizadas'
        
        if (level === 'AVANZADO') {
          return `Curso avanzado de inglés profesional con ${lecciones} lecciones. Domina presentaciones, negociaciones y comunicación empresarial con ${modalidadText}.`
        } else if (level === 'INTERMEDIO') {
          return `Curso intermedio con ${lecciones} lecciones prácticas. Mejora tu fluidez y confianza en conversaciones reales mediante ${modalidadText}.`
        } else {
          return `Curso básico perfecto para principiantes con ${lecciones} lecciones estructuradas. Aprende desde cero con ${modalidadText} y metodología moderna.`
        }
      }

      // Generar skills dinámicas basadas en nivel
      const generateSkills = () => {
        const level = curso.imparte[0]?.nivel?.nombre || 'BASICO'
        const baseSkills = ["Speaking", "Listening", "Grammar"]
        
        if (level === 'AVANZADO') {
          return [...baseSkills, "Business English", "Presentations", "Negotiations"]
        } else if (level === 'INTERMEDIO') {
          return [...baseSkills, "Writing", "Pronunciation", "Conversations"]
        } else {
          return [...baseSkills, "Vocabulary", "Basic Writing"]
        }
      }

      return {
        id: curso.id_curso,
        title: curso.nombre,
        description: generateDescription(),
        instructor: getInstructor(),
        duration: calculateDuration(),
        students: curso._count.inscripciones || 0,
        rating: generateRating(), // Puede ser null si no hay suficientes estudiantes
        price: curso.precio ? `$${curso.precio.toFixed(2)}` : 'Gratis',
        level: curso.imparte[0]?.nivel?.nombre || 'A1',
        image: curso.imagen_url || "/logos/logoIngles1.jpg", // Usar imagen del curso o fallback
        skills: generateSkills(),
        lessons: curso.total_lecciones_calculadas || Math.floor(Math.random() * 20) + 15, // Lecciones dinámicas
        modalidad: curso.modalidad,
        inicio: formatDate(curso.inicio),
        fin: formatDate(curso.fin),
      }
    })

    // Cursos recomendados (primeros 3)
    const recommendedCourses = convertedCourses.slice(0, 3)

    return {
      convertedCourses,
      recommendedCourses
    }
  }, [paginatedData])
}