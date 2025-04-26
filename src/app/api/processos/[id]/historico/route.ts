import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const processoId = Number(id);

  if (isNaN(processoId) || processoId <= 0) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const historico = await prisma.movimentacao.findMany({
      where: { processoId },
      orderBy: { criadoEm: 'desc' },
      include: {
        de: { select: { nome: true } },
        para: { select: { nome: true } },
      },
    });

    return NextResponse.json(historico);
  } catch (err) {
    console.error('[GET /api/processos/[id]/historico]', err);
    return NextResponse.json({ error: 'Erro ao carregar histórico.' }, { status: 500 });
  }
}
