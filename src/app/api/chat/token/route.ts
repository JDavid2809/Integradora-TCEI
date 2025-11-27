// src/app/api/chat/token/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { generateChatToken } from '@/lib/chatToken';

/**
 * GET /api/chat/token
 * Genera un token JWT para autenticación con el servidor WebSocket de chat
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = generateChatToken(
      String(session.user.id),
      session.user.email || '',
      session.user.rol || 'ESTUDIANTE'
    );

    return NextResponse.json({
      token,
      userId: session.user.id,
      email: session.user.email,
      role: session.user.rol,
    });
  } catch (error) {
    console.error('Error generating chat token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
