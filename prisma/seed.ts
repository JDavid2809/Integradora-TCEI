
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';




const prisma = new PrismaClient();


async function main(){
    try {
        console.log('🗑️ Clearing database...');
        
        // Vaciar todas las tablas en el orden correcto (respetando las foreign keys)
        console.log('  - Clearing enrollments and related data...');
        await prisma.inscripcion.deleteMany({});
        await prisma.payment.deleteMany({});
        await prisma.attendance.deleteMany({});
        await prisma.class_schedule.deleteMany({});
        
        console.log('  - Clearing course related data...');
        await prisma.resultado_examen.deleteMany({});
        await prisma.respuesta.deleteMany({});
        await prisma.pregunta.deleteMany({});
        await prisma.examen.deleteMany({});
        await prisma.imparte.deleteMany({});
        await prisma.horario.deleteMany({});
        
        console.log('  - Clearing main entities...');
        await prisma.curso.deleteMany({});
        await prisma.nivel.deleteMany({});
        await prisma.categoria_edad.deleteMany({});
        
        console.log('  - Clearing users...');
        await prisma.profesor.deleteMany({});
        await prisma.estudiante.deleteMany({});
        await prisma.administrador.deleteMany({});
        await prisma.usuario.deleteMany({});
        
        console.log('✅ Database cleared successfully');
        console.log('');
        console.log('🌱 Starting fresh seed...');

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

    // Inscribir al estudiante en algunos cursos usando la nueva tabla Inscripcion
    if (nuevoEstudiante.estudiante) {
      await prisma.inscripcion.create({
        data: {
          student_id: nuevoEstudiante.estudiante.id_estudiante,
          course_id: curso1.id_curso,
          enrolled_at: new Date(),
          status: "ACTIVE",
          payment_status: "PAID",
          notes: "Inscripción inicial - Curso completamente pagado",
        },
      });

      await prisma.inscripcion.create({
        data: {
          student_id: nuevoEstudiante.estudiante.id_estudiante,
          course_id: curso2.id_curso,
          enrolled_at: new Date(),
          status: "ACTIVE", 
          payment_status: "PENDING",
          notes: "Inscripción inicial - Pago pendiente",
        },
      });

      await prisma.inscripcion.create({
        data: {
          student_id: nuevoEstudiante.estudiante.id_estudiante,
          course_id: curso3.id_curso,
          enrolled_at: new Date(),
          status: "SUSPENDED",
          payment_status: "OVERDUE",
          notes: "Suspendido por pago vencido",
        },
      });
    }

    console.log('');
    console.log('🎉 Fresh database seed completed successfully!');
    console.log('');
    console.log('� Users created:');
    console.log('  🧑‍🏫 Teacher: mario@gmail.com (password: 12345)');
    console.log('  🎓 Student: estudiante@test.com (password: 12345)'); 
    console.log('  👨‍💼 Admin: admin@admin.com (password: 12345)');
    console.log('');
    console.log('📚 Courses created:');
    console.log('  📖 English Conversation Mastery (A1) - Presencial');
    console.log('  💼 Business English Professional (A2) - Online');
    console.log('  🔤 English Foundations (B1) - Presencial');
    console.log('');
    console.log('📝 Student enrollments:');
    console.log('  ✅ Course 1: ACTIVE + PAID (Completamente inscrito)');
    console.log('  ⏳ Course 2: ACTIVE + PENDING (Inscrito, pago pendiente)');
    console.log('  ⚠️ Course 3: SUSPENDED + OVERDUE (Suspendido por pago vencido)');
    console.log('');
    console.log('🚀 Database is ready for testing!');
    
    } catch (error) {
        console.error("❌ Error during seeding:", error);
        console.error("💡 Make sure your database is running and accessible");
        process.exit(1);
    }
}

main()
  .then(async () => {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
    console.log('✅ Disconnected successfully');
  })
  .catch(async (e) => {
    console.error("❌ Error in main function:", e);
    await prisma.$disconnect();
    process.exit(1);
  })

  
  
