// src/app/api/processos/[id]/arquivar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const processoId = Number(params.id)

  if (isNaN(processoId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const processo = await prisma.processo.update({
      where: { id: processoId },
      data: { arquivado: true },
    })

    return NextResponse.json(processo)
  } catch (err) {
    console.error('[ERRO_ARQUIVAR]', err)
    return NextResponse.json({ error: 'Erro ao arquivar processo' }, { status: 500 })
  }
}