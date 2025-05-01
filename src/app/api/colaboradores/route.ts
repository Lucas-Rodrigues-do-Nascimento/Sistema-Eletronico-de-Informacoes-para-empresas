import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/* ─────────────── POST → Criar novo colaborador ─────────────── */
export async function POST(req: Request) {
  try {
    const { nome, email, senha, cpf, telefone, cargo, setorId, permissoes } = await req.json(); // <-- permissoes (array)

    if (!nome || !email || !senha || !cpf || !setorId || !permissoes || !Array.isArray(permissoes)) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos.' },
        { status: 400 }
      );
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const colaborador = await prisma.colaborador.create({
      data: {
        nome,
        email,
        cpf,
        telefone,
        cargo,
        senha: senhaCriptografada,
        ativo: true,
        setor: {
          connect: { id: Number(setorId) },
        },
        permissoes: {
          connect: permissoes.map((id: number) => ({ id })), // <-- conecta múltiplas permissões
        },
      },
    });

    return NextResponse.json(colaborador, { status: 201 });
  } catch (error) {
    console.error('[POST /api/colaboradores]', error);
    return new NextResponse('Erro interno ao cadastrar colaborador.', { status: 500 });
  }
}

/* ─────────────── GET → Listar todos colaboradores ─────────────── */
export async function GET() {
  try {
    const colaboradores = await prisma.colaborador.findMany({
      include: {
        setor: { select: { id: true, nome: true } },
        permissoes: { select: { id: true, nome: true, codigo: true } }, // <-- permissoes (plural)
      },
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json(colaboradores);
  } catch (error) {
    console.error('[GET /api/colaboradores]', error);
    return new NextResponse('Erro interno ao listar colaboradores.', { status: 500 });
  }
}

/* ─────────────── PATCH → Ativar/Inativar colaborador ─────────────── */
export async function PATCH(req: Request) {
  try {
    const { id, ativo } = await req.json();

    if (!id || typeof ativo !== 'boolean') {
      return NextResponse.json(
        { error: 'ID e novo status são obrigatórios.' },
        { status: 400 }
      );
    }

    const colaborador = await prisma.colaborador.update({
      where: { id: Number(id) },
      data: { ativo },
    });

    return NextResponse.json(colaborador);
  } catch (error) {
    console.error('[PATCH /api/colaboradores]', error);
    return new NextResponse('Erro interno ao atualizar status.', { status: 500 });
  }
}
