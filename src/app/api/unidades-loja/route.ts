// src/app/api/unidades-loja/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET → Lista todas as unidades de loja com seus setores
export async function GET() {
  try {
    const unidades = await prisma.unidadeLoja.findMany({
      include: { setores: true },
      orderBy: { nome: 'asc' },
    });
    return NextResponse.json(unidades);
  } catch (err) {
    console.error('Erro ao buscar unidades de loja:', err);
    return new NextResponse('Erro ao buscar unidades de loja', { status: 500 });
  }
}

// POST → Cadastra nova unidade
export async function POST(req: Request) {
  try {
    const { nome, endereco } = await req.json();

    if (!nome) {
      return NextResponse.json(
        { error: 'O nome da unidade é obrigatório' },
        { status: 400 }
      );
    }

    const novaUnidade = await prisma.unidadeLoja.create({
      data: {
        nome,
        descricao: endereco, // Assumindo que `endereco` vai para o campo `descricao` do banco
      },
    });

    return NextResponse.json(novaUnidade, { status: 201 });
  } catch (err) {
    console.error('Erro ao criar unidade de loja:', err);
    return new NextResponse('Erro ao criar unidade de loja', { status: 500 });
  }
}
