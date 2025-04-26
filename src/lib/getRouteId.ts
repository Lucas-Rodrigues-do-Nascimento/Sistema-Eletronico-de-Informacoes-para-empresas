/**
 * Devolve o penúltimo segmento de uma URL (ex.: /api/processos/1/documentos → "1").
 */
export function getRouteId(url: string): string | undefined {
    const parts = url.split('/')
    return parts.length >= 2 ? parts[parts.length - 2] : undefined
  }
  