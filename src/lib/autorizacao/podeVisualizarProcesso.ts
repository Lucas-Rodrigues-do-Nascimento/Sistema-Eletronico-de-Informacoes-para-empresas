// src/lib/autorizacao/podeVisualizarProcesso.ts
import prisma from '@/lib/prisma';

/**
 * Verifica se um colaborador específico tem permissão para visualizar um processo.
 * Lógica:
 * 1. Se o processo é 'Público', permite.
 * 2. Se o colaborador é o criador do processo, permite (para 'Restrito' ou 'Sigiloso').
 * 3. Se o colaborador está na lista de ControleAcesso do processo, permite (para 'Restrito' ou 'Sigiloso').
 * 4. Caso contrário, nega.
 *
 * @param processoId ID do processo a ser verificado.
 * @param colaboradorId ID do colaborador tentando visualizar.
 * @returns true se o colaborador pode visualizar, false caso contrário.
 */
export async function podeVisualizarProcesso(
  processoId: number,
  colaboradorId: number
): Promise<boolean> {
  // Validações básicas de entrada
  if (isNaN(processoId) || processoId <= 0) {
    console.warn(`[podeVisualizarProcesso] Tentativa de verificação com processoId inválido: ${processoId}`);
    return false;
  }
  if (isNaN(colaboradorId) || colaboradorId <= 0) {
    console.warn(`[podeVisualizarProcesso] Tentativa de verificação com colaboradorId inválido: ${colaboradorId} para processo ${processoId}`);
    return false;
  }

  // Busca o processo e informações relevantes para a decisão de acesso
  const processo = await prisma.processo.findUnique({
    where: { id: processoId },
    select: {
      acesso: true,      // Nível de acesso do processo ('Público', 'Restrito', 'Sigiloso')
      criadorId: true,   // ID do colaborador que criou o processo
      controleAcessos: { // Verifica se o colaboradorId atual está na lista de acesso explícito
        where: { colaboradorId: colaboradorId },
        select: { id: true }, // Só precisamos saber se a entrada existe para este colaborador
      },
    },
  });

  // Se o processo não for encontrado no banco, o usuário não pode visualizá-lo
  if (!processo) {
    console.warn(`[podeVisualizarProcesso] Processo ID ${processoId} não encontrado no banco de dados.`);
    return false;
  }

  console.log(`[podeVisualizarProcesso] Verificando acesso para Colaborador ID: ${colaboradorId} ao Processo ID: ${processoId}. Detalhes do Processo: Acesso=${processo.acesso}, CriadorID=${processo.criadorId}, ControleAcessoPresente=${processo.controleAcessos.length > 0}`);

  // 1. Processo Público: Sempre visível por qualquer usuário que possa acessar o sistema.
  if (processo.acesso === 'Público') {
    console.log(`[podeVisualizarProcesso] Permitido: Processo ID ${processoId} é Público.`);
    return true;
  }

  // 2. Usuário é o Criador do Processo:
  //    Pode visualizar independentemente do nível de acesso ser 'Restrito' ou 'Sigiloso'.
  if (processo.criadorId === colaboradorId) {
    console.log(`[podeVisualizarProcesso] Permitido: Colaborador ID ${colaboradorId} é o Criador do Processo ID ${processoId} (Acesso: ${processo.acesso}).`);
    return true;
  }

  // 3. Usuário está na Lista de Controle de Acesso Explícito para este processo:
  //    Pode visualizar independentemente do nível de acesso ser 'Restrito' ou 'Sigiloso'.
  //    A query já filtrou `controleAcessos` para o `colaboradorId` atual.
  if (processo.controleAcessos.length > 0) {
    console.log(`[podeVisualizarProcesso] Permitido: Colaborador ID ${colaboradorId} está no Controle de Acesso do Processo ID ${processoId} (Acesso: ${processo.acesso}).`);
    return true;
  }

  // Se nenhuma das condições acima foi atendida (ex: processo é 'Restrito' ou 'Sigiloso'
  // e o usuário não é criador nem está na lista de controleAcesso), então o acesso é negado.
  console.log(`[podeVisualizarProcesso] Negado: Nenhuma regra de acesso aplicável foi atendida para Colaborador ID ${colaboradorId} no Processo ID ${processoId} (Acesso: ${processo.acesso}).`);
  return false;
}