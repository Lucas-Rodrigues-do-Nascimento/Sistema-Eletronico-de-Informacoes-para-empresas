import prisma from '@/lib/prisma'

export async function podeVisualizarProcesso(processoId: number, colaboradorId: number) {
  const processo = await prisma.processo.findUnique({
    where: { id: processoId },
    select: {
      acesso: true,
      criadorId: true, // 👈 agora traz o criador
      controleAcessos: {
        where: { colaboradorId },
        select: { id: true },
      },
    },
  })

  if (!processo) {
    return false
  }

  // 1. Público? Liberado
  if (processo.acesso === 'Público') {
    return true
  }

  // 2. Criador do processo? Liberado
  if (processo.criadorId === colaboradorId) {
    return true
  }

  // 3. Está explicitamente autorizado via controleAcessos? Liberado
  if (processo.controleAcessos.length > 0) {
    return true
  }

  // 4. Sigiloso + tem permissão especial? Liberado
  if (processo.acesso === 'Sigiloso') {
    const colaborador = await prisma.colaborador.findUnique({
      where: { id: colaboradorId },
      select: {
        permissoes: {
          where: { codigo: 'ACESSO_SIGILOSO' },
          select: { id: true },
        },
      },
    })

    if (colaborador && colaborador.permissoes && colaborador.permissoes.length > 0) {
      return true
    }

    return false
  }

  // Senão, barrado
  return false
}
