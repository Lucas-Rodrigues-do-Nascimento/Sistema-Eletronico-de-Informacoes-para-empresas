import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

  // Caminho absoluto da logo para garantir carregamento no Puppeteer
  const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const cabecalhoHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${host}/logo-institucional.png" alt="Logo" style="height: 80px; margin-bottom: 8px;" />
      <h2 style="margin: 0; font-size: 18px;">CORRÊA MATERIAIS ELÉTRICOS</h2>
      <p style="margin: 0; font-size: 14px;">Sistema Interno Administrativo - PROTON</p>
      <hr style="margin-top: 10px; border: 1px solid #ccc;" />
    </div>
  `

  // Garante que o logo está no conteúdo e com src absoluto
  if (!conteudoHtml.includes('logo-institucional.png')) {
    conteudoHtml = cabecalhoHTML + conteudoHtml
  } else {
    conteudoHtml = conteudoHtml.replace(
      /src=["']\/?logo-institucional\.png["']/g,
      `src=\"${host}/logo-institucional.png\"`
    )
  }

  try {
    const puppeteer = (await import('puppeteer')).default
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.setContent(conteudoHtml, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({ format: 'A4' })
    await browser.close()

    const documento = await prisma.documento.update({
      where: { id: docId },
      data: {
        conteudoHtml,
        conteudo: pdfBuffer,
      },
    })

    return NextResponse.json({ sucesso: true, documento })
  } catch (error: any) {
    console.error('[ERRO_EDITAR_DOCUMENTO]', error?.message || error)
    return NextResponse.json(
      { error: 'Erro ao editar documento', detalhe: error?.message },
      { status: 500 }
    )
  }
}
