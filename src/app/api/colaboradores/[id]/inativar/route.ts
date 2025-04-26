import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/* ───────────── PATCH → Inativar ou Ativar colaborador ───────────── */
export async function PATCH(
  _req: Request,
  context: Awaited<{ params: { id: string } }>
) {
  const colaboradorId = Number(context.params.id);

  if (isNaN(colaboradorId)) {
    return NextResponse.json(
      { error: 'ID do colaborador inválido.' },
      { status: 400 }
    );
  }

  try {
    const colaborador = await prisma.colaborador.findUnique({
      where: { id: colaboradorId },
    });

    if (!colaborador) {
      return NextResponse.json(
        { error: 'Colaborador não encontrado.' },
        { status: 404 }
      );
    }

    const atualizado = await prisma.colaborador.update({
      where: { id: colaboradorId },
      data: { ativo: !colaborador.ativo },
    });

    return NextResponse.json(atualizado, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/colaboradores/[id]/inativar]', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar colaborador.' },
      { status: 500 }
    );
  }
}
