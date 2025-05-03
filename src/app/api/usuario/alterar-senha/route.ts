// ✅ src/app/api/usuario/alterar-senha/route.ts
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { compare, hash } from 'bcryptjs'

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  const { senhaAtual, novaSenha, confirmarSenha } = await req.json()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (!senhaAtual || !novaSenha || !confirmarSenha) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
  }

  if (novaSenha.length < 6) {
    return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, { status: 400 })
  }

  if (novaSenha !== confirmarSenha) {
    return NextResponse.json({ error: 'Confirmação de senha incorreta' }, { status: 400 })
  }

  const colaborador = await prisma.colaborador.findUnique({
    where: { id: parseInt(session.user.id) },
  })

  if (!colaborador || !colaborador.senha) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const senhaCorreta = await compare(senhaAtual, colaborador.senha)
  if (!senhaCorreta) {
    return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 403 })
  }

  const novaHash = await hash(novaSenha, 10)

  await prisma.colaborador.update({
    where: { id: colaborador.id },
    data: { senha: novaHash },
  })

  return NextResponse.json({ message: '✅ Senha atualizada com sucesso' })
}
