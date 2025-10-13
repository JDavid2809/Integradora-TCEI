import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateCourseData() {
  try {
    console.log('🔄 Actualizando datos de cursos existentes...')
    
    // Actualizar todos los cursos que no tienen valores para los nuevos campos
    const result = await prisma.curso.updateMany({
      where: {
        OR: [
          { duracion_horas: null },
          { total_lecciones: null },
          { total_ejercicios: null },
          { acceso_movil: null },
          { acceso_tv: null },
          { recursos_descargables: null },
          { certificado: null }
        ]
      },
      data: {
        duracion_horas: 40,
        total_lecciones: 45,
        total_ejercicios: 200,
        acceso_movil: true,
        acceso_tv: true,
        recursos_descargables: true,
        certificado: true
      }
    })

    console.log(`✅ Actualizados ${result.count} cursos con datos por defecto`)
    
    // Mostrar algunos cursos actualizados
    const courses = await prisma.curso.findMany({
      select: {
        id_curso: true,
        nombre: true,
        duracion_horas: true,
        total_lecciones: true,
        total_ejercicios: true
      },
      take: 5
    })

    console.log('\n📋 Cursos actualizados (muestra):')
    courses.forEach(course => {
      console.log(`- ${course.nombre}: ${course.duracion_horas}h, ${course.total_lecciones} lecciones, ${course.total_ejercicios} ejercicios`)
    })

  } catch (error) {
    console.error('❌ Error actualizando datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCourseData()