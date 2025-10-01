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

// GET - Obtener cursos asignados
export async function GET() {
  try {
    const session = await checkTeacherAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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

    // Obtener cursos donde enseña
    const assignedCourses = await prisma.imparte.findMany({
      where: {
        id_profesor: teacher.id_profesor
      },
      include: {
        curso: true,
        nivel: true,
        horario_detalle: {
          include: {
            horario: {
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
          }
        },
        historial_academico: {
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
      }
    });

    const coursesData = assignedCourses.map(imparte => {
      // Obtener estudiantes únicos
      const estudiantesUnicos = new Map();
      
      imparte.horario_detalle.forEach(detalle => {
        const estudiante = detalle.horario.estudiante;
        estudiantesUnicos.set(estudiante.id_estudiante, {
          id_estudiante: estudiante.id_estudiante,
          nombre: estudiante.nombre,
          paterno: estudiante.paterno,
          materno: estudiante.materno,
          email: estudiante.email,
          usuario: estudiante.usuario
        });
      });

      return {
        id_imparte: imparte.id_imparte,
        curso: {
          id_curso: imparte.curso.id_curso,
          nombre: imparte.curso.nombre,
          modalidad: imparte.curso.modalidad,
          inicio: imparte.curso.inicio,
          fin: imparte.curso.fin,
          activo: imparte.curso.b_activo
        },
        nivel: imparte.nivel ? {
          id_nivel: imparte.nivel.id_nivel,
          nombre: imparte.nivel.nombre
        } : null,
        estudiantes: Array.from(estudiantesUnicos.values()),
        total_estudiantes: estudiantesUnicos.size,
        dias: imparte.dias,
        hora_inicio: imparte.hora_inicio,
        duracion_min: imparte.duracion_min,
        tipo: imparte.tipo
      };
    });

    return NextResponse.json({
      total_cursos: coursesData.length,
      cursos: coursesData
    });

  } catch (error) {
    console.error("Error al obtener cursos del profesor:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Crear curso (contenido y horarios)
export async function POST(request: NextRequest) {
  try {
    const session = await checkTeacherAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const { id_curso, id_nivel, dias, hora_inicio, duracion_min, tipo } = data;

    // Validaciones
    if (!id_curso || !id_nivel) {
      return NextResponse.json({ 
        error: "Datos requeridos: id_curso, id_nivel" 
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

    // Verificar que el curso existe
    const course = await prisma.curso.findUnique({
      where: {
        id_curso: parseInt(id_curso)
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    // Crear asignación de curso
    const newAssignment = await prisma.imparte.create({
      data: {
        id_profesor: teacher.id_profesor,
        id_curso: parseInt(id_curso),
        id_nivel: parseInt(id_nivel),
        dias: dias || null,
        hora_inicio: hora_inicio || null,
        duracion_min: duracion_min || null,
        tipo: tipo || null
      },
      include: {
        curso: true,
        nivel: true
      }
    });

    return NextResponse.json({
      message: "Curso asignado exitosamente",
      asignacion: {
        id_imparte: newAssignment.id_imparte,
        curso: {
          nombre: newAssignment.curso.nombre,
          modalidad: newAssignment.curso.modalidad
        },
        nivel: newAssignment.nivel.nombre,
        tipo: newAssignment.tipo,
        dias: newAssignment.dias,
        hora_inicio: newAssignment.hora_inicio,
        duracion_min: newAssignment.duracion_min
      }
    });

  } catch (error) {
    console.error("Error al crear asignación de curso:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
