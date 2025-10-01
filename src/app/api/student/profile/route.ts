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

// GET - Obtener su propio perfil
export async function GET() {
  try {
    const session = await checkStudentAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const studentProfile = await prisma.estudiante.findUnique({
      where: { 
        id_usuario: parseInt(session.user.id)
      },
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
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Perfil de estudiante no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id_estudiante: studentProfile.id_estudiante,
      nombre: studentProfile.nombre,
      paterno: studentProfile.paterno,
      materno: studentProfile.materno,
      email: studentProfile.email,
      telefono: studentProfile.telefono,
      edad: studentProfile.edad,
      descripcion: studentProfile.descripcion,
      categoria_edad: studentProfile.categoria_edad,
      usuario: studentProfile.usuario,
      activo: studentProfile.b_activo
    });

  } catch (error) {
    console.error("Error al obtener perfil del estudiante:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT - Actualizar su propio perfil
export async function PUT(request: NextRequest) {
  try {
    const session = await checkStudentAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const { nombre, paterno, materno, telefono, descripcion } = data;

    // Validaciones básicas
    if (!nombre || typeof nombre !== 'string') {
      return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });
    }

    const updatedStudent = await prisma.estudiante.update({
      where: {
        id_usuario: parseInt(session.user.id)
      },
      data: {
        nombre: nombre.trim(),
        paterno: paterno?.trim() || null,
        materno: materno?.trim() || null,
        telefono: telefono?.trim() || null,
        descripcion: descripcion?.trim() || null
      },
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
    });

    return NextResponse.json({
      message: "Perfil actualizado exitosamente",
      profile: updatedStudent
    });

  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
