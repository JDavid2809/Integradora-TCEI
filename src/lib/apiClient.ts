// Ligero wrapper fetch con manejo básico de errores y abort opcional
// Se puede extender para incluir reintentos, logging o métricas

export interface ApiError extends Error {
  status?: number
  details?: unknown
}

export async function api<T>(input: string, init?: RequestInit & { signal?: AbortSignal }): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  })

  if (!res.ok) {
    let body: any = null
    try { body = await res.json() } catch { /* ignore */ }
    const error: ApiError = new Error(body?.error || `Error ${res.status}`)
    error.status = res.status
    error.details = body
    throw error
  }

  // Permitir 204 No Content
  if (res.status === 204) return {} as T
  return res.json() as Promise<T>
}
