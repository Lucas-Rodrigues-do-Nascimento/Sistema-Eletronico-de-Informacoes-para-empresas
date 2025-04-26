import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/* ────────────────  PUT  ──────────────── */
export async function PUT(
  req: Request,
  context: Awaited<{ params: { id: string } }>
) {
  const { params } = await context
  const id = Number(params.id)
  const { nome, descricao, modelo } = await req.json()

  if (isNaN(id) || !nome) {
    return NextResponse.json(
      { error: 'ID ou nome inválido.' },
      { status: 400 }
    )
  }

  try {
    const atualizado = await prisma.tipoDocumento.update({
      where: { id },
      data: { nome, descricao, modeloPadrao: modelo },
    })
    return NextResponse.json(atualizado)
  } catch (err) {
    console.error('[PUT /api/tipos-documento/[id]]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/* ───────────────  DELETE ─────────────── */
export async function DELETE(
  _req: Request,
  context: Awaited<{ params: { id: string } }>
) {
  const { params } = await context
  const id = Number(params.id)

  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
  }

  try {
    await prisma.tipoDocumento.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[DELETE /api/tipos-documento/[id]]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/* ────────────────  GET  ──────────────── */
export async function GET(
  _req: Request,
  context: Awaited<{ params: { id: string } }>
) {
  const { params } = await context
  const id = Number(params.id)

  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
  }

  try {
    const tipo = await prisma.tipoDocumento.findUnique({ where: { id } })

    if (!tipo) {
      return NextResponse.json(
        { error: 'Tipo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(tipo)
  } catch (err) {
    console.error('[GET /api/tipos-documento/[id]]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
