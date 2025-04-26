import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/* ───────────── PATCH → Alterar senha do colaborador ───────────── */
export async function PATCH(
  req: Request,
  context: Awaited<{ params: { id: string } }>
) {
  const colaboradorId = Number(context.params.id);
  const { novaSenha } = await req.json();

  if (isNaN(colaboradorId) || !novaSenha) {
    return NextResponse.json(
      { error: 'ID do colaborador e nova senha são obrigatórios.' },
      { status: 400 }
    );
  }

  try {
    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

    await prisma.colaborador.update({
      where: { id: colaboradorId },
      data: { senha: senhaCriptografada },
    });

    return NextResponse.json({ message: 'Senha atualizada com sucesso.' }, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/colaboradores/[id]/alterar-senha]', error);
    return NextResponse.json(
      { error: 'Erro interno ao alterar senha do colaborador.' },
      { status: 500 }
    );
  }
}
