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

// GET - Obtener su propio perfil
export async function GET() {
  try {
    const session = await checkTeacherAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const teacherProfile = await prisma.profesor.findUnique({
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
        }
      }
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: "Perfil de profesor no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id_profesor: teacherProfile.id_profesor,
      nombre: teacherProfile.nombre,
      paterno: teacherProfile.paterno,
      materno: teacherProfile.materno,
      telefono: teacherProfile.telefono,
      edad: teacherProfile.edad,
      observaciones: teacherProfile.observaciones,
      usuario: teacherProfile.usuario,
      activo: teacherProfile.b_activo
    });

  } catch (error) {
    console.error("Error al obtener perfil del profesor:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT - Actualizar su propio perfil
export async function PUT(request: NextRequest) {
  try {
    const session = await checkTeacherAuth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();
    const { nombre, paterno, materno, telefono, observaciones } = data;

    // Validaciones básicas
    if (!nombre || typeof nombre !== 'string') {
      return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });
    }

    const updatedTeacher = await prisma.profesor.update({
      where: {
        id_usuario: parseInt(session.user.id)
      },
      data: {
        nombre: nombre.trim(),
        paterno: paterno?.trim() || null,
        materno: materno?.trim() || null,
        telefono: telefono?.trim() || null,
        observaciones: observaciones?.trim() || null
      },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Perfil actualizado exitosamente",
      profile: updatedTeacher
    });

  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
