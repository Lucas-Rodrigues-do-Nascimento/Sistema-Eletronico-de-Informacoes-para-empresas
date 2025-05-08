import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { possuiPermissao } from '@/lib/permissoes' // ✅ Importado
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import qrcode from 'qrcode'

export const dynamic = 'force-dynamic'

/**
 * @deprecated Esta rota está mantida por compatibilidade, mas será removida em uma versão futura.
 * Use a nova rota /api/documentos/[id]/acoes/assinar em seu lugar.
 */
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
    include: { permissoes: true }, // 👈 necessário para validar permissões
  })

  if (!colaborador || !colaborador.senha) {
    return NextResponse.json({ error: 'Colaborador não encontrado ou sem senha' }, { status: 404 })
  }

  // ✅ Verifica permissão com helper
  if (!possuiPermissao(colaborador, 'assinatura')) {
    return NextResponse.json(
      { error: 'Você não tem permissão para assinar documentos.' },
      { status: 403 }
    )
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

  // --- BLOCO DE ASSINATURA DIGITAL CENTRALIZADO VERTICALMENTE NO RODAPÉ ---
  const margem = 50;
  const margemInferior = 0; // praticamente colado ao final da página
  const qrSize = 80;
  const pageWidth = lastPage.getWidth();
  const pageHeight = lastPage.getHeight();

  // Altura do bloco (QR + texto)
  const blocoAltura = qrSize;
  const blocoLargura = pageWidth - 2 * margem;
  const blocoEspaco = 90; // espaço menor para aproximar do rodapé
  const blocoY = margemInferior + (blocoEspaco - blocoAltura) / 2; // centraliza verticalmente
  const blocoX = margem;
  const linhaY = blocoY + blocoAltura + 4; // linha mais próxima do bloco

  // Linha de separação logo acima do bloco
  lastPage.drawLine({
    start: { x: blocoX, y: linhaY },
    end: { x: blocoX + blocoLargura, y: linhaY },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });

  // QR Code à esquerda, centralizado verticalmente
  const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64')
  const qrImage = await pdfDoc.embedPng(qrImageBytes)
  const qrY = blocoY;
  lastPage.drawImage(qrImage, {
    x: blocoX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  })

  // Texto à direita do QR, centralizado verticalmente
  const textoX = blocoX + qrSize + 16;
  const fontSize = 6.5;
  const fontSizeNegrito = 7;
  const nomeAltura = font.heightAtSize ? font.heightAtSize(fontSizeNegrito) : fontSizeNegrito;
  // Calcula altura total do bloco de texto (5 linhas)
  const linhasTexto = 5;
  const alturaTexto = nomeAltura + (linhasTexto - 1) * 10;
  let textoY = qrY + (qrSize + alturaTexto) / 2 - nomeAltura; // centraliza bloco de texto em relação ao QR

  // Nome (negrito)
  lastPage.drawText(colaborador.nome, {
    x: textoX,
    y: textoY,
    size: fontSizeNegrito,
    font,
    color: rgb(0, 0, 0),
  });
  textoY -= 10;
  // Cargo (normal)
  lastPage.drawText(colaborador.cargo, {
    x: textoX,
    y: textoY,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  textoY -= 10;
  // Texto de assinatura
  lastPage.drawText(`Documento assinado eletronicamente em ${agora.toLocaleDateString()} às ${agora.toLocaleTimeString()}.`, {
    x: textoX,
    y: textoY,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  textoY -= 10;
  // Código de verificação (negrito)
  lastPage.drawText(`Código de Verificação: `, {
    x: textoX,
    y: textoY,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  lastPage.drawText(codigoVerificacao, {
    x: textoX + font.widthOfTextAtSize('Código de Verificação: ', fontSize),
    y: textoY,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  textoY -= 10;
  // Link de verificação
  lastPage.drawText(`Acesse: ${urlVerificacao}`, {
    x: textoX,
    y: textoY,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
    maxWidth: blocoLargura - qrSize - 32,
  });

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

  const response = NextResponse.json({ 
    sucesso: true,
    aviso: 'Esta rota está depreciada. Use /api/documentos/' + documentoId + '/acoes/assinar em seu lugar.'
  })
    
  response.headers.set('Deprecation', 'true')
  response.headers.set('Sunset', '2024-12-31')
  response.headers.set('Link', '</api/documentos/' + documentoId + '/acoes/assinar>; rel="successor-version"')
    
  return response
}
