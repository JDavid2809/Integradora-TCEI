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

      return {
        id: curso.id_curso,
        title: curso.nombre,
        description: `Curso de inglés modalidad ${curso.modalidad.toLowerCase()}. Mejora tus habilidades con instructores expertos.`,
        instructor: getInstructor(),
        duration: calculateDuration(),
        students: curso._count.inscripciones || 0,
        rating: 4.7, // Rating estático para evitar problemas de hidratación
        price: '$199', // Precio por defecto
        level: curso.imparte[0]?.nivel?.nombre || 'A1',
        image: "/logos/logoIngles1.jpg",
        skills: ["Speaking", "Listening", "Grammar"], // Skills por defecto
        lessons: 24, // Lecciones por defecto
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