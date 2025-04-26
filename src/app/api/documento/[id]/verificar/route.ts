import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

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

  return NextResponse.json({
    valido,
    hashAtual,
    hashRegistrado: documento.hashConteudo,
    mensagem: valido
      ? '✅ Documento íntegro e original.'
      : '⚠️ Documento foi alterado desde a assinatura.'
  })
}
