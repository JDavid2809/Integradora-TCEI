import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Niveles
  const nivelA1 = await prisma.nivel.upsert({
    where: { nombre: 'A1' },
    update: {},
    create: { nombre: 'A1' },
  });
  const nivelA2 = await prisma.nivel.upsert({
    where: { nombre: 'A2' },
    update: {},
    create: { nombre: 'A2' },
  });

  // Categoría de edad
  const catEdad = await prisma.categoria_edad.create({
    data: { rango: '15-18', b_activo: true },
  });

  // Usuarios base
  const adminPass = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.usuario.create({
    data: {
      email: 'admin@demo.com',
      password: adminPass,
      nombre: 'Admin',
      apellido: 'Demo',
      rol: 'ADMIN',
      verificado: true,
      administrador: {
        create: {
          nombre: 'Admin',
          image: '/default-avatar.png',
          email_unico: 'admin@demo.com',
        },
      },
    },
    include: { administrador: true },
  });

  const profPass = await bcrypt.hash('prof123', 10);
  const profUser = await prisma.usuario.create({
    data: {
      email: 'prof@demo.com',
      password: profPass,
      nombre: 'Profe',
      apellido: 'Demo',
      rol: 'PROFESOR',
      verificado: true,
      profesor: {
        create: {
          nombre: 'Profe',
          paterno: 'Demo',
          edad: 35,
          curp: 'CURP123',
          rfc: 'RFC123',
          direccion: 'Calle 1',
          telefono: '555-1234',
          nivel_estudios: 'Licenciatura',
          observaciones: 'Ninguna',
        },
      },
    },
    include: { profesor: true },
  });

  const estPass = await bcrypt.hash('est123', 10);
  const estUser = await prisma.usuario.create({
    data: {
      email: 'est@demo.com',
      password: estPass,
      nombre: 'Estu',
      apellido: 'Demo',
      rol: 'ESTUDIANTE',
      verificado: true,
      estudiante: {
        create: {
          nombre: 'Estu',
          paterno: 'Demo',
          email: 'est@demo.com',
          telefono: '555-5678',
          edad: 17,
          descripcion: 'Alumno de prueba',
          id_categoria_edad: catEdad.id_categoria_edad,
        },
      },
    },
    include: { estudiante: true },
  });

  // Curso
  const curso = await prisma.curso.create({
    data: {
      nombre: 'Inglés Básico',
      slug: 'ingles-basico',
      modalidad: 'PRESENCIAL',
      inicio: new Date(),
      fin: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      b_activo: true,
    },
  });

  // Imparte (clase)
  const imparte = await prisma.imparte.create({
    data: {
      id_profesor: profUser.profesor!.id_profesor,
      id_nivel: nivelA1.id_nivel,
      id_curso: curso.id_curso,
      dias: 'Lunes',
      hora_inicio: 8,
      duracion_min: 60,
      tipo: 'PRESENCIAL',
    },
  });

  // Examen
  const examen = await prisma.examen.create({
    data: {
      nombre: 'Examen Diagnóstico',
      id_nivel: nivelA1.id_nivel,
      b_activo: true,
    },
  });

  // Pregunta y respuestas
  const pregunta = await prisma.pregunta.create({
    data: {
      id_examen: examen.id_examen,
      descripcion: '¿Cuál es la capital de Inglaterra?',
      respuesta: {
        create: [
          { descripcion: 'Londres', es_correcta: true },
          { descripcion: 'París', es_correcta: false },
          { descripcion: 'Madrid', es_correcta: false },
          { descripcion: 'Roma', es_correcta: false },
        ],
      },
    },
  });

  // Historial académico
  await prisma.historial_academico.create({
    data: {
      id_estudiante: estUser.estudiante!.id_estudiante,
      id_imparte: imparte.id_imparte,
      id_capturo: adminUser.administrador!.id_administrador,
      tipo_capturo: 'USER',
      calificacion: 9.5,
      fecha: new Date(),
      tipo: 'FINAL',
      asistencia: 100,
    },
  });

  // Pago
  await prisma.pago.create({
    data: {
      id_estudiante: estUser.estudiante!.id_estudiante,
      id_imparte: imparte.id_imparte,
      monto: 1200.00,
      fecha_pago: new Date(),
      tipo: 'Mensualidad',
    },
  });

  console.log('Base de datos poblada con datos de prueba.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
