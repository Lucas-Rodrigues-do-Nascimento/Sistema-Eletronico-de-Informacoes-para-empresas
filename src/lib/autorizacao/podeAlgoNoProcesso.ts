// src/lib/autorizacao/podeAlgoNoProcesso.ts
import prisma from '@/lib/prisma';
import { podeVisualizarProcesso } from './podeVisualizarProcesso'; // Importa a função que já criamos

/**
 * Verifica se um colaborador pode modificar (editar conteúdo, assinar) documentos em um processo específico.
 * @param processoId ID do processo.
 * @param colaboradorId ID do colaborador.
 * @param userPermissoes Array com os códigos das permissões do colaborador.
 * @returns true se pode modificar, false caso contrário.
 */
export async function podeModificarDocumentoNoProcesso(
  processoId: number,
  colaboradorId: number,
  userPermissoes: string[] = []
): Promise<boolean> {
  console.log(`[AuthCheck ModificarDoc] User ${colaboradorId} no Processo ${processoId}`);

  if (isNaN(processoId) || processoId <= 0 || isNaN(colaboradorId) || colaboradorId <= 0) {
    console.warn(`[AuthCheck ModificarDoc] IDs inválidos: processoId=${processoId}, colaboradorId=${colaboradorId}`);
    return false;
  }

  if (!(await podeVisualizarProcesso(processoId, colaboradorId))) {
    console.log(`[AuthCheck ModificarDoc] Negado: Não pode visualizar o processo pai (ID: ${processoId}).`);
    return false;
  }

  const processo = await prisma.processo.findUnique({
    where: { id: processoId },
    select: {
      criadorId: true,
      arquivado: true,
      controleAcessos: { // Para verificar se o usuário está na lista de acesso
        where: { colaboradorId: colaboradorId },
        select: { id: true }
      }
    },
  });

  if (!processo) {
    console.warn(`[AuthCheck ModificarDoc] Processo ${processoId} não encontrado.`);
    return false;
  }

  if (processo.arquivado) {
    console.log(`[AuthCheck ModificarDoc] Negado: Processo ID ${processoId} está arquivado.`);
    return false;
  }

  if (processo.criadorId === colaboradorId) {
    console.log(`[AuthCheck ModificarDoc] Permitido: Usuário é o criador.`);
    return true;
  }

  if (userPermissoes.includes('ADMIN')) {
    console.log(`[AuthCheck ModificarDoc] Permitido: Usuário é ADMIN.`);
    return true;
  }

  if (processo.controleAcessos.length > 0) {
    console.log(`[AuthCheck ModificarDoc] Permitido: Usuário ${colaboradorId} está no ControleAcesso do Processo ${processoId}.`);
    return true;
  }

  console.log(`[AuthCheck ModificarDoc] Negado: Nenhuma regra de modificação atendida.`);
  return false;
}


/**
 * Verifica se um colaborador pode excluir documentos de um processo específico.
 * @param processoId ID do processo.
 * @param colaboradorId ID do colaborador.
 * @param userPermissoes Array com os códigos das permissões do colaborador.
 * @returns true se pode excluir, false caso contrário.
 */
export async function podeExcluirDocumentoDoProcesso(
  processoId: number,
  colaboradorId: number,
  userPermissoes: string[] = []
): Promise<boolean> {
  console.log(`[AuthCheck ExcluirDoc] User ${colaboradorId} no Processo ${processoId}`);

  if (isNaN(processoId) || processoId <= 0 || isNaN(colaboradorId) || colaboradorId <= 0) {
    console.warn(`[AuthCheck ExcluirDoc] IDs inválidos: processoId=${processoId}, colaboradorId=${colaboradorId}`);
    return false;
  }

  if (!(await podeVisualizarProcesso(processoId, colaboradorId))) {
    console.log(`[AuthCheck ExcluirDoc] Negado: Não pode visualizar o processo pai (ID: ${processoId}).`);
    return false;
  }

  const processo = await prisma.processo.findUnique({
    where: { id: processoId },
    select: {
      criadorId: true,
      arquivado: true,
    },
  });

  if (!processo) {
    console.warn(`[AuthCheck ExcluirDoc] Processo ${processoId} não encontrado.`);
    return false;
  }

  if (processo.arquivado) {
    console.log(`[AuthCheck ExcluirDoc] Negado: Processo ID ${processoId} está arquivado.`);
    return false;
  }

  if (processo.criadorId === colaboradorId) {
    console.log(`[AuthCheck ExcluirDoc] Permitido: Usuário é o criador.`);
    return true;
  }

  if (userPermissoes.includes('ADMIN')) {
    console.log(`[AuthCheck ExcluirDoc] Permitido: Usuário é ADMIN.`);
    return true;
  }

  // Para exclusão, não vamos permitir que quem está apenas no ControleAcesso possa excluir,
  // a menos que você defina uma regra específica para isso.
  // Apenas Criador e ADMIN podem excluir por padrão nesta lógica.

  console.log(`[AuthCheck ExcluirDoc] Negado: Nenhuma regra de exclusão atendida.`);
  return false;
}