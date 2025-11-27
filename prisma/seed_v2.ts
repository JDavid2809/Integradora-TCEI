import { PrismaClient, ActivityType, QuestionType, Rol, Modalidad, EnrollmentStatus, PaymentStatus, PaymentMethod, AttendanceStatus, DayOfWeek } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Limpiar base de datos
  console.log('🗑️ Cleaning database...');
  try {
    // Borrar en orden inverso a las dependencias
    await prisma.activityOption.deleteMany();
    await prisma.activityQuestion.deleteMany();
    await prisma.activity_submission.deleteMany();
    await prisma.course_activity.deleteMany();
    await prisma.courseLesson.deleteMany();
    await prisma.courseModule.deleteMany();
    
    await prisma.certificado.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.inscripcion.deleteMany();
    
    await prisma.horario_detalle.deleteMany();
    await prisma.horario.deleteMany();
    await prisma.imparte.deleteMany();
    // Chat system cleanup
    await prisma.chat_message_read.deleteMany();
    await prisma.chat_message.deleteMany();
    await prisma.chat_participant.deleteMany();
    await prisma.chat_room.deleteMany();
    
    await prisma.curso.deleteMany();
    await prisma.nivel.deleteMany();
    
    await prisma.profesor.deleteMany();
    await prisma.estudiante.deleteMany();
    await prisma.administrador.deleteMany();
    await prisma.usuario.deleteMany();
    
    console.log('✅ Database cleared successfully');
  } catch (e) {
    console.log('⚠️ Some tables might be empty or not exist yet, continuing...', e);
  }

  // 2. Crear Usuarios
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('12345', 10);

  // Admin
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      password: hashedPassword,
      nombre: 'Admin',
      apellido: 'System',
      rol: 'ADMIN',
      verificado: true,
      administrador: {
        create: {
          image: '/avatars/admin.png',
          b_activo: true
        }
      }
    },
    include: { administrador: true }
  });

  // Profesor
  const teacherUser = await prisma.usuario.upsert({
    where: { email: 'teacher@english.com' },
    update: {},
    create: {
      email: 'teacher@english.com',
      password: hashedPassword,
      nombre: 'Sarah',
      apellido: 'Connor',
      rol: 'PROFESOR',
      verificado: true,
      profesor: {
        create: {
          nombre: 'Sarah',
          paterno: 'Connor',
          materno: 'Smith',
          rfc: 'SARAH123456',
          direccion: '123 English St',
          nivel_estudios: 'PhD Linguistics',
          b_activo: true,
          observaciones: 'Expert in Business English'
        }
      }
    },
    include: { profesor: true }
  });

  // Estudiante
  const studentUser = await prisma.usuario.upsert({
    where: { email: 'student@demo.com' },
    update: {},
    create: {
      email: 'student@demo.com',
      password: hashedPassword,
      nombre: 'John',
      apellido: 'Doe',
      rol: 'ESTUDIANTE',
      verificado: true,
      estudiante: {
        create: {
          nombre: 'John',
          paterno: 'Doe',
          materno: 'Smith',
          edad: 25,
          b_activo: true,
          telefono: '555-0123',
          email: 'student@demo.com'
        }
      }
    },
    include: { estudiante: true }
  });

  // Crear otros usuarios de prueba para compatibilidad con scripts antiguos
  await prisma.usuario.upsert({
    where: { email: 'estudiante@test.com' },
    update: {},
    create: {
      nombre: 'Estudiante',
      apellido: 'Prueba',
      email: 'estudiante@test.com',
      password: hashedPassword,
      rol: 'ESTUDIANTE',
      verificado: true,
      estudiante: {
        create: {
          nombre: 'Estudiante',
          paterno: 'Prueba',
          materno: '',
          edad: 20,
          telefono: '555000111',
          email: 'estudiante@test.com',
          b_activo: true
        }
      }
    }
  });

  await prisma.usuario.upsert({
    where: { email: 'mario@gmail.com' },
    update: {},
    create: {
      nombre: 'Mario',
      apellido: 'Gonzalez',
      email: 'mario@gmail.com',
      password: hashedPassword,
      rol: 'PROFESOR',
      verificado: true,
      profesor: {
        create: {
          nombre: 'Mario',
          paterno: 'Gonzalez',
          materno: '',
          telefono: '555999888',
          nivel_estudios: 'Licenciado',
          b_activo: true
        }
      }
    }
  });

  // 3. Crear Niveles
  console.log('📊 Creating levels...');
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const levelRecords = [];
  for (const level of levels) {
    const l = await prisma.nivel.create({
      data: { nombre: level, b_activo: true }
    });
    levelRecords.push(l);
  }

  // 4. Crear Cursos
  console.log('📚 Creating courses...');

  // Curso 1: Beginner English (A1)
  const courseA1 = await prisma.curso.create({
    data: {
      nombre: 'English for Beginners: The Complete Foundation',
      descripcion: 'Start your English journey here. Learn the basics of grammar, vocabulary, and conversation in a fun and engaging way.',
      resumen: 'Master the basics of English: Greetings, Numbers, and Simple Present.',
      modalidad: 'ONLINE',
      inicio: new Date(),
      fin: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      precio: 49.99,
      nivel_ingles: 'A1',
      b_activo: true,
      created_by: teacherUser.profesor!.id_profesor,
      what_you_learn: JSON.stringify([
        { id: '1', text: 'Introduce yourself and others confidently' },
        { id: '2', text: 'Understand and use basic numbers and dates' },
        { id: '3', text: 'Form simple sentences in Present Simple' }
      ]),
      features: JSON.stringify([
        { id: '1', title: 'Certificate', description: 'Get certified upon completion', icon: 'certificate' },
        { id: '2', title: '24/7 Access', description: 'Learn at your own pace', icon: 'clock' }
      ]),
      requirements: JSON.stringify([
        { id: '1', text: 'No prior knowledge required' },
        { id: '2', text: 'A desire to learn' }
      ]),
      target_audience: JSON.stringify([
        { id: '1', text: 'Absolute beginners' },
        { id: '2', text: 'Travelers' }
      ]),
      // Syllabus JSON para compatibilidad con frontend existente
      course_content: JSON.stringify([
        {
          id: 'm1',
          title: 'Module 1: Welcome & Greetings',
          lessons: 2,
          duration: '1h 30m',
          topics: [
            { id: 'l1', title: 'Hello! How are you?', duration: '45m', isPreview: true },
            { id: 'l2', title: 'The Alphabet & Numbers', duration: '45m', isPreview: false }
          ]
        },
        {
          id: 'm2',
          title: 'Module 2: My World',
          lessons: 2,
          duration: '2h',
          topics: [
            { id: 'l3', title: 'Family & Friends', duration: '1h', isPreview: false },
            { id: 'l4', title: 'Colors & Clothes', duration: '1h', isPreview: false }
          ]
        }
      ])
    }
  });

  // 5. Crear Módulos y Lecciones (Estructura Relacional)
  console.log('📦 Creating modules and lessons...');

  // --- Module 1: Welcome & Greetings ---
  const module1 = await prisma.courseModule.create({
    data: {
      course_id: courseA1.id_curso,
      title: 'Module 1: Welcome & Greetings',
      description: 'Learn how to introduce yourself and greet people in different situations.',
      order: 1
    }
  });

  // Lesson 1.1
  const lesson1 = await prisma.courseLesson.create({
    data: {
      module_id: module1.id,
      title: 'Hello! How are you?',
      content: `
        <div class="lesson-content">
          <h3>Introduction</h3>
          <p>In this lesson, you will learn how to greet people formally and informally.</p>
          
          <div class="vocabulary-section">
            <h4>Key Vocabulary</h4>
            <ul>
              <li><strong>Hello</strong> - Formal greeting</li>
              <li><strong>Hi</strong> - Informal greeting</li>
              <li><strong>Good morning</strong> - Used before 12 PM</li>
            </ul>
          </div>

          <div class="dialogue-section">
            <h4>Dialogue</h4>
            <p><strong>A:</strong> Hello, my name is Sarah. What is your name?</p>
            <p><strong>B:</strong> Hi Sarah! I'm John. Nice to meet you.</p>
          </div>
        </div>
      `,
      video_url: 'https://www.youtube.com/watch?v=FwRdEx53b8', // Placeholder
      duration: 45,
      order: 1,
      is_preview: true
    }
  });

  // Lesson 1.2
  const lesson2 = await prisma.courseLesson.create({
    data: {
      module_id: module1.id,
      title: 'The Alphabet & Numbers',
      content: `
        <div class="lesson-content">
          <h3>The English Alphabet</h3>
          <p>There are 26 letters in the English alphabet.</p>
          <h4>Numbers 1-10</h4>
          <p>One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten.</p>
        </div>
      `,
      duration: 45,
      order: 2
    }
  });

  // --- Module 2: My World ---
  const module2 = await prisma.courseModule.create({
    data: {
      course_id: courseA1.id_curso,
      title: 'Module 2: My World',
      description: 'Talking about things around you.',
      order: 2
    }
  });

  const lesson3 = await prisma.courseLesson.create({
    data: {
      module_id: module2.id,
      title: 'Family & Friends',
      content: '<p>Learn vocabulary for family members: Mother, Father, Sister, Brother.</p>',
      duration: 60,
      order: 1
    }
  });

  // 6. Crear Actividades y Preguntas
  console.log('📝 Creating activities...');

  // Activity 1: Quiz for Lesson 1
  const quiz1 = await prisma.course_activity.create({
    data: {
      course_id: courseA1.id_curso,
      lesson_id: lesson1.id,
      title: 'Quiz: Greetings',
      description: 'Test your knowledge of basic greetings.',
      activity_type: 'QUIZ',
      total_points: 10,
      is_published: true,
      created_by: teacherUser.profesor!.id_profesor,
      questions: {
        create: [
          {
            text: 'Which greeting is appropriate for the morning?',
            points: 5,
            type: 'MULTIPLE_CHOICE',
            options: {
              create: [
                { text: 'Good night', is_correct: false },
                { text: 'Good morning', is_correct: true, explanation: 'Used before noon.' },
                { text: 'Good evening', is_correct: false }
              ]
            }
          },
          {
            text: '"Hi" is a formal greeting.',
            points: 5,
            type: 'TRUE_FALSE',
            options: {
              create: [
                { text: 'True', is_correct: false },
                { text: 'False', is_correct: true, explanation: '"Hi" is informal.' }
              ]
            }
          }
        ]
      }
    }
  });

  // Activity 2: Reading Practice for Lesson 2
  const reading1 = await prisma.course_activity.create({
    data: {
      course_id: courseA1.id_curso,
      lesson_id: lesson2.id,
      title: 'Reading: The Phone Number',
      description: 'Read the dialogue and answer questions.',
      instructions: 'Read carefully and identify the numbers mentioned.',
      activity_type: 'READING',
      total_points: 10,
      is_published: true,
      created_by: teacherUser.profesor!.id_profesor,
      questions: {
        create: [
          {
            text: 'What is the phone number mentioned?',
            points: 10,
            type: 'MULTIPLE_CHOICE',
            options: {
              create: [
                { text: '555-0199', is_correct: true },
                { text: '555-0100', is_correct: false }
              ]
            }
          }
        ]
      }
    }
  });

  // 7. Inscripciones y Progreso
  console.log('🎓 Enrolling students...');

  const enrollment = await prisma.inscripcion.create({
    data: {
      student_id: studentUser.estudiante!.id_estudiante,
      course_id: courseA1.id_curso,
      status: 'ACTIVE',
      payment_status: 'PAID'
    }
  });

  // Simular entrega de actividad
  await prisma.activity_submission.create({
    data: {
      activity_id: quiz1.id,
      student_id: studentUser.estudiante!.id_estudiante,
      enrollment_id: enrollment.id,
      status: 'GRADED',
      score: 10,
      submitted_at: new Date(),
      is_late: false
    }
  });

  // Curso 2: Business English (B2)
  console.log('Creating Business English Course...');
  const courseB2 = await prisma.curso.create({
    data: {
      nombre: 'Business English Mastery',
      descripcion: 'Advance your career with professional English skills.',
      resumen: 'Emails, Meetings, and Negotiations.',
      modalidad: 'ONLINE',
      inicio: new Date(),
      fin: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      precio: 99.99,
      nivel_ingles: 'B2',
      b_activo: true,
      created_by: teacherUser.profesor!.id_profesor,
      what_you_learn: JSON.stringify([
        { id: '1', text: 'Write professional emails' },
        { id: '2', text: 'Lead meetings confidently' }
      ]),
      course_content: JSON.stringify([
        {
          id: 'm1',
          title: 'Module 1: Professional Communication',
          lessons: 2,
          duration: '2h',
          topics: [
            { id: 'l1', title: 'Writing Effective Emails', duration: '1h' },
            { id: 'l2', title: 'Telephone Etiquette', duration: '1h' }
          ]
        }
      ])
    }
  });

  // Módulos para Business English
  const modB2_1 = await prisma.courseModule.create({
    data: {
      course_id: courseB2.id_curso,
      title: 'Module 1: Professional Communication',
      order: 1
    }
  });

  await prisma.courseLesson.create({
    data: {
      module_id: modB2_1.id,
      title: 'Writing Effective Emails',
      content: '<p>Formal vs Informal emails. Subject lines that work.</p>',
      order: 1
    }
  });

  console.log('✅ Seed completed successfully!');

  // Create sample study guides for seeded students
  console.log('📚 Creating sample study guides for seeded students...');
  try {
    // For studentUser (student@demo.com)
    await prisma.study_guide.create({
      data: {
        title: 'Guía: Present Simple - Para principiantes',
        content: { sections: [ { id: 'main', title: 'Present Simple', type: 'content', content: { blocks: [ { type: 'paragraph', text: 'Resumen y ejercicios de práctica para principiantes.' } ] } } ] },
        student_id: studentUser.estudiante!.id_estudiante,
      }
    })

    // For estudiante@test.com (compatibility user)
    const compatibilityUser = await prisma.usuario.findUnique({ where: { email: 'estudiante@test.com' }, include: { estudiante: true } })
    if (compatibilityUser && compatibilityUser.estudiante) {
      await prisma.study_guide.create({
        data: {
          title: 'Guía: Vocabulario de Viajes (Práctica)',
          content: { sections: [ { id: 'main', title: 'Vocabulario de viajes', type: 'content', content: { blocks: [ { type: 'paragraph', text: 'Lista de frases útiles y ejercicios.' } ] } } ] },
          student_id: compatibilityUser.estudiante.id_estudiante,
        }
      })
    }
    console.log('  ✅ Sample study guides created');
  } catch (e) {
    console.error('  ⚠️ Could not create sample study guides:', e);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
