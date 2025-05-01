import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { possuiPermissao } from '@/lib/permissoes' // ✅ Importando o helper

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  const { setor } = await req.json()

  if (!session?.user?.id || !setor) {
    return NextResponse.json(
      { error: 'Sessão inválida ou setor ausente.' },
      { status: 400 }
    )
  }

  // 🔐 Buscar colaborador com permissões
  const colaborador = await prisma.colaborador.findUnique({
    where: { id: parseInt(session.user.id) },
    include: { permissoes: true },
  })

  if (!colaborador) {
    return NextResponse.json(
      { error: 'Colaborador não encontrado.' },
      { status: 404 }
    )
  }

  // ✅ Verifica permissão com helper
  if (!possuiPermissao(colaborador, 'mudar_setor')) {
    return NextResponse.json(
      { error: 'Você não tem permissão para mudar de setor.' },
      { status: 403 }
    )
  }

  try {
    const atualizado = await prisma.colaborador.update({
      where: { id: colaborador.id },
      data: { setorId: setor },
    })

    return NextResponse.json({
      message: '✅ Setor atualizado com sucesso',
      setorId: atualizado.setorId,
    })
  } catch (error) {
    console.error('❌ Erro ao atualizar setor:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar setor do usuário' },
      { status: 500 }
    )
  }
}
