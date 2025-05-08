// src/app/api/processos/[id]/acesso/route.ts
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(_: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const processoId = Number(context.params.id)
  if (isNaN(processoId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const acessos = await prisma.controleAcesso.findMany({
    where: { processoId },
    include: {
      colaborador: {
        select: { id: true, nome: true, email: true, cargo: true }
      }
    }
  })

  return NextResponse.json(acessos.map(a => a.colaborador))
}

export async function POST(req: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const processoId = Number(context.params.id)
  const { colaboradorId } = await req.json()

  if (!colaboradorId) {
    return NextResponse.json({ error: 'ID do colaborador é obrigatório' }, { status: 400 })
  }

  const existente = await prisma.controleAcesso.findFirst({
    where: { processoId, colaboradorId }
  })

  if (existente) {
    return NextResponse.json({ message: 'Já possui acesso' }, { status: 200 })
  }

  await prisma.controleAcesso.create({
    data: { processoId, colaboradorId }
  })

  return NextResponse.json({ message: 'Acesso concedido com sucesso' })
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const processoId = Number(context.params.id)
  const { colaboradorId } = await req.json()

  if (!colaboradorId) {
    return NextResponse.json({ error: 'ID do colaborador é obrigatório' }, { status: 400 })
  }

  await prisma.controleAcesso.deleteMany({
    where: { processoId, colaboradorId }
  })

  return NextResponse.json({ message: 'Acesso removido com sucesso' })
}
