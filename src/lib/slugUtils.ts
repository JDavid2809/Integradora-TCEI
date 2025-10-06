/**
 * Convierte un texto a formato slug
 * @param text - Texto a convertir
 * @returns Slug formateado
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Reemplazar caracteres especiales españoles
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c')
    // Remover caracteres especiales y espacios
    .replace(/[^a-z0-9\s-]/g, '')
    // Reemplazar espacios y múltiples guiones con un solo guión
    .replace(/[\s-]+/g, '-')
    // Remover guiones al inicio y final
    .replace(/^-+|-+$/g, '')
}

/**
 * Convierte un slug de vuelta a un formato más legible
 * @param slug - Slug a convertir
 * @returns Texto legible
 */
export function slugToText(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}