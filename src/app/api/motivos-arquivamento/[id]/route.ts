import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT → Atualiza um motivo de arquivamento
export async function PUT(
  req: Request,
  context: Awaited<{ params: { id: string } }>
) {
  const { params } = await context;
  const id = Number(params.id);
  const { descricao } = await req.json();

  if (!descricao) {
    return NextResponse.json({ error: "Descrição é obrigatória" }, { status: 400 });
  }

  try {
    const atualizado = await prisma.motivoArquivamento.update({
      where: { id },
      data: { descricao },
    });

    return NextResponse.json(atualizado);
  } catch (error) {
    console.error("Erro ao atualizar motivo:", error);
    return new NextResponse("Erro interno ao atualizar", { status: 500 });
  }
}

// DELETE → Exclui um motivo de arquivamento
export async function DELETE(
  _req: Request,
  context: Awaited<{ params: { id: string } }>
) {
  const { params } = await context;
  const id = Number(params.id);

  try {
    await prisma.motivoArquivamento.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir motivo:", error);
    return new NextResponse("Erro interno ao excluir", { status: 500 });
  }
}
