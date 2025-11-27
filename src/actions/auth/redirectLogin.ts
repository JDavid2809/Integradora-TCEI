
'use server'

import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';

export async function getRedirectPath() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log('No session found, redirecting to login');
      return '/Login';
    }

    const rol = session.user.rol;
    console.log('Redirecting user:', session.user.email, 'with role:', rol);

    switch (rol) {
      case 'PROFESOR':
        console.log('Teacher access granted');
        return '/Teachers';
      case 'ESTUDIANTE':
        console.log('Student access granted');
        return '/Students';
      case 'ADMIN':
        console.log('Admin access granted');
        return '/Admin';
      default:
        console.log('Unknown role:', rol, 'redirecting to login');
        return '/Login';
    }
  } catch (error) {
    console.error('Error in getRedirectPath:', error);
    return '/Login';
  }
}
