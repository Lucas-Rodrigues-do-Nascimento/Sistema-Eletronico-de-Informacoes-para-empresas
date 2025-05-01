import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 🧹 Remove permissões antigas (se existirem)
  await prisma.permissao.deleteMany({
    where: {
      codigo: {
        in: ['ACESSO_SIGILOSO', 'ACESSO_RESTRITO'],
      },
    },
  })

  // ✅ Cria as permissões atuais
  const permissoes = [
    {
      nome: 'Assinatura',
      codigo: 'assinatura',
      descricao: 'Pode assinar digitalmente documentos internos.',
    },
    {
      nome: 'Mudar de Setor',
      codigo: 'mudar_setor',
      descricao: 'Pode alternar o setor atual para visualizar processos de outros setores.',
    },
    {
      nome: 'Ver Arquivados',
      codigo: 'ver_arquivados',
      descricao: 'Pode visualizar processos arquivados.',
    },
    {
      nome: 'Exportar Documentos',
      codigo: 'exportar_documentos',
      descricao: 'Pode baixar documentos individualmente ou em lote (ZIP).',
    },
  ]

  for (const perm of permissoes) {
    await prisma.permissao.upsert({
      where: { codigo: perm.codigo },
      update: {
        nome: perm.nome,
        descricao: perm.descricao,
      },
      create: perm,
    })
  }

  console.log('✅ Seed executado com sucesso: permissões atualizadas e antigas removidas.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
