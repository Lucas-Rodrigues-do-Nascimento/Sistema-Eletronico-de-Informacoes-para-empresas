import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import qrcode from 'qrcode'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  context: Awaited<{ params: { id: string } }>
) {
  const { params } = await Promise.resolve(context)
  const documentoId = Number(params.id)

  if (isNaN(documentoId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user?.email) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
  }

  const body = await req.json()
  const senhaDigitada = body?.senha?.toString() || ''

  const colaborador = await prisma.colaborador.findUnique({
    where: { email: user.email },
  })

  if (!colaborador || !colaborador.senha) {
    return NextResponse.json({ error: 'Colaborador não encontrado ou sem senha' }, { status: 404 })
  }

  const senhaCorreta = await bcrypt.compare(senhaDigitada, colaborador.senha)
  if (!senhaCorreta) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 403 })
  }

  const doc = await prisma.documento.findUnique({
    where: { id: documentoId },
    select: { conteudo: true, tipo: true },
  })

  if (!doc || !doc.conteudo || doc.tipo !== 'interno') {
    return NextResponse.json({ error: 'Documento inválido para assinatura' }, { status: 400 })
  }

  const pdfDoc = await PDFDocument.load(doc.conteudo)
  const pages = pdfDoc.getPages()
  const lastPage = pages[pages.length - 1]
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const agora = new Date()
  const assinaturaTexto = `Documento assinado eletronicamente por ${colaborador.nome}, ${colaborador.cargo}, em ${agora.toLocaleDateString()} às ${agora.toLocaleTimeString()}.`

  const hash = crypto.createHash('sha256').update(doc.conteudo).digest('hex')
  const codigoVerificacao = hash.substring(0, 8).toUpperCase()
  const urlVerificacao = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verificar/${codigoVerificacao}`
  const qrDataUrl = await qrcode.toDataURL(urlVerificacao)

  lastPage.drawText(assinaturaTexto, {
    x: 50,
    y: 50,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  })

  lastPage.drawText(`Código de Verificação: ${codigoVerificacao}`, {
    x: 50,
    y: 35,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  })

  lastPage.drawText(`Acesse ${urlVerificacao}`, {
    x: 50,
    y: 20,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  })

  const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64')
  const qrImage = await pdfDoc.embedPng(qrImageBytes)
  lastPage.drawImage(qrImage, {
    x: 450,
    y: 20,
    width: 80,
    height: 80,
  })

  const pdfFinal = await pdfDoc.save()
  const novoHash = crypto.createHash('sha256').update(pdfFinal).digest('hex')

  await prisma.documento.update({
    where: { id: documentoId },
    data: {
      conteudo: pdfFinal,
      assinadoPor: colaborador.nome,
      assinadoEm: agora,
      hashConteudo: novoHash,
      codigoVerificacao,
    },
  })

  return NextResponse.json({ sucesso: true })
}