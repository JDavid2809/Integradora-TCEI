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

// GET - Obtener asistencia de alumnos en sus cursos
export async function GET(request: NextRequest) {
  try {
    const session = await checkTeacherAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const curso_id = searchParams.get('curso_id');
    const estudiante_id = searchParams.get('estudiante_id');
    const fecha_inicio = searchParams.get('fecha_inicio');
    const fecha_fin = searchParams.get('fecha_fin');

    // Obtener el profesor
    const teacher = await prisma.profesor.findUnique({
      where: {
        id_usuario: parseInt(session.user.id)
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 });
    }

    // Construir filtros para la consulta
    let whereClause: any = {
      imparte: {
        id_profesor: teacher.id_profesor
      }
    };

    if (curso_id) {
      whereClause.imparte.id_curso = parseInt(curso_id);
    }

    if (estudiante_id) {
      whereClause.id_estudiante = parseInt(estudiante_id);
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

    // Obtener registros de asistencia
    const attendanceRecords = await prisma.historial_academico.findMany({
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
            }
          }
        },
        imparte: {
          include: {
            curso: {
              select: {
                nombre: true,
                modalidad: true
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
      orderBy: [
        { fecha: 'desc' },
        { id_estudiante: 'asc' }
      ]
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
      estudiante: {
        id_estudiante: record.estudiante.id_estudiante,
        nombre: record.estudiante.nombre,
        paterno: record.estudiante.paterno,
        materno: record.estudiante.materno,
        usuario: record.estudiante.usuario
      },
      curso: {
        nombre: record.imparte.curso.nombre,
        modalidad: record.imparte.curso.modalidad,
        nivel: record.imparte.nivel?.nombre || 'No especificado'
      }
    }));

    return NextResponse.json({
      total_registros: attendanceData.length,
      registros: attendanceData
    });

  } catch (error) {
    console.error("Error al obtener asistencia:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Crear registro de asistencia
export async function POST(request: NextRequest) {
  try {
    const session = await checkTeacherAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const { id_estudiante, id_imparte, fecha, asistencia, calificacion, tipo, tipo_evaluacion, comentario } = data;

    // Validaciones
    if (!id_estudiante || !id_imparte || !fecha) {
      return NextResponse.json({ 
        error: "Datos requeridos: id_estudiante, id_imparte, fecha" 
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

    // Verificar que el profesor enseña ese curso
    const teacherAssignment = await prisma.imparte.findFirst({
      where: {
        id_imparte: parseInt(id_imparte),
        id_profesor: teacher.id_profesor
      }
    });

    if (!teacherAssignment) {
      return NextResponse.json({ 
        error: "No tienes permisos para registrar asistencia en este curso" 
      }, { status: 403 });
    }

    // Verificar que el estudiante está inscrito en el curso
    const enrollment = await prisma.horario.findFirst({
      where: {
        id_estudiante: parseInt(id_estudiante),
        curso: {
          imparte: {
            some: {
              id_imparte: parseInt(id_imparte)
            }
          }
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json({ 
        error: "El estudiante no está inscrito en este curso" 
      }, { status: 404 });
    }

    // Crear registro de asistencia
    const attendanceRecord = await prisma.historial_academico.create({
      data: {
        id_estudiante: parseInt(id_estudiante),
        id_imparte: parseInt(id_imparte),
        id_capturo: teacher.id_profesor,
        tipo_capturo: 'PROFESOR',
        fecha: new Date(fecha),
        asistencia: asistencia,
        calificacion: calificacion || null,
        tipo: tipo || null,
        tipo_evaluacion: tipo_evaluacion || null,
        comentario: comentario || null
      },
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
        },
        imparte: {
          include: {
            curso: {
              select: {
                nombre: true,
                modalidad: true
              }
            },
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
      message: "Asistencia registrada exitosamente",
      registro: {
        id_historial: attendanceRecord.id_historial,
        fecha: attendanceRecord.fecha,
        asistencia: attendanceRecord.asistencia,
        calificacion: attendanceRecord.calificacion ? Number(attendanceRecord.calificacion) : null,
        tipo: attendanceRecord.tipo,
        estudiante: {
          nombre: `${attendanceRecord.estudiante.nombre} ${attendanceRecord.estudiante.paterno || ''} ${attendanceRecord.estudiante.materno || ''}`.trim(),
          email: attendanceRecord.estudiante.usuario.email
        },
        curso: {
          nombre: attendanceRecord.imparte.curso.nombre,
          nivel: attendanceRecord.imparte.nivel?.nombre || 'No especificado'
        }
      }
    });

  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT - Actualizar registro de asistencia
export async function PUT(request: NextRequest) {
  try {
    const session = await checkTeacherAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const { id_historial, asistencia, calificacion, tipo, tipo_evaluacion, comentario } = data;

    // Validaciones
    if (!id_historial) {
      return NextResponse.json({ 
        error: "Dato requerido: id_historial" 
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

    // Verificar que el profesor puede modificar este registro
    const existingRecord = await prisma.historial_academico.findFirst({
      where: {
        id_historial: parseInt(id_historial),
        imparte: {
          id_profesor: teacher.id_profesor
        }
      }
    });

    if (!existingRecord) {
      return NextResponse.json({ 
        error: "No tienes permisos para modificar este registro" 
      }, { status: 403 });
    }

    // Actualizar registro
    const updatedRecord = await prisma.historial_academico.update({
      where: {
        id_historial: parseInt(id_historial)
      },
      data: {
        asistencia: asistencia !== undefined ? asistencia : existingRecord.asistencia,
        calificacion: calificacion !== undefined ? calificacion : existingRecord.calificacion,
        tipo: tipo !== undefined ? tipo : existingRecord.tipo,
        tipo_evaluacion: tipo_evaluacion !== undefined ? tipo_evaluacion : existingRecord.tipo_evaluacion,
        comentario: comentario !== undefined ? comentario : existingRecord.comentario
      },
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
        },
        imparte: {
          include: {
            curso: {
              select: {
                nombre: true,
                modalidad: true
              }
            },
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
      message: "Registro actualizado exitosamente",
      registro: {
        id_historial: updatedRecord.id_historial,
        fecha: updatedRecord.fecha,
        asistencia: updatedRecord.asistencia,
        calificacion: updatedRecord.calificacion ? Number(updatedRecord.calificacion) : null,
        tipo: updatedRecord.tipo,
        estudiante: {
          nombre: `${updatedRecord.estudiante.nombre} ${updatedRecord.estudiante.paterno || ''} ${updatedRecord.estudiante.materno || ''}`.trim(),
          email: updatedRecord.estudiante.usuario.email
        },
        curso: {
          nombre: updatedRecord.imparte.curso.nombre,
          nivel: updatedRecord.imparte.nivel?.nombre || 'No especificado'
        }
      }
    });

  } catch (error) {
    console.error("Error al actualizar registro:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
