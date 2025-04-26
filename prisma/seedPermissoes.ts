import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const permissoes = [
    {
      nome: 'Administrador',
      codigo: 'admin',
      descricao: 'Acesso total ao sistema. Pode gerenciar usuários, setores e permissões.'
    },
    {
      nome: 'Gestor de Setor',
      codigo: 'gestor_setor',
      descricao: 'Visualiza e gerencia processos do setor. Pode tramitar e assinar documentos.'
    },
    {
      nome: 'Servidor',
      codigo: 'servidor',
      descricao: 'Pode visualizar, criar e editar documentos e processos do setor. Sem assinatura.'
    },
    {
      nome: 'Assinador',
      codigo: 'assinador',
      descricao: 'Pode assinar digitalmente documentos.'
    },
    {
      nome: 'Visualizador',
      codigo: 'visualizador',
      descricao: 'Apenas leitura de processos e documentos públicos e do setor.'
    },
    {
      nome: 'Controle de Documentos',
      codigo: 'controle_doc',
      descricao: 'Pode cadastrar tipos de documentos, arquivar processos e reabrir.'
    },
    {
      nome: 'Protocolo Geral',
      codigo: 'protocolo_geral',
      descricao: 'Cria novos processos e recebe documentos externos.'
    },
    {
      nome: 'Restrito',
      codigo: 'restrito',
      descricao: 'Acesso apenas a processos públicos ou vinculados diretamente.'
    },
    {
      nome: 'Sigiloso',
      codigo: 'sigiloso',
      descricao: 'Pode ver e tramitar processos marcados como sigilosos.'
    },
    {
      nome: 'TI / Suporte',
      codigo: 'suporte',
      descricao: 'Acesso ao painel de administração e manutenção técnica.'
    }
  ];

  for (const permissao of permissoes) {
    await prisma.permissao.upsert({
      where: { codigo: permissao.codigo },
      update: {},
      create: permissao
    });
  }

  console.log('✅ Permissões inseridas com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());