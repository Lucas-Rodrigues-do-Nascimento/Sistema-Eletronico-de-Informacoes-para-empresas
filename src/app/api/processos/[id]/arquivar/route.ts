// src/app/api/processos/[id]/arquivar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { possuiPermissao } from '@/lib/permissoes' // ✅ importado

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const processoId = Number(params.id)

  if (isNaN(processoId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  // 🔐 Sessão e colaborador
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

  // ✅ Verificação de permissão com helper
  if (!possuiPermissao(colaborador, 'ver_arquivados')) {
    return NextResponse.json(
      { error: 'Você não tem permissão para arquivar processos.' },
      { status: 403 }
    )
  }

  // ✨ Arquivar processo
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
