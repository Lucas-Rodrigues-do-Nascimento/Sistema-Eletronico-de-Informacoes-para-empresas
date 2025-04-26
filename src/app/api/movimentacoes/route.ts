import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Extrair os dados enviados no corpo da requisição no formato JSON.
    const { processoId, deSetor, paraSetor, observacoes } = await req.json();

    // Verifica se os campos obrigatórios foram enviados
    if (!processoId || !deSetor || !paraSetor) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Cria uma nova movimentação no banco de dados
    const movimentacao = await prisma.movimentacao.create({
      data: {
        processoId: Number(processoId),
        deSetor,
        paraSetor,
        observacoes,
      },
    });

    // Retorna o registro criado com status 201 (Created)
    return NextResponse.json(movimentacao, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar movimentação:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
