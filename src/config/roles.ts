// Centralización de roles y permisos para toda la app

export type AppRole = 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE' | 'SUPERADMIN';

export const ROLES: Record<AppRole, {
  label: string;
  color: string;
  permissions: string[];
}> = {
  ADMIN: {
    label: 'Administrador',
    color: 'bg-blue-600',
    permissions: [
      'read:all',
      'update:all',
      'delete:all',
      'create:user',
      'create:config',
      'create:payment',
      // ...otros permisos
    ],
  },
  PROFESOR: {
    label: 'Profesor',
    color: 'bg-green-600',
    permissions: [
      'read:own',
      'update:own',
      'read:students',
      // ...otros permisos
    ],
  },
  ESTUDIANTE: {
    label: 'Estudiante',
    color: 'bg-yellow-600',
    permissions: [
      'read:own',
      'update:own',
      // ...otros permisos
    ],
  },
  SUPERADMIN: {
    label: 'Super Admin',
    color: 'bg-red-700',
    permissions: [
      'all',
    ],
  },
};

export function getRoleColor(role: AppRole): string {
  return ROLES[role]?.color || 'bg-gray-400';
}

export function getRoleLabel(role: AppRole): string {
  return ROLES[role]?.label || role;
}
