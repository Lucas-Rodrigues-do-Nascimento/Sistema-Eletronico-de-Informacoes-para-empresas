import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  _request: Request,
  context: { params: { id: string } }
) {
  const processoId = Number(context.params.id)

  if (isNaN(processoId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const processo = await prisma.processo.update({
      where: { id: processoId },
      data: { arquivado: false },
    })

    return NextResponse.json(processo)
  } catch (err: any) {
    console.error('[ERRO_REABRIR_PROCESSO]', err)
    return NextResponse.json({ error: 'Erro ao reabrir processo' }, { status: 500 })
  }
}
