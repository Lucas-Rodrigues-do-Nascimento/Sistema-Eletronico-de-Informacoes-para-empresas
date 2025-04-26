import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic';

// GET → Lista todos os setores com unidade vinculada
export async function GET() {
  try {
    const setores = await prisma.setor.findMany({
      include: {
        unidade: true,
      },
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json(setores);
  } catch (error) {
    console.error('Erro ao buscar setores:', error);
    return new NextResponse('Erro ao buscar setores', { status: 500 });
  }
}

// POST → Cria um novo setor
export async function POST(req: Request) {
  try {
    const { nome, unidadeId } = await req.json();

    if (!nome || !unidadeId) {
      return NextResponse.json({ error: 'Nome e unidade são obrigatórios' }, { status: 400 });
    }

    const novoSetor = await prisma.setor.create({
      data: {
        nome,
        unidadeId: Number(unidadeId),
      },
    });

    return NextResponse.json(novoSetor, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar setor:', error);
    return new NextResponse('Erro ao criar setor', { status: 500 });
  }
}