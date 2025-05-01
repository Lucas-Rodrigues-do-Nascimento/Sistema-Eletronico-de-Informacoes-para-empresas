// src/lib/permissoes.ts

import { Permissao } from '@prisma/client'

/**
 * Verifica se o colaborador possui a permissão indicada.
 * Considera que 'admin' pode tudo.
 * 
 * @param colaborador - objeto com lista de permissões
 * @param codigo - código da permissão a verificar
 * @returns booleano indicando se possui ou não a permissão
 */
export function possuiPermissao(
  colaborador: { permissoes: Permissao[] },
  codigo: string
): boolean {
  return colaborador.permissoes?.some(
    (p) => p.codigo === codigo || p.codigo === 'admin'
  ) ?? false
}
