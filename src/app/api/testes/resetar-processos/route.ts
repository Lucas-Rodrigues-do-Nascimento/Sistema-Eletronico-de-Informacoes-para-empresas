// src/app/api/testes/resetar-processos/route.ts

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE() {
  try {
    await prisma.documento.deleteMany({})
    await prisma.movimentacao.deleteMany({})
    await prisma.processo.deleteMany({})

    return NextResponse.json({
      message: '✅ Todos os processos, documentos e movimentações foram removidos com sucesso.',
    })
  } catch (error) {
    console.error('❌ Erro ao resetar dados:', error)
    return NextResponse.json({ error: 'Erro ao resetar os processos' }, { status: 500 })
  }
}
