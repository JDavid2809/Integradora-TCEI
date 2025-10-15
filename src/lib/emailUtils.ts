/**
 * Normaliza un email a minúsculas y elimina espacios
 * @param email - El email a normalizar
 * @returns Email normalizado
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Valida el formato de un email
 * @param email - El email a validar
 * @returns true si el email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}