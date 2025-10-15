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
          { certificado: null }
        ]
      },
      data: {
        duracion_horas: 40,
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
        certificado: true
      },
      take: 5
    })

    console.log('\n📋 Cursos actualizados (muestra):')
    courses.forEach(course => {
      console.log(`- ${course.nombre}: ${course.duracion_horas}h, certificado: ${course.certificado ? 'Sí' : 'No'}`)
    })

  } catch (error) {
    console.error('❌ Error actualizando datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCourseData()