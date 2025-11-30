import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const consent = !!body?.consent

    const userId = parseInt(session.user.id)
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: 'Usuario inválido' }, { status: 400 })
    }

    // Actualizar la tabla usuario con la preferencia
    await prisma.usuario.update({
      where: { id: userId },
      data: { ai_consent: consent },
    })

    return NextResponse.json({ success: true, consent })
  } catch (err) {
    console.error('Error in ai-consent route:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
