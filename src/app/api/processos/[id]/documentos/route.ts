// src/app/api/processos/[id]/documentos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePDFFromHTML } from '@/lib/pdfGenerator';
import { getTemplateHtml } from '@/lib/templates';
// import { podeVisualizarProcesso } from '@/lib/autorizacao/podeVisualizarProcesso'; // Exemplo

export const dynamic = 'force-dynamic';

// --- FUNÇÃO GET (Listar Documentos) ---
export async function GET(
  request: NextRequest,
  context: any
) {
  const { params } = await context;
  try {
    const processoId = Number(params.id);

    if (isNaN(processoId) || processoId <= 0) {
      return NextResponse.json({ error: 'ID do processo inválido' }, { status: 400 });
    }

    // --- Verificação de Permissão (Exemplo - IMPLEMENTE A SUA LÓGICA) ---
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    // const userId = Number(session.user.id);
    // const temPermissao = await podeVisualizarProcesso(processoId, userId); // Sua lógica aqui
    // if (!temPermissao) {
    //   return NextResponse.json({ error: 'Acesso negado aos documentos deste processo' }, { status: 403 });
    // }
    // --- Fim da Verificação ---

    const documentosDoBanco = await prisma.documento.findMany({
      where: { processoId },
      orderBy: { criadoEm: 'asc' },
      select: {
        id: true,
        nome: true,
        tipo: true,
        criadoEm: true,
        assinadoPor: true,
        cargoAssinatura: true,
        assinadoEm: true,
      },
    });

    // Log para depuração
    console.log(`[API-GET-DOCS] Documentos do processo ${processoId}:`, 
      JSON.stringify(documentosDoBanco.map(d => ({ 
        id: d.id, 
        nome: d.nome, 
        assinadoPor: d.assinadoPor,
        assinadoEm: d.assinadoEm 
      })))
    );

    // --- MAPEAMENTO PARA O FRONTEND (OPCIONAL, MAS FEITO AQUI PARA CORRESPONDER AO FRONTEND) ---
    const documentosParaFrontend = documentosDoBanco.map(doc => ({
        ...doc,
        dataAssinatura: doc.assinadoEm // Cria a propriedade 'dataAssinatura' a partir de 'assinadoEm'
    }));
    // --- FIM DO MAPEAMENTO ---

    return NextResponse.json(documentosParaFrontend); // Envia os dados mapeados

  } catch (error: any) {
    console.error(`[API GET /processos/${params.id}/documentos] Erro:`, error.message, error.stack);
    return NextResponse.json({ error: 'Erro ao buscar documentos', details: error.message }, { status: 500 });
  }
}

// --- FUNÇÃO POST (Criar Documento - com serviço unificado) ---
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const processoId = Number(params.id);

  if (isNaN(processoId) || processoId <= 0) {
    return NextResponse.json({ error: 'ID do processo inválido' }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado para criar documento' }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let nomeBase: string | null = null;
    let tipo: string | null = null;
    let html: string | null = null;
    let templateId: string | null = null;
    let file: File | null = null;

    if (contentType.includes('application/json')) {
        const jsonData = await request.json();
        nomeBase = jsonData.nome as string;
        tipo = jsonData.tipo as string;
        html = jsonData.html?.toString() || '';
        templateId = jsonData.modelo as string || null;
    } else if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        nomeBase = formData.get('nome') as string;
        tipo = formData.get('tipo') as string;
        file = formData.get('file') as File | null;
        html = formData.get('html')?.toString() || null;
        templateId = formData.get('modelo')?.toString() || null;
    } else {
        return NextResponse.json({ error: 'Content-Type não suportado.' }, { status: 415 });
    }

    if (!nomeBase || !tipo) {
      return NextResponse.json({ error: 'Nome base ou tipo do documento não informado' }, { status: 400 });
    }

    if (tipo === 'interno' && !file) {
      // Se um templateId foi especificado mas não um HTML, use o template
      if (templateId && (!html || html.trim() === '')) {
        html = getTemplateHtml(templateId);
      } else if (!html || html.trim() === '') {
        // Se nem HTML nem templateId foram fornecidos, use um HTML padrão
        html = '<p>Digite o conteúdo aqui...</p>';
      }
      
      // Extrai o nome base removendo número(s) ao final
      const baseNameForCount = nomeBase.replace(/\s\d+$/, '').trim();
      const count = await prisma.documento.count({ where: { processoId, nome: { startsWith: baseNameForCount } } });
      const numeroSequencial = count + 1;
      const nomeFinalDocumento = `${baseNameForCount} ${numeroSequencial}`;
      
      // Usar o serviço unificado para gerar o PDF
      const pdfBuffer = await generatePDFFromHTML(html, 
        { printBackground: true }, 
        { headerStyle: 'simple' }
      );
      
      const doc = await prisma.documento.create({ 
        data: { 
          nome: nomeFinalDocumento, 
          tipo, 
          processoId, 
          conteudo: pdfBuffer, 
          conteudoHtml: html, 
          arquivo: false 
        } 
      });
      
      return NextResponse.json(doc);
    }

    if (tipo === 'externo' && file && file instanceof File) {
      const { v4: uuid } = await import('uuid'); // Importar uuid aqui se não estiver no topo
      const path = await import('path'); // Importar path aqui
      const { writeFile, mkdir } = await import('fs/promises'); // Importar fs/promises aqui

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const extensao = path.extname(file.name);
      const nomeArquivoBase = path.basename(file.name, extensao);
      const nomeSanitizado = nomeArquivoBase.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
      const nomeFinalNoDisco = `${uuid()}-${nomeSanitizado}${extensao}`;
      const uploadDir = path.join(process.cwd(), 'uploads');
      const uploadPath = path.join(uploadDir, nomeFinalNoDisco);
      await mkdir(uploadDir, { recursive: true });
      await writeFile(uploadPath, buffer);
      const doc = await prisma.documento.create({ data: { nome: nomeBase, tipo, processoId, arquivo: true, arquivoFisico: nomeFinalNoDisco } });
      return NextResponse.json(doc);
    }

    return NextResponse.json({ error: 'Dados inválidos ou tipo de documento não corresponde ao conteúdo enviado.' }, { status: 400 });
  } catch (err: any) {
    console.error('[POST /api/processos/[id]/documentos] Erro:', err.message, err.stack);
    const errorMessage = err.name === 'TimeoutError' ? 'Timeout ao gerar PDF com Puppeteer.' : (err.message || 'Erro desconhecido');
    return NextResponse.json({ error: 'Erro ao criar documento', details: errorMessage }, { status: 500 });
  }
}