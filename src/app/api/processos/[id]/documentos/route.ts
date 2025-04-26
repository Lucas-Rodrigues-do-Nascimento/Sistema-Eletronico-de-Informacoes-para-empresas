import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { v4 as uuid } from 'uuid'
import path from 'path'
import { writeFile, mkdir } from 'fs/promises'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const processoId = Number(params.id)

  if (isNaN(processoId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const formData = await request.formData()
    const nomeBase = formData.get('nome') as string
    const tipo = formData.get('tipo') as string
    let html = formData.get('html')?.toString() || ''
    const file = formData.get('file') as File | null

    if (!nomeBase || !tipo) {
      return NextResponse.json({ error: 'Nome ou tipo não informado' }, { status: 400 })
    }

    const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const cabecalhoHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${host}/logo-institucional.png" alt="Logo" style="height: 80px; margin-bottom: 8px;" />
        <h2 style="margin: 0; font-size: 18px;">CORRÊA MATERIAIS ELÉTRICOS</h2>
        <p style="margin: 0; font-size: 14px;">Sistema Interno Administrativo - PROTON</p>
        <hr style="margin-top: 10px; border: 1px solid #ccc;" />
      </div>
    `

    if (html && !file) {
      if (!html.includes('logo-institucional.png')) {
        html = cabecalhoHTML + html
      }

      const count = await prisma.documento.count({
        where: { processoId, tipo },
      })

      const numeroSequencial = count + 1

      const nomeCapitalizado = nomeBase.charAt(0).toUpperCase() + nomeBase.slice(1).toLowerCase()
      const nome = `${nomeCapitalizado} ${numeroSequencial}`

      const puppeteer = (await import('puppeteer')).default
      const browser = await puppeteer.launch({ headless: true })
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const pdfBuffer = await page.pdf({ format: 'A4' })
      await browser.close()

      const doc = await prisma.documento.create({
        data: {
          nome,
          tipo,
          processoId,
          conteudo: pdfBuffer,
          conteudoHtml: html,
          arquivo: false,
          arquivoFisico: null,
        },
      })

      return NextResponse.json(doc)
    }

    if (file && file instanceof File) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const nomeFinal = `${uuid()}.pdf`
      const uploadPath = path.join(process.cwd(), 'uploads', nomeFinal)

      await mkdir(path.join(process.cwd(), 'uploads'), { recursive: true })
      await writeFile(uploadPath, buffer)

      const doc = await prisma.documento.create({
        data: {
          nome: nomeBase,
          tipo,
          processoId,
          conteudo: null,
          conteudoHtml: null,
          arquivo: true,
          arquivoFisico: nomeFinal,
        },
      })

      return NextResponse.json(doc)
    }

    return NextResponse.json({ error: 'Nenhum conteúdo válido recebido' }, { status: 400 })
  } catch (err) {
    console.error('[POST /api/processos/[id]/documentos] Erro ao criar documento:', err)
    return NextResponse.json({ error: 'Erro ao criar documento' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const processoId = Number(params.id)

  if (isNaN(processoId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const documentos = await prisma.documento.findMany({
    where: { processoId },
    orderBy: { criadoEm: 'asc' },
    select: {
      id: true,
      nome: true,
      tipo: true,
      criadoEm: true,
      assinadoPor: true,
      assinadoEm: true,
      hashConteudo: true,
      codigoVerificacao: true,
    },
  })

  return NextResponse.json(documentos)
}
