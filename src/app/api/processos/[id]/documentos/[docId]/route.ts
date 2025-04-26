import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: { id: string; docId: string } }
) {
  const { params } = await Promise.resolve(context)
  const processoId = Number(params.id)
  const documentoId = Number(params.docId)

  if (isNaN(processoId) || isNaN(documentoId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const doc = await prisma.documento.findUnique({
    where: { id: documentoId },
    select: {
      conteudo: true,
      nome: true,
      processoId: true,
      arquivo: true,
      arquivoFisico: true,
      conteudoHtml: true,
    },
  })

  if (!doc || doc.processoId !== processoId) {
    return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })
  }

  if (!doc.arquivo && doc.conteudo) {
    return new NextResponse(Buffer.from(doc.conteudo), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${doc.nome}"`,
      },
    })
  }

  if (doc.arquivo && doc.arquivoFisico) {
    try {
      const filePath = path.join(process.cwd(), 'uploads', doc.arquivoFisico)
      const fileBuffer = await fs.readFile(filePath)

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${doc.nome}"`,
        },
      })
    } catch (err) {
      console.error('[ERRO_ARQUIVO_EXTERNO]', err)
      return NextResponse.json({ error: 'Erro ao ler o arquivo físico' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Documento sem conteúdo válido' }, { status: 400 })
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string; docId: string } }
) {
  const { params } = await Promise.resolve(context)
  const processoId = Number(params.id)
  const documentoId = Number(params.docId)

  if (isNaN(processoId) || isNaN(documentoId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const doc = await prisma.documento.findUnique({ where: { id: documentoId } })

    if (!doc || doc.processoId !== processoId) {
      return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })
    }

    if (doc.arquivo && doc.arquivoFisico) {
      const filePath = path.join(process.cwd(), 'uploads', doc.arquivoFisico)
      try {
        await fs.unlink(filePath)
      } catch (err) {
        console.warn('[AVISO] Arquivo físico não encontrado para exclusão:', filePath)
      }
    }

    await prisma.documento.delete({ where: { id: documentoId } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ERRO_DELETE_DOC]', err)
    return NextResponse.json({ error: 'Erro ao excluir documento' }, { status: 500 })
  }
}
