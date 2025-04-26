import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// PUT → Atualiza uma unidade
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const { nome, descricao } = await req.json();

  if (!nome) {
    return NextResponse.json(
      { error: "O nome é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const atualizada = await prisma.unidadeLoja.update({
      where: { id },
      data: { nome, descricao },
    });

    return NextResponse.json(atualizada);
  } catch (error) {
    console.error("Erro ao atualizar unidade:", error);
    return new NextResponse("Erro ao atualizar", { status: 500 });
  }
}

// DELETE → Exclui uma unidade
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  try {
    await prisma.unidadeLoja.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir unidade:", error);
    return new NextResponse("Erro ao excluir", { status: 500 });
  }
}
