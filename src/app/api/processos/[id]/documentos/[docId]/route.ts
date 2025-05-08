// src/app/api/processos/[id]/documentos/[docId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePDFFromHTML } from '@/lib/pdfGenerator';
// --- IMPORTAR FUNÇÕES DE AUTORIZAÇÃO ---
import { podeVisualizarProcesso } from '@/lib/autorizacao/podeVisualizarProcesso'; // Ajuste o caminho
import { podeModificarDocumentoNoProcesso, podeExcluirDocumentoDoProcesso } from '@/lib/autorizacao/podeAlgoNoProcesso'; // Ajuste o caminho

export const dynamic = 'force-dynamic';

interface ContextParams {
  id: string;
  docId: string;
}

// --- FUNÇÃO GET (Visualizar PDF ou obter Conteúdo HTML para edição) ---
// A rota /conteudo é para o HTML do editor, esta GET é para o PDF em si
export async function GET(
  request: NextRequest,
  { params }: { params: ContextParams }
) {
  try {
    const session = await getServerSession(authOptions); // Mover para o topo do try
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const processoId = Number(params.id);
    const documentoId = Number(params.docId);

    if (isNaN(processoId) || processoId <= 0 || isNaN(documentoId) || documentoId <= 0 || isNaN(userId)) {
      return NextResponse.json({ error: 'IDs de processo, documento ou usuário inválidos' }, { status: 400 });
    }

    // Verificação de Permissão para Visualizar o Processo Pai
    const temPermissaoVisualizar = await podeVisualizarProcesso(processoId, userId);
    if (!temPermissaoVisualizar) {
      return NextResponse.json({ error: 'Acesso negado a este processo e seus documentos' }, { status: 403 });
    }

    const doc = await prisma.documento.findUnique({
      where: { id: documentoId, processoId: processoId },
      select: { nome: true, conteudo: true, arquivo: true, arquivoFisico: true, processoId: true },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Documento não encontrado ou não pertence a este processo' }, { status: 404 });
    }

    if (!doc.arquivo && doc.conteudo) {
      return new NextResponse(Buffer.from(doc.conteudo), {
        status: 200,
        headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${encodeURIComponent(doc.nome)}.pdf"`},
      });
    }

    if (doc.arquivo && doc.arquivoFisico) {
      try {
        const filePath = path.join(process.cwd(), 'uploads', doc.arquivoFisico);
        const fileBuffer = await fs.readFile(filePath);
        const mimeType = fileBuffer.slice(0, 4).toString() === '%PDF' ? 'application/pdf' : 'application/octet-stream';
        return new NextResponse(fileBuffer, { status: 200, headers: { 'Content-Type': mimeType, 'Content-Disposition': `inline; filename="${encodeURIComponent(doc.nome)}"`}});
      } catch (err) {
        console.error(`[ERRO_ARQUIVO_EXTERNO] Doc ID ${documentoId}, Arquivo: ${doc.arquivoFisico}`, err);
        return NextResponse.json({ error: 'Erro ao ler o arquivo físico do documento' }, { status: 500 });
      }
    }
    return NextResponse.json({ error: 'Documento sem conteúdo para visualização' }, { status: 404 });
  } catch (error: any) {
    console.error(`[API GET Doc /${params.id}/documentos/${params.docId}] Erro:`, error);
    return NextResponse.json({ error: 'Erro interno ao buscar documento', details: error.message }, { status: 500 });
  }
}


// --- FUNÇÃO PATCH (Atualizar Documento Interno) ---
export async function PATCH(
  request: NextRequest,
  { params }: { params: ContextParams }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const processoId = Number(params.id);
    const documentoId = Number(params.docId);

    if (isNaN(processoId) || processoId <= 0 || isNaN(documentoId) || documentoId <= 0 || isNaN(userId)) {
      return NextResponse.json({ error: 'IDs de processo, documento ou usuário inválidos' }, { status: 400 });
    }

    // Verificação de Permissão para MODIFICAR
    const temPermissaoModificar = await podeModificarDocumentoNoProcesso(processoId, userId /*, session.user.permissoes */);
    if (!temPermissaoModificar) {
      return NextResponse.json({ error: 'Acesso negado: Você não tem permissão para editar este documento.' }, { status: 403 });
    }

    const body = await request.json();
    let novoConteudoHtml = body.conteudoHtml;

    if (typeof novoConteudoHtml !== 'string') {
      return NextResponse.json({ error: 'conteudoHtml inválido ou ausente' }, { status: 400 });
    }

    const documentoAtual = await prisma.documento.findUnique({ where: { id: documentoId, processoId: processoId }});
    if (!documentoAtual) return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });
    if (documentoAtual.tipo !== 'interno') return NextResponse.json({ error: 'Apenas docs internos podem ser editados' }, { status: 400 });

    // Verificação completa do documento através da assinatura
    if (documentoAtual.assinadoEm !== null) {
      console.log(`[API PATCH Doc] Documento ID: ${documentoId} está assinado!`, {
        assinadoEm: documentoAtual.assinadoEm, 
        assinadoPor: documentoAtual.assinadoPor,
        tipoAssinadoEm: typeof documentoAtual.assinadoEm,
        valorData: documentoAtual.assinadoEm ? new Date(documentoAtual.assinadoEm).toISOString() : null
      });
      
      try {
        // Verificar todas as movimentações (para depuração)
        const todasMovimentacoes = await prisma.movimentacao.findMany({
          where: { processoId: processoId }
        });
        
        console.log(`[API PATCH Doc] Todas as movimentações do processo ${processoId}:`, 
          JSON.stringify(todasMovimentacoes.map(m => ({ id: m.id, ativo: m.ativo })))
        );
        
        // CORREÇÃO: Verificar movimentações ativas
        const movimentacoesAtivas = await prisma.movimentacao.findMany({
          where: { 
            processoId: processoId,
            ativo: true // Filtrar apenas movimentações ativas
          }
        });
        
        console.log(`[API PATCH Doc] Movimentações ATIVAS do processo ${processoId}:`, 
          JSON.stringify(movimentacoesAtivas.map(m => ({ id: m.id, ativo: m.ativo, observacoes: m.observacoes })))
        );
        
        // CORREÇÃO: Verificar se há apenas a movimentação inicial
        // Se existir mais de uma movimentação ATIVA, ou se a única movimentação ativa não for a de criação,
        // então o documento não pode ser editado
        const apenasMovimentacaoInicial = 
          movimentacoesAtivas.length === 1 && 
          movimentacoesAtivas[0].observacoes && 
          movimentacoesAtivas[0].observacoes.includes('Criação do processo');
        
        if (movimentacoesAtivas.length > 0 && !apenasMovimentacaoInicial) {
          console.log(`[API PATCH Doc] BLOQUEANDO edição do documento ${documentoId} assinado e tramitado além da movimentação inicial`);
          return NextResponse.json({ 
            error: 'Documento assinado não pode ser editado após tramitação do processo',
            details: 'Este documento já foi assinado e o processo já foi tramitado. Não é possível realizar edições após a tramitação de documentos assinados.'
          }, { status: 403 });
        }
        
        console.log(`[API PATCH Doc] Documento ID: ${documentoId} está assinado, mas processo possui apenas a movimentação inicial. Edição PERMITIDA.`);
      } catch (error) {
        console.error(`[API PATCH Doc] Erro ao verificar movimentações:`, error);
      }
    } else {
      console.log(`[API PATCH Doc] Documento ID: ${documentoId} não está assinado. Edição permitida normalmente.`);
    }

    console.log(`[API PATCH Doc] Gerando PDF para doc ID: ${documentoId}`);
    
    // Usar o serviço unificado para gerar o PDF
    const novoPdfBuffer = await generatePDFFromHTML(novoConteudoHtml, 
      { format: 'A4', printBackground: true }
    );
    
    console.log(`[API PATCH Doc] PDF gerado para doc ID: ${documentoId}.`);

    const documentoAtualizado = await prisma.documento.update({
      where: { id: documentoId },
      data: { conteudoHtml: novoConteudoHtml, conteudo: novoPdfBuffer },
      select: { id: true, nome: true, tipo: true }
    });
    console.log(`[API PATCH Doc] Documento ID: ${documentoId} atualizado.`);
    return NextResponse.json(documentoAtualizado);

  } catch (error: any) {
    console.error(`[API PATCH Doc /${params.id}/documentos/${params.docId}] Erro:`, error);
    const errorMessage = error.name === 'TimeoutError' ? 'Timeout ao gerar PDF.' : (error.message || 'Erro ao salvar');
    return NextResponse.json({ error: 'Erro ao salvar documento', details: errorMessage }, { status: 500 });
  }
}


