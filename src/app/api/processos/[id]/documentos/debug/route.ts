import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const processoId = Number(id);

    if (isNaN(processoId) || processoId <= 0) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Autenticação básica
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar processo com documentos e movimentações
    const processo = await prisma.processo.findUnique({
      where: { id: processoId },
      include: {
        documentos: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            assinadoPor: true,
            assinadoEm: true,
            criadoEm: true,
          },
        },
        movimentacoes: true,
      },
    });

    if (!processo) {
      return NextResponse.json({ error: 'Processo não encontrado' }, { status: 404 });
    }

    // Vamos formatar os dados para facilitar a análise
    const resultado = {
      processo: {
        id: processo.id,
        numero: processo.numero,
        arquivado: processo.arquivado,
      },
      documentos: processo.documentos.map(doc => ({
        id: doc.id,
        nome: doc.nome,
        tipo: doc.tipo,
        assinado: !!doc.assinadoPor,
        assinadoPor: doc.assinadoPor,
        assinadoEm: doc.assinadoEm,
        assinadoEmStr: doc.assinadoEm ? new Date(doc.assinadoEm).toISOString() : null,
        tipoAssinadoEm: typeof doc.assinadoEm,
        criadoEm: new Date(doc.criadoEm).toISOString(),
      })),
      movimentacoes: processo.movimentacoes.map(mov => ({
        id: mov.id,
        deSetor: mov.deSetor,
        paraSetor: mov.paraSetor,
        ativo: mov.ativo,
        criadoEm: new Date(mov.criadoEm).toISOString(),
      })),
      movimentacoesAtivas: processo.movimentacoes.filter(m => m.ativo).length,
      temDocumentosAssinados: processo.documentos.some(d => d.assinadoPor !== null),
      podeEditar: {
        semMovimentacoes: processo.movimentacoes.length === 0,
        semMovimentacoesAtivas: !processo.movimentacoes.some(m => m.ativo),
      }
    };

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('[ERRO_DEBUG_PROCESSO]', error?.message || error);
    return NextResponse.json(
      { error: 'Erro interno ao debugar processo', detalhe: error?.message },
      { status: 500 }
    );
  }
} 