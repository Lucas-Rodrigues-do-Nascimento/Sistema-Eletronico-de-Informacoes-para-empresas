import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1) Unidade de Loja padrão
  let matriz = await prisma.unidadeLoja.findFirst({
    where: { nome: "Matriz" },
  });

  if (!matriz) {
    matriz = await prisma.unidadeLoja.create({
      data: {
        nome: "Matriz",
        cidade: "São Paulo",
        uf: "SP",
      },
    });
  }

  // 2) Setor TI
  let setorTI = await prisma.setor.findFirst({
    where: { nome: "TI" },
  });

  if (!setorTI) {
    setorTI = await prisma.setor.create({
      data: {
        nome: "TI",
        unidadeId: matriz.id,
      },
    });
  }

  // 3) Permissão ADMIN
  const permAdmin = await prisma.permissao.upsert({
    where: { codigo: "admin" },
    update: {},
    create: {
      nome: "Administrador",
      codigo: "admin",
      descricao: "Acesso total ao sistema. Pode gerenciar usuários, setores e permissões.",
    },
  });

  // 4) Usuário admin (não altera se já existir)
  const email = "admin@proton.local";
  const senhaPlana = "admin123";
  const senhaHash = await bcrypt.hash(senhaPlana, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: senhaHash,
      nome: "Admin Core",
    },
  });

  // 5) Apenas cria o colaborador se ainda não existir
  const colaboradorExistente = await prisma.colaborador.findUnique({ where: { email } });

  if (!colaboradorExistente) {
    await prisma.colaborador.create({
      data: {
        nome: "Admin Core",
        email,
        cpf: "00000000000",
        telefone: "000000000",
        cargo: "Administrador",
        senha: senhaHash,
        ativo: true,
        setorId: setorTI.id,
        permissaoId: permAdmin.id,
      },
    });
  }

  // 6) Processo-exemplo
  await prisma.processo.upsert({
    where: { numero: "01/2025" },
    update: {},
    create: {
      numero: "01/2025",
      tipo: "MEMORANDO",
      especificacao: "Compra de materiais de escritório",
      interessado: "Empresa X",
      acesso: "Público",
      setorOrigem: { connect: { id: setorTI.id } },
    },
  });

  console.log("✅ Seed concluído | admin@proton.local / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());