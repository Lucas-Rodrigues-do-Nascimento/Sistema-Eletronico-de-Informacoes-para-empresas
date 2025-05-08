import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * @deprecated Esta rota está mantida por compatibilidade, mas será removida em uma versão futura.
 * Use a nova rota /api/documentos/[id]/acoes/verificar em seu lugar.
 */
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const codigo = context.params.id.trim()

  if (!codigo || codigo.length < 5) {
    return NextResponse.json({ error: 'Código de verificação inválido' }, { status: 400 })
  }

  const documento = await prisma.documento.findFirst({
    where: { codigoVerificacao: codigo },
    select: {
      conteudo: true,
      hashConteudo: true
    }
  })

  if (!documento || !documento.conteudo || !documento.hashConteudo) {
    return NextResponse.json({ error: 'Documento não encontrado ou incompleto' }, { status: 404 })
  }

  const hashAtual = crypto
    .createHash('sha256')
    .update(documento.conteudo)
    .digest('hex')

  const valido = hashAtual === documento.hashConteudo

  const response = NextResponse.json({
    valido,
    hashAtual,
    hashRegistrado: documento.hashConteudo,
    mensagem: valido
      ? '✅ Documento íntegro e original.'
      : '⚠️ Documento foi alterado desde a assinatura.',
    aviso: 'Esta rota está depreciada. Use /api/documentos/' + codigo + '/acoes/verificar em seu lugar.'
  })
  
  // Adicionar cabeçalho HTTP de depreciação
  response.headers.set('Deprecation', 'true')
  response.headers.set('Sunset', '2024-12-31') // Data sugerida para remoção
  response.headers.set('Link', '</api/documentos/' + codigo + '/acoes/verificar>; rel="successor-version"')
  
  return response
}
