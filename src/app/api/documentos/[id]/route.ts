import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: Awaited<{ params: { id: string } }>
) {
  const documentoId = Number(context.params.id)

  if (isNaN(documentoId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const documento = await prisma.documento.findUnique({
    where: { id: documentoId },
  })

  if (!documento) {
    return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 })
  }

  return NextResponse.json(documento)
}
