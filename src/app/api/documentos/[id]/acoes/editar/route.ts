import { NextRequest, NextResponse } from 'next/server'
import { generatePDFFromHTML } from '@/lib/pdfGenerator'
import prisma from '@/lib/prisma'

/**
 * Rota unificada para edição de documentos, com mesma funcionalidade
 * da rota /api/documento/[id]/editar, mas seguindo o padrão de rotas no plural.
 */
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const docId = Number(context.params.id)
  const body = await request.json()
  let { conteudoHtml } = body

  if (!conteudoHtml || typeof conteudoHtml !== 'string') {
    return NextResponse.json({ error: 'Conteúdo inválido' }, { status: 400 })
  }

  try {
    // Usar o novo serviço para gerar o PDF com cabeçalho completo
    const pdfBuffer = await generatePDFFromHTML(conteudoHtml, 
      { printBackground: true }, 
      { headerStyle: 'complete' }
    )

    const documento = await prisma.documento.update({
      where: { id: docId },
      data: {
        conteudoHtml,
        conteudo: pdfBuffer,
      },
    })

    return NextResponse.json({ 
      sucesso: true, 
      documento,
      mensagem: 'Documento atualizado usando a nova API unificada'
    })
  } catch (error: any) {
    console.error('[ERRO_EDITAR_DOCUMENTO][ROTA_UNIFICADA]', error?.message || error)
    return NextResponse.json(
      { error: 'Erro ao editar documento', detalhe: error?.message },
      { status: 500 }
    )
  }
} 