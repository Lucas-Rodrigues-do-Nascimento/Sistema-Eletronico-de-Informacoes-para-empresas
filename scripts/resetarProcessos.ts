// scripts/resetarProcessos.ts
const prisma = require('../src/lib/prisma').default;

async function resetarTudoDosProcessos() {
  try {
    console.log('🧨 Limpando movimentações...');
    await prisma.movimentacao.deleteMany();

    console.log('🧨 Limpando documentos...');
    await prisma.documento.deleteMany();

    console.log('🧨 Limpando controles de acesso...');
    await prisma.controleAcesso.deleteMany();

    console.log('🧨 Limpando processos...');
    await prisma.processo.deleteMany();

    console.log('✅ Processos e dados relacionados foram apagados com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao limpar os dados:', err);
  } finally {
    process.exit();
  }
}

resetarTudoDosProcessos();
