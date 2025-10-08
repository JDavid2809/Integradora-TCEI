import {  NextResponse } from "next/server";
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

    // Obtener cursos donde está inscrito (tabla Inscripcion)
    const enrolledCourses = await prisma.inscripcion.findMany({
      where: {
        student_id: student.id_estudiante,
        status: "ACTIVE" // Solo inscripciones activas
      },
      include: {
        course: {
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
        }
      }
    });

    const coursesData = enrolledCourses.map(inscripcion => ({
      id_inscripcion: inscripcion.id,
      status: inscripcion.status,
      payment_status: inscripcion.payment_status,
      enrolled_at: inscripcion.enrolled_at,
      curso: {
        id_curso: inscripcion.course.id_curso,
        nombre: inscripcion.course.nombre,
        modalidad: inscripcion.course.modalidad,
        inicio: inscripcion.course.inicio,
        fin: inscripcion.course.fin,
        activo: inscripcion.course.b_activo
      },
      profesores: inscripcion.course.imparte.map((imp: any) => ({
        id_profesor: imp.profesor.id_profesor,
        nombre: `${imp.profesor.usuario.nombre} ${imp.profesor.usuario.apellido}`,
        email: imp.profesor.usuario.email,
        nivel: imp.nivel?.nombre || 'No especificado'
      })),
      notes: inscripcion.notes
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
