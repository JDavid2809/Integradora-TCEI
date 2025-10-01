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

// GET - Obtener historial de asistencia propio
export async function GET(request: NextRequest) {
  try {
    const session = await checkStudentAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const curso_id = searchParams.get('curso_id');
    const fecha_inicio = searchParams.get('fecha_inicio');
    const fecha_fin = searchParams.get('fecha_fin');

    // Obtener el estudiante
    const student = await prisma.estudiante.findUnique({
      where: {
        id_usuario: parseInt(session.user.id)
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    // Construir filtros para la consulta
    let whereClause: any = {
      id_estudiante: student.id_estudiante
    };

    if (curso_id) {
      whereClause.imparte = {
        curso: {
          id_curso: parseInt(curso_id)
        }
      };
    }

    if (fecha_inicio) {
      whereClause.fecha = {
        ...whereClause.fecha,
        gte: new Date(fecha_inicio)
      };
    }

    if (fecha_fin) {
      whereClause.fecha = {
        ...whereClause.fecha,
        lte: new Date(fecha_fin)
      };
    }

    // Obtener historial académico (incluye asistencia)
    const attendanceRecords = await prisma.historial_academico.findMany({
      where: whereClause,
      include: {
        imparte: {
          include: {
            curso: {
              select: {
                nombre: true,
                modalidad: true
              }
            },
            profesor: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true
                  }
                }
              }
            },
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

    const attendanceData = attendanceRecords.map(record => ({
      id_historial: record.id_historial,
      fecha: record.fecha,
      asistencia: record.asistencia,
      calificacion: record.calificacion ? Number(record.calificacion) : null,
      tipo: record.tipo,
      tipo_evaluacion: record.tipo_evaluacion,
      comentario: record.comentario,
      tipo_capturo: record.tipo_capturo,
      curso: {
        nombre: record.imparte.curso.nombre,
        modalidad: record.imparte.curso.modalidad,
        nivel: record.imparte.nivel?.nombre || 'No especificado',
        profesor: `${record.imparte.profesor.usuario.nombre} ${record.imparte.profesor.usuario.apellido}`
      }
    }));

    // Calcular estadísticas de asistencia
    const totalClases = attendanceData.filter(record => record.asistencia !== null).length;
    const clasesAsistidas = attendanceData.filter(record => record.asistencia === 1).length;
    const porcentajeAsistencia = totalClases > 0 ? ((clasesAsistidas / totalClases) * 100).toFixed(2) : '0';

    // Estadísticas por curso
    const estadisticasPorCurso = attendanceData.reduce((acc, record) => {
      const cursoNombre = record.curso.nombre;
      if (!acc[cursoNombre]) {
        acc[cursoNombre] = {
          total_clases: 0,
          clases_asistidas: 0,
          porcentaje: 0
        };
      }
      
      if (record.asistencia !== null) {
        acc[cursoNombre].total_clases++;
        if (record.asistencia === 1) {
          acc[cursoNombre].clases_asistidas++;
        }
      }
      
      acc[cursoNombre].porcentaje = acc[cursoNombre].total_clases > 0 
        ? ((acc[cursoNombre].clases_asistidas / acc[cursoNombre].total_clases) * 100) 
        : 0;
      
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      resumen: {
        total_registros: attendanceData.length,
        total_clases: totalClases,
        clases_asistidas: clasesAsistidas,
        porcentaje_asistencia: parseFloat(porcentajeAsistencia)
      },
      estadisticas_por_curso: estadisticasPorCurso,
      historial: attendanceData
    });

  } catch (error) {
    console.error("Error al obtener historial de asistencia:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
