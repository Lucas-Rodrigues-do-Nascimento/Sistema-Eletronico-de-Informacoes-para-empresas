import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  context: { params: { id: string } }
) {
  const id = Number(context.params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const permissao = await prisma.permissao.findUnique({
      where: { id },
      include: {
        colaboradores: { select: { id: true, nome: true } },
      },
    });

    if (!permissao) {
      return NextResponse.json({ error: 'Permissão não encontrada' }, { status: 404 });
    }

    return NextResponse.json(permissao);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('[GET /api/permissoes/[id]]', err.message);
      return NextResponse.json({ error: 'Erro ao buscar permissão', details: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Erro desconhecido' }, { status: 500 });
  }
}
