// src/app/api/processos/pesquisar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);
    const userPermissoes = session?.user?.permissoes || [];

    if (!userId) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const podePesquisar = userPermissoes.includes('padrao') || userPermissoes.includes('ADMIN');
    if (!podePesquisar) {
        return NextResponse.json({ error: 'Você não tem permissão para pesquisar processos.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // Paginação
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Filtros de Busca
    const numeroProcesso = searchParams.get('numero')?.trim();
    const tipoProcesso = searchParams.get('tipo')?.trim();
    const interessado = searchParams.get('interessado')?.trim();
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const status = searchParams.get('status'); // 'ativo', 'arquivado', ou 'todos'

    // Permissões
    // const temPermissaoSigilosoGeral = userPermissoes.includes('ACESSO_SIGILOSO'); // Não é mais usada para bloquear aqui
    const podeVerArquivados = userPermissoes.includes('ver_arquivados') || userPermissoes.includes('ADMIN');

    try {
        // --- Construir Array de Filtros AND ---
        const andFilters: Prisma.ProcessoWhereInput[] = [];

        // 1. Adiciona filtros básicos se existirem
        const baseFilters: Prisma.ProcessoWhereInput = {
            ...(status === 'ativo' && { arquivado: false }),
            ...(status === 'arquivado' && { arquivado: true }),
            ...(numeroProcesso && { numero: { startsWith: numeroProcesso } }), // Usando startsWith
            ...(tipoProcesso && { tipo: { contains: tipoProcesso } }),
            ...(interessado && { interessado: { contains: interessado } }),
            ...(dataInicio && dataFim ? { criadoEm: { gte: new Date(dataInicio), lte: new Date(new Date(dataFim).setHours(23, 59, 59, 999)) } } : dataInicio ? { criadoEm: { gte: new Date(dataInicio) } } : dataFim ? { criadoEm: { lte: new Date(new Date(dataFim).setHours(23, 59, 59, 999)) } } : {}),
        };
         if (Object.keys(baseFilters).length > 0 || (numeroProcesso || tipoProcesso || interessado || dataInicio || dataFim || status !== 'todos')) {
            if (Object.keys(baseFilters).length > 0){
                 andFilters.push(baseFilters);
            }
        }

        // 2. Adiciona filtros de permissão (LÓGICA SIMPLIFICADA)
        const permissionFilters: Prisma.ProcessoWhereInput = {
            OR: [
                // 1. Processo é Público
                { acesso: 'Público' },

                // 2. Para processos Não-Públicos (Restrito OU Sigiloso),
                //    basta ser o criador OU estar no controle de acesso.
                {
                    acesso: { not: 'Público' }, // Ou { in: ['Restrito', 'Sigiloso'] }
                    OR: [
                        { criadorId: userId },
                        { controleAcessos: { some: { colaboradorId: userId } } }
                    ]
                }
            ]
        };
        andFilters.push(permissionFilters);

        // 3. Adiciona filtro de status baseado na permissão de arquivados
        if ((status === 'arquivado' || !status || status === 'todos') && !podeVerArquivados) {
            andFilters.push({ arquivado: false });
        }

        // --- Monta a Cláusula Where Final ---
        let whereClause: Prisma.ProcessoWhereInput = {};
        if (andFilters.length > 1) {
            whereClause = { AND: andFilters };
        } else if (andFilters.length === 1) {
            whereClause = andFilters[0];
        }

        console.log("Where Clause Final:", JSON.stringify(whereClause, null, 2));

        const [processos, total] = await prisma.$transaction([
            prisma.processo.findMany({
                where: whereClause,
                select: {
                    id: true, numero: true, tipo: true, interessado: true,
                    criadoEm: true, acesso: true, arquivado: true,
                },
                orderBy: { criadoEm: 'desc' },
                skip: skip,
                take: take,
            }),
            prisma.processo.count({ where: whereClause }),
        ]);

        return NextResponse.json({
            data: processos,
            pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
        });
    } catch (error: any) {
        console.error('[ERRO_PESQUISA_PROCESSO]', error);
        return NextResponse.json({ error: 'Erro interno ao pesquisar processos', details: error.message }, { status: 500 });
    }
}