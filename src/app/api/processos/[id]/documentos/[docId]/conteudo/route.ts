// src/app/api/processos/[id]/documentos/[docId]/conteudo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// --- IMPORTAR A FUNÇÃO DE VERIFICAÇÃO DE PERMISSÃO ---
import { podeVisualizarProcesso } from '@/lib/autorizacao/podeVisualizarProcesso'; // Ajuste o caminho se necessário

export const dynamic = 'force-dynamic';

interface ContextParams {
  id: string;     // ID do Processo
  docId: string;  // ID do Documento
}

export async function GET(
  request: NextRequest,
  { params }: { params: ContextParams }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    const userId = Number(session.user.id); // ID do usuário logado

    const processoId = Number(params.id);
    const documentoId = Number(params.docId);

    if (isNaN(processoId) || processoId <= 0) {
      return NextResponse.json({ error: 'ID de processo inválido na URL' }, { status: 400 });
    }
    if (isNaN(documentoId) || documentoId <= 0) {
      return NextResponse.json({ error: 'ID de documento inválido na URL' }, { status: 400 });
    }
    if (isNaN(userId)) { // Validação extra para o ID do usuário da sessão
        console.error("[API Doc Conteudo] ID de usuário da sessão é inválido:", session.user.id);
        return NextResponse.json({ error: 'Erro de autenticação: ID de usuário inválido' }, { status: 401 });
    }

    // --- Verificação de Permissão para Visualizar o Processo Pai ---
    console.log(`[API Doc Conteudo] Verificando permissão para User ID: ${userId} no Processo ID: ${processoId}`);
    const temPermissaoParaVerProcesso = await podeVisualizarProcesso(processoId, userId);

    if (!temPermissaoParaVerProcesso) {
      console.warn(`[API Doc Conteudo] Acesso NEGADO para User ID: ${userId} ao Processo ID: ${processoId}`);
      return NextResponse.json({ error: 'Acesso negado a este processo e seus documentos' }, { status: 403 });
    }
    console.log(`[API Doc Conteudo] Acesso PERMITIDO para User ID: ${userId} ao Processo ID: ${processoId}`);
    // --- Fim da Verificação de Permissão ---


    const documento = await prisma.documento.findUnique({
      where: {
        id: documentoId,
        processoId: processoId, // Garante que o documento pertence ao processo correto
      },
      select: {
        id: true,
        nome: true,
        tipo: true,
        conteudoHtml: true,
      },
    });

    if (!documento) {
      return NextResponse.json({ error: 'Documento não encontrado ou não pertence a este processo' }, { status: 404 });
    }

    if (documento.tipo !== 'interno') {
        return NextResponse.json({ error: 'Este tipo de documento não pode ser editado diretamente (não é interno).' }, { status: 400 });
    }

    console.log(`[API Doc Conteudo] Documento ${documentoId} encontrado. Tipo: ${documento.tipo}`);
    return NextResponse.json({
        id: documento.id,
        nome: documento.nome,
        tipo: documento.tipo,
        conteudoHtml: documento.conteudoHtml || '<p>Digite o conteúdo aqui...</p>', // Garante que não seja null
    });

  } catch (error: any) {
    console.error(`[API GET /processos/${params.id}/documentos/${params.docId}/conteudo] Erro:`, error.message, error.stack);
    return NextResponse.json({ error: 'Erro ao buscar conteúdo do documento', details: error.message }, { status: 500 });
  }
}