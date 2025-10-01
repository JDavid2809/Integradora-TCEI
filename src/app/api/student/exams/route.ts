import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// Middleware para verificar que es estudiante
async function checkStudentAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.rol !== 'ESTUDIANTE') {
    return null;
  }
  
  return session;
}

// GET - Obtener resultados de sus exámenes
export async function GET(request: NextRequest) {
  try {
    const session = await checkStudentAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const examen_id = searchParams.get('examen_id');

    // Obtener el estudiante
    const student = await prisma.estudiante.findUnique({
      where: {
        id_usuario: parseInt(session.user.id)
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    // Construir filtros
    let whereClause: any = {
      id_estudiante: student.id_estudiante
    };

    if (examen_id) {
      whereClause.id_examen = parseInt(examen_id);
    }

    // Obtener resultados de exámenes
    const examResults = await prisma.resultado_examen.findMany({
      where: whereClause,
      include: {
        examen: {
          include: {
            nivel: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    const resultsData = examResults.map(result => ({
      id_resultado: result.id_resultado,
      fecha: result.fecha,
      calificacion: result.calificacion ? Number(result.calificacion) : null,
      // Calcular aprobado basado en calificación >= 70
      aprobado: result.calificacion ? Number(result.calificacion) >= 70 : false,
      examen: result.examen ? {
        id_examen: result.examen.id_examen,
        nombre: result.examen.nombre,
        nivel: result.examen.nivel?.nombre || 'No especificado',
        activo: result.examen.b_activo
      } : null
    }));

    // Calcular estadísticas
    const totalExamenes = resultsData.length;
    const examenesAprobados = resultsData.filter(result => result.aprobado).length;
    const promedioCalificaciones = resultsData.length > 0 
      ? resultsData
          .filter(result => result.calificacion !== null)
          .reduce((sum, result) => sum + (result.calificacion || 0), 0) / 
        resultsData.filter(result => result.calificacion !== null).length
      : 0;

    // Estadísticas por examen
    const estadisticasPorExamen = resultsData.reduce((acc, result) => {
      if (!result.examen) return acc;
      
      const examenNombre = result.examen.nombre;
      if (!acc[examenNombre]) {
        acc[examenNombre] = {
          intentos: 0,
          mejor_calificacion: 0,
          ultimo_intento: null,
          aprobado: false
        };
      }
      
      acc[examenNombre].intentos++;
      if (result.calificacion && result.calificacion > acc[examenNombre].mejor_calificacion) {
        acc[examenNombre].mejor_calificacion = result.calificacion;
      }
      if (!acc[examenNombre].ultimo_intento || result.fecha > acc[examenNombre].ultimo_intento) {
        acc[examenNombre].ultimo_intento = result.fecha;
        acc[examenNombre].aprobado = result.aprobado;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      resumen: {
        total_examenes: totalExamenes,
        examenes_aprobados: examenesAprobados,
        porcentaje_aprobacion: totalExamenes > 0 ? ((examenesAprobados / totalExamenes) * 100).toFixed(2) : '0',
        promedio_calificaciones: promedioCalificaciones.toFixed(2)
      },
      estadisticas_por_examen: estadisticasPorExamen,
      resultados: resultsData
    });

  } catch (error) {
    console.error("Error al obtener resultados de exámenes:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Crear intento de examen
export async function POST(request: NextRequest) {
  try {
    const session = await checkStudentAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const { id_examen, respuestas, tiempo_empleado } = data;

    // Validaciones
    if (!id_examen || !Array.isArray(respuestas)) {
      return NextResponse.json({ 
        error: "Datos requeridos: id_examen, respuestas (array)" 
      }, { status: 400 });
    }

    // Obtener el estudiante
    const student = await prisma.estudiante.findUnique({
      where: {
        id_usuario: parseInt(session.user.id)
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    // Verificar que el examen existe y está activo
    const exam = await prisma.examen.findUnique({
      where: {
        id_examen: parseInt(id_examen)
      },
      include: {
        pregunta: {
          include: {
            respuesta: true
          }
        }
      }
    });

    if (!exam || !exam.b_activo) {
      return NextResponse.json({ error: "Examen no encontrado o inactivo" }, { status: 404 });
    }

    // Calcular calificación
    let respuestasCorrectas = 0;
    const totalPreguntas = exam.pregunta.length;

    for (const respuesta of respuestas) {
      const pregunta = exam.pregunta.find(p => p.id_pregunta === respuesta.id_pregunta);
      if (pregunta) {
        const respuestaCorrecta = pregunta.respuesta.find(r => r.es_correcta === true);
        if (respuestaCorrecta && respuestaCorrecta.id_respuesta === respuesta.id_respuesta) {
          respuestasCorrectas++;
        }
      }
    }

    const calificacion = totalPreguntas > 0 ? (respuestasCorrectas / totalPreguntas) * 100 : 0;
    const aprobado = calificacion >= 70; // Criterio de aprobación: 70%

    // Crear resultado de examen
    const examResult = await prisma.resultado_examen.create({
      data: {
        id_estudiante: student.id_estudiante,
        id_examen: parseInt(id_examen),
        fecha: new Date(),
        calificacion: calificacion
      },
      include: {
        examen: {
          include: {
            nivel: {
              select: {
                nombre: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: "Examen completado exitosamente",
      resultado: {
        id_resultado: examResult.id_resultado,
        calificacion: Number(examResult.calificacion),
        aprobado: aprobado,
        respuestas_correctas: respuestasCorrectas,
        total_preguntas: totalPreguntas,
        porcentaje: calificacion.toFixed(2),
        fecha: examResult.fecha,
        examen: examResult.examen ? {
          nombre: examResult.examen.nombre,
          nivel: examResult.examen.nivel?.nombre || 'No especificado'
        } : null
      }
    });

  } catch (error) {
    console.error("Error al procesar intento de examen:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
