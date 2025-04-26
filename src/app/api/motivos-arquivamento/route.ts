import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET → Lista todos os motivos de arquivamento
export async function GET() {
  try {
    const motivos = await prisma.motivoArquivamento.findMany({
      orderBy: { descricao: "asc" },
    });
    return NextResponse.json(motivos);
  } catch (error) {
    console.error("Erro ao buscar motivos:", error);
    return new NextResponse("Erro ao buscar motivos", { status: 500 });
  }
}

// POST → Cria um novo motivo
export async function POST(req: Request) {
  try {
    const { descricao } = await req.json();

    if (!descricao || descricao.trim() === "") {
      return NextResponse.json({ error: "Descrição é obrigatória" }, { status: 400 });
    }

    const novoMotivo = await prisma.motivoArquivamento.create({
      data: { descricao },
    });

    return NextResponse.json(novoMotivo, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar motivo:", error);
    return new NextResponse("Erro ao criar motivo", { status: 500 });
  }
}
