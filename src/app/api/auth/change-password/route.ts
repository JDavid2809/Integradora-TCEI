import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/change-password
 * Cambiar contraseña del usuario autenticado
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validaciones
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Contraseña actual y nueva contraseña son requeridas' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Obtener el usuario actual
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        email: true,
        password: true,
        debe_cambiar_password: true
      }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar contraseña actual
    const passwordMatch = await bcrypt.compare(currentPassword, usuario.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Contraseña actual incorrecta' },
        { status: 400 }
      );
    }

    // Verificar que no sea la misma contraseña
    const samePassword = await bcrypt.compare(newPassword, usuario.password);
    if (samePassword) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe ser diferente a la actual' },
        { status: 400 }
      );
    }

    // Encriptar nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        password: hashedNewPassword,
        debe_cambiar_password: false // Ya no necesita cambiar contraseña
      }
    });

    console.log('Contraseña cambiada exitosamente para:', usuario.email);

    return NextResponse.json({
      message: 'Contraseña cambiada exitosamente',
      debe_cambiar_password: false
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}