import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const processo = await prisma.processo.create({
      data: {
        tipo: data.tipo,
        especificacao: data.especificacao,
        interessado: data.interessado,
        observacoes: data.observacoes || null,
        acesso: data.acesso,
      },
    });

    return NextResponse.json(processo);
  } catch (error) {
    console.error("Erro ao criar processo:", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
