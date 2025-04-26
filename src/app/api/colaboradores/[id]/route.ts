import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/* ───────────── PATCH → Editar colaborador ───────────── */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const colaboradorId = Number(params.id);

  if (isNaN(colaboradorId)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  const { nome, email, cpf, telefone, cargo, setorId, permissoes } = await req.json(); // 👈 agora é permissoes (plural)

  if (!nome || !email || !cpf || !setorId || !permissoes || !Array.isArray(permissoes)) {
    return NextResponse.json(
      { error: 'Nome, Email, CPF, Setor e Permissões são obrigatórios.' },
      { status: 400 }
    );
  }

  try {
    const colaborador = await prisma.colaborador.update({
      where: { id: colaboradorId },
      data: {
        nome,
        email,
        cpf,
        telefone,
        cargo,
        setor: {
          connect: { id: Number(setorId) },
        },
        permissoes: {
          set: permissoes.map((id: number) => ({ id })), // 👈 atualiza todas as permissões
        },
      },
    });

    return NextResponse.json(colaborador, { status: 200 });
  } catch (err) {
    console.error('[PATCH /api/colaboradores/[id]]', err);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar colaborador.' },
      { status: 500 }
    );
  }
}

/* ───────────── DELETE → Excluir colaborador ───────────── */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const colaboradorId = Number(params.id);

  if (isNaN(colaboradorId)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  try {
    await prisma.colaborador.delete({ where: { id: colaboradorId } });
    return NextResponse.json({ message: 'Colaborador excluído com sucesso.' });
  } catch (err) {
    console.error('[DELETE /api/colaboradores/[id]]', err);
    return NextResponse.json(
      { error: 'Erro interno ao excluir colaborador.' },
      { status: 500 }
    );
  }
}
