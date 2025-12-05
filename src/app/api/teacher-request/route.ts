import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/teacher-request
 * Crear nueva solicitud de profesor
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nombre,
      apellido,
      email,
      telefono,
      edad,
      curp,
      rfc,
      direccion,
      nivel_estudios,
      observaciones,
      documentos_adjuntos
    } = body

    // Validaciones básicas
    if (!nombre || !apellido || !email) {
      return NextResponse.json(
        { error: 'Nombre, apellido y email son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el email no esté ya registrado como usuario
    const existingUser = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 400 }
      )
    }

    // Verificar si ya existe una solicitud con este email (sin importar el estado)
    const existingRequest = await prisma.solicitud_profesor.findUnique({
      where: {
        email: email.toLowerCase().trim()
      }
    })

    if (existingRequest) {
      let message = 'Ya existe una solicitud con este email'
      
      switch (existingRequest.estado) {
        case 'PENDIENTE':
          message = 'Ya tienes una solicitud pendiente con este email'
          break
        case 'APROBADA':
          message = 'Este email ya fue aprobado como profesor'
          break
        case 'RECHAZADA':
          message = 'Ya existe una solicitud rechazada con este email. Contacta al administrador para más información'
          break
      }
      
      return NextResponse.json(
        { error: message },
        { status: 400 }
      )
    }

    // Crear nueva solicitud
    const nuevaSolicitud = await prisma.solicitud_profesor.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim(),
        telefono: telefono?.trim() || null,
        edad: edad ? parseInt(edad) : null,
        curp: curp?.trim() || null,
        rfc: rfc?.trim() || null,
        direccion: direccion?.trim() || null,
        nivel_estudios: nivel_estudios?.trim() || null,
        observaciones: observaciones?.trim() || null,
        documentos_adjuntos: documentos_adjuntos ? JSON.stringify(documentos_adjuntos) : null,
        estado: 'PENDIENTE'
      }
    })

    // TODO: Enviar notificación a administradores
    // await notifyAdminsNewTeacherRequest(nuevaSolicitud)

    return NextResponse.json({
      message: 'Solicitud enviada exitosamente. Te contactaremos pronto.',
      id_solicitud: nuevaSolicitud.id_solicitud
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear solicitud de profesor:', error)
    
    // Manejar error específico de restricción única
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una solicitud con este email' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/teacher-request
 * Verificar estado de solicitud por email
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    const solicitud = await prisma.solicitud_profesor.findFirst({
      where: { email: email.toLowerCase().trim() },
      select: {
        id_solicitud: true,
        estado: true,
        fecha_solicitud: true,
        fecha_revision: true,
        comentario_revision: true
      },
      orderBy: { fecha_solicitud: 'desc' }
    })

    if (!solicitud) {
      return NextResponse.json(
        { error: 'No se encontró ninguna solicitud con este email' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      solicitud: {
        ...solicitud,
        fecha_solicitud: solicitud.fecha_solicitud.toISOString(),
        fecha_revision: solicitud.fecha_revision?.toISOString() || null
      }
    })

  } catch (error) {
    console.error('Error al verificar solicitud:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}