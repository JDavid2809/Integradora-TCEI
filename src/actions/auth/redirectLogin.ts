
'use server'


import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';

export async function getRedirectPath() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return '/Login';
  }

  const rol = session.user.rol;

  if (rol === 'PROFESOR') return '/Teachers';
  if (rol === 'ESTUDIANTE') return '/Students';
  if (rol === 'ADMIN') return '/Admin';

  return '/'; // ruta por defecto
}
