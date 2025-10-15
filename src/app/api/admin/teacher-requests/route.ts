import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { sendTeacherCredentials } from "@/lib/mailer";
import { normalizeEmail } from "@/lib/emailUtils";
import bcrypt from 'bcryptjs';

// Middleware para verificar que es admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.rol !== 'ADMIN') {
    return null
  }
  
  return session
}

/**
 * GET /api/admin/teacher-requests
 * Obtener todas las solicitudes de profesores
 */
export async function GET(request: NextRequest) {
  try {
    const session = await checkAdminAuth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado') // PENDIENTE, APROBADA, RECHAZADA
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir filtros
    const whereClause: any = {}
    if (estado && ['PENDIENTE', 'APROBADA', 'RECHAZADA'].includes(estado)) {
      whereClause.estado = estado
    }

    const solicitudes = await prisma.solicitud_profesor.findMany({
      where: whereClause,
      orderBy: [
        { estado: 'asc' }, // PENDIENTE primero
        { fecha_solicitud: 'desc' } // Más recientes primero
      ],
      take: limit,
      skip: offset
    })

    const total = await prisma.solicitud_profesor.count({
      where: whereClause
    })

    // Obtener estadísticas
    const estadisticas = await prisma.solicitud_profesor.groupBy({
      by: ['estado'],
      _count: {
        estado: true
      }
    });

    const stats = {
      total,
      pendientes: estadisticas.find(e => e.estado === 'PENDIENTE')?._count.estado || 0,
      aprobadas: estadisticas.find(e => e.estado === 'APROBADA')?._count.estado || 0,
      rechazadas: estadisticas.find(e => e.estado === 'RECHAZADA')?._count.estado || 0
    };

    return NextResponse.json({
      solicitudes,
      estadisticas: stats,
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error al obtener solicitudes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/teacher-requests
 * Aprobar o rechazar una solicitud de profesor
 */
export async function POST(request: NextRequest) {
  try {
    const session = await checkAdminAuth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id_solicitud, accion, comentario_revision, password } = body

    console.log('📋 Procesando solicitud:', { id_solicitud, accion, comentario_revision })

    // Validaciones
    if (!id_solicitud || !accion) {
      return NextResponse.json(
        { error: 'id_solicitud y accion son requeridos' },
        { status: 400 }
      )
    }

    if (!['aprobar', 'rechazar'].includes(accion)) {
      return NextResponse.json(
        { error: 'accion debe ser "aprobar" o "rechazar"' },
        { status: 400 }
      )
    }

    // Obtener la solicitud
    const solicitud = await prisma.solicitud_profesor.findUnique({
      where: { id_solicitud: parseInt(id_solicitud) }
    })

    if (!solicitud) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    if (solicitud.estado !== 'PENDIENTE') {
      return NextResponse.json(
        { error: 'Esta solicitud ya ha sido procesada' },
        { status: 400 }
      )
    }

    if (accion === 'aprobar') {
      // Normalizar email de la solicitud
      const normalizedEmail = normalizeEmail(solicitud.email);
      
      // Verificar que no existe un usuario con ese email
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email: normalizedEmail }
      })

      if (usuarioExistente) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este email' },
          { status: 400 }
        )
      }

      // Generar contraseña temporal si no se proporciona
      const passwordTemporal = password || Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(passwordTemporal, 12)

      // Crear el usuario profesor
      const nuevoProfesor = await prisma.usuario.create({
        data: {
          nombre: solicitud.nombre,
          apellido: solicitud.apellido,
          email: normalizedEmail, // Usar email normalizado
          password: hashedPassword,
          rol: 'PROFESOR',
          verificado: true, // ✅ Se marca como verificado automáticamente al ser aprobado por admin
          debe_cambiar_password: true // ✅ Debe cambiar contraseña en el primer login
        }
      })

      // Actualizar la solicitud
      await prisma.solicitud_profesor.update({
        where: { id_solicitud: parseInt(id_solicitud) },
        data: {
          estado: 'APROBADA',
          fecha_revision: new Date(),
          comentario_revision: comentario_revision || `Solicitud aprobada. Usuario creado con ID: ${nuevoProfesor.id}`
        }
      })

      // 📧 Enviar credenciales por correo electrónico
      try {
        await sendTeacherCredentials(
          normalizedEmail, // Usar email normalizado
          nuevoProfesor.nombre,
          nuevoProfesor.apellido,
          normalizedEmail, // Usar email normalizado
          passwordTemporal
        );
        console.log('📧 Email de credenciales enviado a:', normalizedEmail);
      } catch (emailError) {
        console.error('❌ Error al enviar email de credenciales:', emailError);
        // No fallar todo el proceso si el email falla
      }

      console.log('✅ Profesor aprobado y usuario creado:', nuevoProfesor.email)

      return NextResponse.json({
        message: 'Solicitud aprobada exitosamente',
        usuario_creado: {
          id_usuario: nuevoProfesor.id,
          email: nuevoProfesor.email,
          nombre: nuevoProfesor.nombre,
          apellido: nuevoProfesor.apellido,
          verificado: true,
          credenciales_enviadas: true
        }
      })

    } else if (accion === 'rechazar') {
      // Actualizar la solicitud como rechazada
      await prisma.solicitud_profesor.update({
        where: { id_solicitud: parseInt(id_solicitud) },
        data: {
          estado: 'RECHAZADA',
          fecha_revision: new Date(),
          comentario_revision: comentario_revision || 'Solicitud rechazada por el administrador'
        }
      })

      console.log('❌ Solicitud rechazada:', solicitud.email)

      return NextResponse.json({
        message: 'Solicitud rechazada exitosamente'
      })
    }
  } catch (error) {
    console.error('Error al procesar solicitud:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}