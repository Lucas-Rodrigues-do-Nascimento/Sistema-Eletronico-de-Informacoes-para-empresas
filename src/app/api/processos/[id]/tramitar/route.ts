// src/app/api/processos/[id]/tramitar/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  context: Awaited<{ params: { id: string } }>
) {
  const { params } = await context
  const processoId = Number(params.id)

  // ──────── parse body ────────
  let body: {
    paraSetorId?: string | number
    observacoes?: string
    manterAbertoNoSetorOrigem?: boolean
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const { paraSetorId, observacoes, manterAbertoNoSetorOrigem } = body

  if (isNaN(processoId) || !paraSetorId) {
    return NextResponse.json(
      { error: 'Processo e setor de destino são obrigatórios.' },
      { status: 400 }
    )
  }

  // ──────── sessão ────────
  const session = await getServerSession(authOptions)
  const setorAtual = session?.user?.setor

  if (!setorAtual) {
    return NextResponse.json(
      { error: 'Setor atual não identificado. Faça login novamente.' },
      { status: 400 }
    )
  }

  try {
    // 1. Desativa todas as movimentações ativas do processo
    await prisma.movimentacao.updateMany({
      where: {
        processoId,
        ativo: true,
      },
      data: {
        ativo: false,
      },
    })

    // 2. Se marcado, cria nova movimentação para manter no setor de origem
    if (manterAbertoNoSetorOrigem) {
      await prisma.movimentacao.create({
        data: {
          processoId,
          deSetor: Number(setorAtual),
          paraSetor: Number(setorAtual),
          observacoes: 'Mantido no setor de origem',
          manterAbertoNoSetorOrigem: true,
          ativo: true,
        },
      })
    }

    // 3. Cria nova movimentação principal para o setor de destino
    await prisma.movimentacao.create({
      data: {
        processoId,
        deSetor: Number(setorAtual),
        paraSetor: Number(paraSetorId),
        observacoes: observacoes || null,
        manterAbertoNoSetorOrigem: Boolean(manterAbertoNoSetorOrigem),
        ativo: true,
      },
    })

    return NextResponse.json({ message: '✅ Processo tramitado com sucesso.' })
  } catch (err) {
    console.error('[POST /api/processos/[id]/tramitar]', err)
    return NextResponse.json(
      { error: 'Erro interno ao tramitar processo.' },
      { status: 500 }
    )
  }
}
