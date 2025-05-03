// src/app/api/processos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET → Lista todos os processos (somente os não arquivados)
export async function GET() {
  try {
    const processos = await prisma.processo.findMany({
      where: { arquivado: false },
      orderBy: { criadoEm: 'desc' },
    })

    return NextResponse.json(processos)
  } catch (error) {
    console.error('[ERRO_GET_TODOS_PROCESSOS]', error)
    return NextResponse.json({ error: 'Erro ao buscar processos' }, { status: 500 })
  }
}

// POST → Cria um novo processo com número sequencial no formato 01/2025
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const setorId = Number(session?.user?.setor)
    const colaboradorId = Number(session?.user?.id)

    if (!setorId || isNaN(setorId) || !colaboradorId || isNaN(colaboradorId)) {
      return NextResponse.json(
        { error: 'Setor ou colaborador não identificado' },
        { status: 403 }
      )
    }

    const { tipo, especificacao, interessado, acesso, autorizados = [] } = await req.json()

    if (!tipo || !especificacao || !interessado || !acesso) {
      return NextResponse.json(
        { error: 'Dados obrigatórios ausentes' },
        { status: 400 }
      )
    }

    const agora = new Date()
    const anoAtual = agora.getFullYear()

    const quantidadeNoAno = await prisma.processo.count({
      where: {
        criadoEm: {
          gte: new Date(`${anoAtual}-01-01T00:00:00.000Z`),
          lte: new Date(`${anoAtual}-12-31T23:59:59.999Z`),
        },
      },
    })

    const numeroFormatado = `${(quantidadeNoAno + 1).toString().padStart(2, '0')}/${anoAtual}`

    const novoProcesso = await prisma.processo.create({
      data: {
        numero: numeroFormatado,
        tipo,
        especificacao,
        interessado,
        acesso,
        arquivado: false,
        setorOrigem: { connect: { id: setorId } },
        criador: { connect: { id: colaboradorId } }, // ✅ CORRIGIDO
        movimentacoes: {
          create: {
            deSetor: setorId,
            paraSetor: setorId,
            observacoes: 'Criação do processo',
          },
        },
        controleAcessos:
          acesso === 'Público'
            ? undefined
            : {
                create: autorizados.map((colaboradorId: number) => ({
                  colaborador: { connect: { id: colaboradorId } },
                })),
              },
      },
      include: {
        controleAcessos: true,
      },
    })

    return NextResponse.json(novoProcesso, { status: 201 })
  } catch (error: any) {
    console.error('[ERRO_POST_PROCESSO]', error?.message || error)
    return NextResponse.json(
      { error: 'Erro ao criar processo', detalhe: error?.message },
      { status: 500 }
    )
  }
}
