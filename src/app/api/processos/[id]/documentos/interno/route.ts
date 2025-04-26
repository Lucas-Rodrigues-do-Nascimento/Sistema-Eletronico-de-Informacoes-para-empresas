import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import puppeteer from 'puppeteer'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params
  const processoId = Number(id)

  if (isNaN(processoId) || processoId <= 0) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { html, nome } = body

    if (!html || !nome) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const buffer = await page.pdf({ format: 'A4' })
    await browser.close()

    const nomeArquivo = `${uuidv4()}.pdf`
    const caminho = path.join(process.cwd(), 'uploads', nomeArquivo)
    await fs.writeFile(caminho, buffer)

    const documento = await prisma.documento.create({
      data: {
        nome,
        tipo: 'interno',
        processoId,
        conteudo: buffer,
        arquivo: true // Assuming 'arquivo' is a flag indicating the presence of a file
      }
    })

    return NextResponse.json(documento)
  } catch (err) {
    console.error('[POST /api/processos/[id]/documentos]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
