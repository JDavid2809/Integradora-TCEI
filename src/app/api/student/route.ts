
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
interface prop{
 
    email: string;
    nombre: string;
    apellido: string;
    estudiante?: {
        email?: string;
        nombre: string;
        id_estudiante: number;
        paterno?: string;
        materno?: string;
        telefono?: string;
        edad?: number;
        descripcion?: string;
    } 
} 

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.usuario.findUnique({
  where: { id: +session.user.id },
  select: {
    nombre: true,
    apellido: true,
    email: true,
    estudiante: {
      select: {
        id_estudiante: true,
        nombre: true,
        paterno: true,
        materno: true,
        email: true,
        telefono: true,
        edad: true,
        descripcion: true,
      },
    },
  },
}) as prop ;


  if (!user || !user.estudiante) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  // Puedes devolver solo los datos del estudiante si lo prefieres
  return NextResponse.json(user.estudiante);
}

