// src/app/api/tipos-processo/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET → Lista todos os tipos de processo
export async function GET() {
  try {
    const tipos = await prisma.tipoProcesso.findMany({
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(tipos);
  } catch (error) {
    console.error("Erro ao buscar tipos de processo:", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// POST → Cria novo tipo de processo
export async function POST(req: Request) {
  try {
    const { nome, descricao } = await req.json();

    if (!nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const novo = await prisma.tipoProcesso.create({
      data: { nome, descricao },
    });

    return NextResponse.json(novo, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tipo de processo:", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
