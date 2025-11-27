/**
 * Script para probar la generación de certificados
 * 
 * Uso:
 * npx tsx scripts/test-certificate.ts
 */

import { PrismaClient } from '@prisma/client'
import { generateCertificate } from '../src/actions/certificates'
import { updateEnrollmentStatus } from '../src/actions/enrollment'

const prisma = new PrismaClient()

async function testCertificateGeneration() {
  try {
    console.log('Iniciando prueba de certificados...\n')

    // 1. Buscar una inscripción activa
    const inscripcion = await prisma.inscripcion.findFirst({
      where: {
        status: 'ACTIVE',
        course: {
          certificado: true  // Solo cursos que dan certificado
        }
      },
      include: {
        student: {
          include: {
            usuario: true
          }
        },
        course: true
      }
    })

    if (!inscripcion) {
      console.log('No se encontró ninguna inscripción activa en un curso con certificado')
      console.log('Sugerencia: Crea una inscripción o habilita certificados en un curso')
      
      // Mostrar cursos disponibles
      const cursos = await prisma.curso.findMany({
        where: { b_activo: true },
        select: {
          id_curso: true,
          nombre: true,
          certificado: true
        },
        take: 5
      })
      
      console.log('\nCursos disponibles:')
      cursos.forEach(c => {
        console.log(`  - ID: ${c.id_curso} | ${c.nombre} | Certificado: ${c.certificado ? 'Yes' : 'No'}`)
      })
      
      return
    }

    console.log('Inscripción encontrada:')
    console.log(`  ID: ${inscripcion.id}`)
    console.log(`  Estudiante: ${inscripcion.student.usuario.nombre}`)
    console.log(`  Curso: ${inscripcion.course.nombre}`)
    console.log(`  Status actual: ${inscripcion.status}\n`)

    // 2. Completar el curso (esto generará el certificado automáticamente)
    console.log('Completando curso y generando certificado...\n')
    
    const result = await updateEnrollmentStatus(inscripcion.id, 'COMPLETED')

    if (result.success) {
      console.log('¡Curso completado exitosamente!')
      
      if (result.certificate) {
        console.log('\n🎖️ CERTIFICADO GENERADO:')
        console.log(`  Token: ${result.certificate.token}`)
        console.log(`  Código: ${result.certificate.codigo}`)
        console.log(`  URL: ${result.certificate.url}`)
        console.log('\n🌐 Puedes verlo en:')
        console.log(`  http://localhost:3000/certificate/${result.certificate.token}`)
      } else {
        console.log('ℹ️ Curso completado pero no genera certificado')
      }
    } else {
      console.log(`Error: ${result.error}`)
    }

  } catch (error) {
    console.error('Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
testCertificateGeneration()
