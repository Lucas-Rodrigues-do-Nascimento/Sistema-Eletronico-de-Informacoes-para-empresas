import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import JSZip from 'jszip'
import path from 'path'
import fs from 'fs/promises'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { possuiPermissao } from '@/lib/permissoes' // ✅ importado o helper

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const processoId = Number(context.params.id)

  if (isNaN(processoId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
  }

  const colaborador = await prisma.colaborador.findUnique({
    where: { id: parseInt(userId) },
    include: { permissoes: true },
  })

  if (!colaborador) {
    return NextResponse.json({ error: 'Colaborador não encontrado' }, { status: 404 })
  }

  // ✅ Verifica permissão de exportar documentos
  if (!possuiPermissao(colaborador, 'exportar_documentos')) {
    return NextResponse.json(
      { error: 'Você não tem permissão para exportar documentos.' },
      { status: 403 }
    )
  }

  try {
    const documentos = await prisma.documento.findMany({
      where: { processoId },
      orderBy: { criadoEm: 'asc' },
    })

    const zip = new JSZip()

    for (const doc of documentos) {
      const nome = doc.nome.replace(/[^a-zA-Z0-9-_ ]/g, '_') + '.pdf'
      if (doc.arquivo && doc.arquivoFisico) {
        const filePath = path.join(process.cwd(), 'uploads', doc.arquivoFisico)
        try {
          const buffer = await fs.readFile(filePath)
          zip.file(nome, buffer)
        } catch (e) {
          console.warn(`[AVISO] Arquivo não encontrado: ${filePath}`)
        }
      } else if (doc.conteudo) {
        zip.file(nome, Buffer.from(doc.conteudo))
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=processo-${processoId}.zip`,
      },
    })
  } catch (err) {
    console.error('[ERRO_DOWNLOAD_ZIP]', err)
    return NextResponse.json({ error: 'Erro ao gerar ZIP' }, { status: 500 })
  }
}
