import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generatePDFFromHTML } from '@/lib/pdfGenerator'

/**
 * @deprecated Esta rota está mantida por compatibilidade, mas será removida em uma versão futura.
 * Use a nova rota /api/documentos/[id]/acoes/editar em seu lugar.
 */
export async function POST(
  request: NextRequest,
  context: Awaited<{ params: { id: string } }>
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

    // Adicionar cabeçalho de depreciação
    const response = NextResponse.json({ 
      sucesso: true, 
      documento,
      aviso: 'Esta rota está depreciada. Use /api/documentos/[id]/acoes/editar em seu lugar.'
    })
    
    // Adicionar cabeçalho HTTP de depreciação
    response.headers.set('Deprecation', 'true')
    response.headers.set('Sunset', '2024-12-31') // Data sugerida para remoção
    response.headers.set('Link', '</api/documentos/' + docId + '/acoes/editar>; rel="successor-version"')
    
    return response
  } catch (error: any) {
    console.error('[ERRO_EDITAR_DOCUMENTO][DEPRECATED]', error?.message || error)
    return NextResponse.json(
      { error: 'Erro ao editar documento', detalhe: error?.message },
      { status: 500 }
    )
  }
}
