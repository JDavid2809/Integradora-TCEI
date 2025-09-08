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

// GET - Obtener lista de estudiantes en sus cursos
export async function GET(request: NextRequest) {
  try {
    const session = await checkTeacherAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const curso_id = searchParams.get('curso_id');
    const incluir_estadisticas = searchParams.get('incluir_estadisticas') === 'true';

    // Obtener el profesor
    const teacher = await prisma.profesor.findUnique({
      where: {
        id_usuario: parseInt(session.user.id)
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 });
    }

    // Construir filtros
    let whereClause: any = {
      horario_detalle: {
        some: {
          imparte: {
            id_profesor: teacher.id_profesor
          }
        }
      }
    };

    if (curso_id) {
      whereClause.id_curso = parseInt(curso_id);
    }

    // Obtener estudiantes inscritos en los cursos del profesor
    const enrollments = await prisma.horario.findMany({
      where: whereClause,
      include: {
        estudiante: {
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
                email: true
              }
            },
            categoria_edad: true
          }
        },
        curso: {
          select: {
            id_curso: true,
            nombre: true,
            modalidad: true,
            inicio: true,
            fin: true
          }
        },
        horario_detalle: {
          include: {
            imparte: {
              include: {
                nivel: {
                  select: {
                    nombre: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const studentsData = await Promise.all(
      enrollments.map(async (enrollment) => {
        const baseData = {
          id_estudiante: enrollment.estudiante.id_estudiante,
          nombre: enrollment.estudiante.nombre,
          paterno: enrollment.estudiante.paterno,
          materno: enrollment.estudiante.materno,
          email: enrollment.estudiante.email,
          telefono: enrollment.estudiante.telefono,
          edad: enrollment.estudiante.edad,
          descripcion: enrollment.estudiante.descripcion,
          categoria_edad: enrollment.estudiante.categoria_edad?.rango,
          usuario: enrollment.estudiante.usuario,
          activo: enrollment.estudiante.b_activo,
          curso: {
            id_curso: enrollment.curso.id_curso,
            nombre: enrollment.curso.nombre,
            modalidad: enrollment.curso.modalidad,
            inicio: enrollment.curso.inicio,
            fin: enrollment.curso.fin
          },
          nivel: enrollment.horario_detalle[0]?.imparte?.nivel?.nombre || 'No especificado',
          comentario_inscripcion: enrollment.comentario
        };

        // Si se solicitan estadísticas, incluirlas
        if (incluir_estadisticas) {
          // Obtener estadísticas de asistencia
          const attendanceStats = await prisma.historial_academico.findMany({
            where: {
              id_estudiante: enrollment.estudiante.id_estudiante,
              imparte: {
                id_profesor: teacher.id_profesor,
                id_curso: enrollment.curso.id_curso
              },
              asistencia: {
                not: null
              }
            }
          });

          const totalClases = attendanceStats.length;
          const clasesAsistidas = attendanceStats.filter(record => record.asistencia === 1).length;
          const porcentajeAsistencia = totalClases > 0 ? ((clasesAsistidas / totalClases) * 100).toFixed(2) : '0';

          // Obtener estadísticas de calificaciones
          const gradesStats = await prisma.historial_academico.findMany({
            where: {
              id_estudiante: enrollment.estudiante.id_estudiante,
              imparte: {
                id_profesor: teacher.id_profesor,
                id_curso: enrollment.curso.id_curso
              },
              calificacion: {
                not: null
              }
            }
          });

          const calificaciones = gradesStats
            .map(record => Number(record.calificacion))
            .filter(cal => !isNaN(cal));

          const promedioCalificaciones = calificaciones.length > 0
            ? (calificaciones.reduce((sum, cal) => sum + cal, 0) / calificaciones.length).toFixed(2)
            : '0';

          // Obtener resultados de exámenes
          const examResults = await prisma.resultado_examen.findMany({
            where: {
              id_estudiante: enrollment.estudiante.id_estudiante,
              examen: {
                nivel: {
                  imparte: {
                    some: {
                      id_profesor: teacher.id_profesor
                    }
                  }
                }
              }
            }
          });

          const examenesAprobados = examResults.filter(result => Number(result.calificacion) >= 70).length;
          const totalExamenes = examResults.length;

          return {
            ...baseData,
            estadisticas: {
              asistencia: {
                total_clases: totalClases,
                clases_asistidas: clasesAsistidas,
                porcentaje: parseFloat(porcentajeAsistencia)
              },
              calificaciones: {
                total_evaluaciones: calificaciones.length,
                promedio: parseFloat(promedioCalificaciones)
              },
              examenes: {
                total_examenes: totalExamenes,
                examenes_aprobados: examenesAprobados,
                porcentaje_aprobacion: totalExamenes > 0 ? ((examenesAprobados / totalExamenes) * 100).toFixed(2) : '0'
              }
            }
          };
        }

        return baseData;
      })
    );

    // Agrupar por curso si no se especifica un curso específico
    if (!curso_id) {
      const studentsByCourse = studentsData.reduce((acc, student) => {
        const courseKey = student.curso.nombre;
        if (!acc[courseKey]) {
          acc[courseKey] = {
            curso: student.curso,
            total_estudiantes: 0,
            estudiantes: []
          };
        }
        acc[courseKey].estudiantes.push(student);
        acc[courseKey].total_estudiantes = acc[courseKey].estudiantes.length;
        return acc;
      }, {} as Record<string, any>);

      return NextResponse.json({
        cursos: Object.values(studentsByCourse),
        total_estudiantes_general: studentsData.length
      });
    }

    return NextResponse.json({
      total_estudiantes: studentsData.length,
      estudiantes: studentsData
    });

  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
