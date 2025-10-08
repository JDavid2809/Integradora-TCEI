
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';




const prisma = new PrismaClient();


async function main(){
    try {
          const hashedPassword = await bcrypt.hash("12345", 10);

    // Usar upsert para evitar errores de duplicados
    const nuevoProfesor = await prisma.usuario.upsert({
      where: { email: "mario@gmail.com" },
      update: {},
      create: {
        nombre: `Mario`,
        email: "mario@gmail.com",
        apellido: "Perez Gomez",
        password: hashedPassword,
        rol: "PROFESOR",
        profesor: {
          create: {
            nombre: `Mario `,
            paterno: 'perez',
            materno: 'gomez',
            curp: 'PEJA010101HDFRRS09',
            rfc: 'PEJA010101',
            direccion: 'Calle Falsa 123',
            telefono: '5551234567',
            nivel_estudios: 'Licenciatura',
            observaciones: 'Profesor de inglés',
            b_activo: true,
            edad: 30,
          },
        },
      },
      include: {
        profesor: true,
      },
    });

    const nuevoEstudiante = await prisma.usuario.upsert({
      where: { email: "estudiante@test.com" },
      update: {},
      create: {
        nombre: `Estudiante Test`,
        email: "estudiante@test.com",
        password: hashedPassword,
        apellido: "Perez Gomez",
        rol: "ESTUDIANTE",
        estudiante: {
          create: {
            nombre: `Juan Test`,
            paterno: 'Perez',
            materno: 'Gomez',
            edad: 18,
            email: "estudiante@test.com",
            telefono: "2341698756",
            b_activo: true,
          },
        },
      },
      include: {
        estudiante: true,
      },
    });

    const nuevoAdmin = await prisma.usuario.upsert({
      where: { email: "admin@admin.com" },
      update: {},
      create: {
        nombre: `Admin`,
        email: "admin@admin.com",
        password: hashedPassword,
        apellido: "Sistema",
        rol: "ADMIN",
      },
    });

    // Crear niveles
    const nivel1 = await prisma.nivel.upsert({
      where: { nombre: "A1" },
      update: {},
      create: {
        nombre: "A1",
        b_activo: true,
      },
    });

    const nivel2 = await prisma.nivel.upsert({
      where: { nombre: "A2" },
      update: {},
      create: {
        nombre: "A2",
        b_activo: true,
      },
    });

    const nivel3 = await prisma.nivel.upsert({
      where: { nombre: "B1" },
      update: {},
      create: {
        nombre: "B1",
        b_activo: true,
      },
    });

    // Crear cursos de ejemplo
    const curso1 = await prisma.curso.create({
      data: {
        nombre: "English Conversation Mastery",
        modalidad: "PRESENCIAL",
        inicio: new Date('2024-01-15'),
        fin: new Date('2024-04-15'),
        b_activo: true,
      },
    });

    const curso2 = await prisma.curso.create({
      data: {
        nombre: "Business English Professional",
        modalidad: "ONLINE",
        inicio: new Date('2024-02-01'),
        fin: new Date('2024-05-01'),
        b_activo: true,
      },
    });

    const curso3 = await prisma.curso.create({
      data: {
        nombre: "English Foundations",
        modalidad: "PRESENCIAL",
        inicio: new Date('2024-03-01'),
        fin: new Date('2024-07-01'),
        b_activo: true,
      },
    });

    // Crear relaciones imparte (profesor enseña curso en un nivel)
    await prisma.imparte.create({
      data: {
        id_profesor: nuevoProfesor.profesor!.id_profesor,
        id_nivel: nivel1.id_nivel,
        id_curso: curso1.id_curso,
        dias: "LUN,MIE,VIE",
        hora_inicio: 900, // 9:00 AM
        duracion_min: 90,
        tipo: "PRESENCIAL",
      },
    });

    await prisma.imparte.create({
      data: {
        id_profesor: nuevoProfesor.profesor!.id_profesor,
        id_nivel: nivel2.id_nivel,
        id_curso: curso2.id_curso,
        dias: "MAR,JUE",
        hora_inicio: 1400, // 2:00 PM
        duracion_min: 120,
        tipo: "ONLINE",
      },
    });

    await prisma.imparte.create({
      data: {
        id_profesor: nuevoProfesor.profesor!.id_profesor,
        id_nivel: nivel3.id_nivel,
        id_curso: curso3.id_curso,
        dias: "LUN,MAR,MIE",
        hora_inicio: 1000, // 10:00 AM
        duracion_min: 60,
        tipo: "PRESENCIAL",
      },
    });

    // Inscribir al estudiante en algunos cursos
    if (nuevoEstudiante.estudiante) {
      await prisma.horario.create({
        data: {
          id_estudiante: nuevoEstudiante.estudiante.id_estudiante,
          id_curso: curso1.id_curso,
          comentario: "Inscripción inicial",
        },
      });

      await prisma.horario.create({
        data: {
          id_estudiante: nuevoEstudiante.estudiante.id_estudiante,
          id_curso: curso2.id_curso,
          comentario: "Inscripción inicial",
        },
      });
    }

    console.log('✅ Seed completed successfully');
    console.log('📧 Users created/updated:');
    console.log('  - Teacher: mario@gmail.com (password: 12345)');
    console.log('  - Student: estudiante@test.com (password: 12345)'); 
    console.log('  - Admin: admin@admin.com (password: 12345)');
    console.log('📚 Courses created:');
    console.log('  - English Conversation Mastery (A1)');
    console.log('  - Business English Professional (A2)');
    console.log('  - English Foundations (B1)');
    console.log('📝 Student enrolled in 2 courses');
    
    } catch (error) {
        console.error("Error during seeding:", error);
    }
}

main()
  .then( async ()=>{
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error in main function:", e);
    await prisma.$disconnect();
  })

  
  
