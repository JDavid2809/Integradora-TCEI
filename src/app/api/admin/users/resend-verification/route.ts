import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/mailer'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado. Solo administradores.' }, { status: 403 })
    }

    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId y email son requeridos' }, { status: 400 })
    }

    // Verificar que el usuario existe y no está verificado
    const user = await prisma.usuario.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (user.verificado) {
      return NextResponse.json({ error: 'El usuario ya está verificado' }, { status: 400 })
    }

    // Generar nuevo token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    // Actualizar el token en la base de datos
    await prisma.usuario.update({
      where: { id: parseInt(userId) },
      data: {
        tokenVerif: verificationToken,
        expiraEn: tokenExpiry
      }
    })

    // Intentar enviar el correo
    let emailSent = false
    let emailError = null

    try {
      await sendVerificationEmail(email, verificationToken, user.nombre)
      emailSent = true
    } catch (error) {
      console.error('Error sending verification email:', error)
      emailError = error instanceof Error ? error.message : 'Error desconocido al enviar correo'
    }

    return NextResponse.json({
      success: emailSent,
      error: emailError,
      message: emailSent 
        ? 'Correo de verificación reenviado exitosamente'
        : 'Error al reenviar correo de verificación'
    })

  } catch (error) {
    console.error('Error in resend verification:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}