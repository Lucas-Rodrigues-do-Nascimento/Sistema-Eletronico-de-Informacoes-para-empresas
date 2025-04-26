import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const colaboradores = await prisma.colaborador.findMany({
      include: {
        setor: {
          select: {
            id: true,
            nome: true,
          },
        },
        permissoes: {
          select: {
            id: true,
            nome: true,
            codigo: true,
          },
        },
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json(colaboradores);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('[GET /api/colaboradores/listar]', err.message);
      return NextResponse.json(
        { error: 'Erro ao listar colaboradores', details: err.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Erro desconhecido' }, { status: 500 });
  }
}
