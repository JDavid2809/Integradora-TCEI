import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// Middleware para verificar que es profesor
async function checkTeacherAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.rol !== 'PROFESOR') {
    return null;
  }
  
  return session;
}

// GET - Obtener exámenes que pueden gestionar
export async function GET(request: NextRequest) {
  try {
    const session = await checkTeacherAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const nivel_id = searchParams.get('nivel_id');

    // Obtener el profesor
    const teacher = await prisma.profesor.findUnique({
      where: {
        id_usuario: parseInt(session.user.id)
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 });
    }

    // Obtener niveles que enseña el profesor
    const teacherLevels = await prisma.imparte.findMany({
      where: {
        id_profesor: teacher.id_profesor
      },
      select: {
        id_nivel: true,
        nivel: {
          select: {
            nombre: true
          }
        }
      },
      distinct: ['id_nivel']
    });

    const levelIds = teacherLevels.map(tl => tl.id_nivel);

    // Construir filtros para exámenes
    let whereClause: any = {
      id_nivel: {
        in: levelIds
      }
    };

    if (nivel_id) {
      whereClause.id_nivel = parseInt(nivel_id);
    }

    // Obtener exámenes
    const exams = await prisma.examen.findMany({
      where: whereClause,
      include: {
        nivel: {
          select: {
            nombre: true
          }
        },
        pregunta: {
          include: {
            respuesta: true
          }
        },
        resultado_examen: {
          include: {
            estudiante: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        id_examen: 'desc'
      }
    });

    const examsData = exams.map(exam => ({
      id_examen: exam.id_examen,
      nombre: exam.nombre,
      nivel: exam.nivel?.nombre || 'No especificado',
      activo: exam.b_activo,
      total_preguntas: exam.pregunta.length,
      total_intentos: exam.resultado_examen.length,
      preguntas: exam.pregunta.map(pregunta => ({
        id_pregunta: pregunta.id_pregunta,
        descripcion: pregunta.descripcion,
        ruta_file_media: pregunta.ruta_file_media,
        respuestas: pregunta.respuesta.map(respuesta => ({
          id_respuesta: respuesta.id_respuesta,
          descripcion: respuesta.descripcion,
          es_correcta: respuesta.es_correcta
        }))
      })),
      resultados_recientes: exam.resultado_examen
        .filter(resultado => resultado.estudiante) // Filtrar resultados con estudiante válido
        .slice(0, 5)
        .map(resultado => ({
          id_resultado: resultado.id_resultado,
          fecha: resultado.fecha,
          calificacion: Number(resultado.calificacion),
          estudiante: {
            nombre: `${resultado.estudiante!.nombre} ${resultado.estudiante!.paterno || ''} ${resultado.estudiante!.materno || ''}`.trim(),
            email: resultado.estudiante!.usuario.email
          }
        }))
    }));

    return NextResponse.json({
      niveles_que_enseña: teacherLevels.map(tl => ({
        id_nivel: tl.id_nivel,
        nombre: tl.nivel.nombre
      })),
      total_examenes: examsData.length,
      examenes: examsData
    });

  } catch (error) {
    console.error("Error al obtener exámenes:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Crear nuevo examen
export async function POST(request: NextRequest) {
  try {
    const session = await checkTeacherAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const { nombre, id_nivel, preguntas } = data;

    // Validaciones
    if (!nombre || !id_nivel || !Array.isArray(preguntas) || preguntas.length === 0) {
      return NextResponse.json({ 
        error: "Datos requeridos: nombre, id_nivel, preguntas (array con al menos 1 pregunta)" 
      }, { status: 400 });
    }

    // Obtener el profesor
    const teacher = await prisma.profesor.findUnique({
      where: {
        id_usuario: parseInt(session.user.id)
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 });
    }

    // Verificar que el profesor enseña ese nivel
    const teachesLevel = await prisma.imparte.findFirst({
      where: {
        id_profesor: teacher.id_profesor,
        id_nivel: parseInt(id_nivel)
      }
    });

    if (!teachesLevel) {
      return NextResponse.json({ 
        error: "No tienes permisos para crear exámenes en este nivel" 
      }, { status: 403 });
    }

    // Validar preguntas
    for (const pregunta of preguntas) {
      if (!pregunta.descripcion || !Array.isArray(pregunta.respuestas) || pregunta.respuestas.length < 2) {
        return NextResponse.json({ 
          error: "Cada pregunta debe tener descripción y al menos 2 respuestas" 
        }, { status: 400 });
      }

      const respuestasCorrectas = pregunta.respuestas.filter((r: any) => r.es_correcta);
      if (respuestasCorrectas.length !== 1) {
        return NextResponse.json({ 
          error: "Cada pregunta debe tener exactamente 1 respuesta correcta" 
        }, { status: 400 });
      }
    }

    // Crear examen con preguntas y respuestas
    const newExam = await prisma.examen.create({
      data: {
        nombre: nombre.trim(),
        id_nivel: parseInt(id_nivel),
        b_activo: true,
        pregunta: {
          create: preguntas.map((pregunta: any) => ({
            descripcion: pregunta.descripcion.trim(),
            ruta_file_media: pregunta.ruta_file_media || null,
            respuesta: {
              create: pregunta.respuestas.map((respuesta: any) => ({
                descripcion: respuesta.descripcion.trim(),
                es_correcta: respuesta.es_correcta
              }))
            }
          }))
        }
      },
      include: {
        nivel: {
          select: {
            nombre: true
          }
        },
        pregunta: {
          include: {
            respuesta: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Examen creado exitosamente",
      examen: {
        id_examen: newExam.id_examen,
        nombre: newExam.nombre,
        nivel: newExam.nivel?.nombre || 'No especificado',
        total_preguntas: newExam.pregunta.length,
        preguntas: newExam.pregunta.map(pregunta => ({
          id_pregunta: pregunta.id_pregunta,
          descripcion: pregunta.descripcion,
          total_respuestas: pregunta.respuesta.length
        }))
      }
    });

  } catch (error) {
    console.error("Error al crear examen:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
