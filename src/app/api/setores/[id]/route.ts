import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic';

// PUT → Atualiza setor existente
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const { nome, unidadeId } = await req.json();

  if (!nome || !unidadeId) {
    return NextResponse.json({ error: 'Nome e unidade são obrigatórios' }, { status: 400 });
  }

  try {
    const atualizado = await prisma.setor.update({
      where: { id },
      data: {
        nome,
        unidadeId: Number(unidadeId),
      },
    });

    return NextResponse.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar setor:', error);
    return new NextResponse('Erro ao atualizar setor', { status: 500 });
  }
}

// DELETE → Exclui setor existente
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  try {
    await prisma.setor.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao excluir setor:', error);
    return new NextResponse('Erro ao excluir setor', { status: 500 });
  }
}
