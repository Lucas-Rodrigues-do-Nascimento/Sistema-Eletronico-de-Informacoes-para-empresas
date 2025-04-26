import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET → Listar todos os tipos de documento
export async function GET() {
  try {
    const tipos = await prisma.tipoDocumento.findMany({
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(tipos);
  } catch (error) {
    console.error("❌ Erro ao buscar tipos de documento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST → Criar novo tipo de documento
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = body?.nome?.trim();
    const descricao = body?.descricao?.trim() || null;

    if (!nome) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    const tipo = await prisma.tipoDocumento.create({
      data: {
        nome,
        descricao,
      },
    });

    return NextResponse.json(tipo, { status: 201 });
  } catch (error) {
    console.error("❌ Erro ao criar tipo de documento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
