import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const processoId = Number(id);

  if (isNaN(processoId) || processoId <= 0) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const processo = await prisma.processo.findUnique({
      where: { id: processoId },
      include: {
        documentos: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            criadoEm: true,
          },
        },
        movimentacoes: {
          include: {
            de: { select: { nome: true } },
            para: { select: { nome: true } },
          },
        },
      },
    });

    if (!processo) {
      return NextResponse.json({ error: 'Processo não encontrado' }, { status: 404 });
    }

    return NextResponse.json(processo);
  } catch (error: any) {
    console.error('[ERRO_GET_PROCESSO]', error?.message || error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar processo', detalhe: error?.message },
      { status: 500 }
    );
  }
}
