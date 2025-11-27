// src/lib/chatToken.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { sign } from 'jsonwebtoken';

export interface ChatTokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Genera un token JWT para el servidor de chat WebSocket
 */
export function generateChatToken(userId: string, email: string, role: string): string {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET is not configured');
  }

  const payload: ChatTokenPayload = {
    userId,
    email,
    role,
  };

  // Token válido por 24 horas
  return sign(payload, secret, { expiresIn: '24h' });
}

/**
 * Obtiene el token de chat para la sesión actual (server-side)
 */
export async function getChatTokenServer() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  return generateChatToken(
    String(session.user.id),
    session.user.email || '',
    session.user.rol || 'ESTUDIANTE'
  );
}

/**
 * Endpoint helper para obtener el token de chat (client-side)
 */
export async function getChatTokenClient(): Promise<string | null> {
  try {
    const response = await fetch('/api/chat/token');
    
    if (!response.ok) {
      console.error('Failed to get chat token:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error getting chat token:', error);
    return null;
  }
}
