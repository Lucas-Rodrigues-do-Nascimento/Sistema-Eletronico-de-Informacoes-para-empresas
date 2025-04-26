import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const permissoes = await prisma.permissao.findMany({
      orderBy: { nome: 'asc' },
    });
    return NextResponse.json(permissoes);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('[GET /api/permissoes]', err.message);
      return NextResponse.json({ error: 'Erro ao listar permissões', details: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Erro desconhecido' }, { status: 500 });
  }
}