// --- FUNÇÃO DELETE (Excluir Documento) ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: ContextParams }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    const userId = Number(session.user.id);

    const processoId = Number(params.id);
    const documentoId = Number(params.docId);

    if (isNaN(processoId) || processoId <= 0 || isNaN(documentoId) || documentoId <= 0 || isNaN(userId)) {
      return NextResponse.json({ error: 'IDs de processo, documento ou usuário inválidos' }, { status: 400 });
    }

    // Verificação de Permissão para EXCLUIR
    const temPermissaoExcluir = await podeExcluirDocumentoDoProcesso(processoId, userId /*, session.user.permissoes */);
    if (!temPermissaoExcluir) {
      return NextResponse.json({ error: 'Acesso negado: Você não tem permissão para excluir este documento.' }, { status: 403 });
    }

    const doc = await prisma.documento.findUnique({ where: { id: documentoId, processoId: processoId }});
    if (!doc) return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });

    if (doc.arquivo && doc.arquivoFisico) {
      const filePath = path.join(process.cwd(), 'uploads', doc.arquivoFisico);
      try {
        await fs.unlink(filePath);
        console.log(`[API DELETE Doc] Arquivo físico ${filePath} excluído.`);
      } catch (err: any) {
        if (err.code === 'ENOENT') { console.warn(`[API DELETE Doc] Arquivo físico não encontrado (ENOENT):`, filePath); }
        else { console.error(`[API DELETE Doc] Erro ao excluir arquivo físico ${filePath}:`, err); }
      }
    }

    await prisma.documento.delete({ where: { id: documentoId } });
    console.log(`[API DELETE Doc] Documento ID ${documentoId} excluído do banco.`);
    return NextResponse.json({ success: true, message: "Documento excluído com sucesso." });

  } catch (err: any) {
    console.error(`[API DELETE Doc /${params.id}/documentos/${params.docId}] Erro:`, err);
    return NextResponse.json({ error: 'Erro ao excluir documento', details: err.message }, { status: 500 });
  }
}