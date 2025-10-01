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

// GET - Obtener cursos en los que está inscrito
export async function GET() {
  try {
    const session = await checkStudentAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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

    // Obtener cursos donde está inscrito
    const enrolledCourses = await prisma.horario.findMany({
      where: {
        id_estudiante: student.id_estudiante
      },
      include: {
        curso: {
          include: {
            imparte: {
              include: {
                profesor: {
                  include: {
                    usuario: {
                      select: {
                        nombre: true,
                        apellido: true,
                        email: true
                      }
                    }
                  }
                },
                nivel: true
              }
            }
          }
        },
        horario_detalle: {
          include: {
            imparte: {
              include: {
                horario_pred_detalle: true
              }
            }
          }
        }
      }
    });

    const coursesData = enrolledCourses.map(horario => ({
      id_horario: horario.id_horario,
      curso: {
        id_curso: horario.curso.id_curso,
        nombre: horario.curso.nombre,
        modalidad: horario.curso.modalidad,
        inicio: horario.curso.inicio,
        fin: horario.curso.fin,
        activo: horario.curso.b_activo
      },
      profesores: horario.curso.imparte.map(imp => ({
        id_profesor: imp.profesor.id_profesor,
        nombre: `${imp.profesor.usuario.nombre} ${imp.profesor.usuario.apellido}`,
        email: imp.profesor.usuario.email,
        nivel: imp.nivel?.nombre || 'No especificado'
      })),
      horarios: horario.horario_detalle,
      comentario: horario.comentario
    }));

    return NextResponse.json({
      total_cursos: coursesData.length,
      cursos: coursesData
    });

  } catch (error) {
    console.error("Error al obtener cursos del estudiante:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
