import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET – Lista todas as classificações
export async function GET() {
  try {
    const classificacoes = await prisma.classificacao.findMany({
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(classificacoes);
  } catch (error) {
    console.error("Erro ao buscar classificações:", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// POST – Cria nova classificação
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, descricao } = body;

    if (!nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const nova = await prisma.classificacao.create({
      data: { nome, descricao },
    });

    return NextResponse.json(nova, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar classificação:", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
