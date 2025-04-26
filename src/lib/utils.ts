// src/lib/utils.ts
// -----------------------------------------------------------------------------
// helpers de Tailwind
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tipagens Prisma
import type { Processo, Documento, Movimentacao } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// -----------------------------------------------------------------------------
// Tipos com relacionamentos
export type MovimentacaoComRel = Movimentacao & {
  de?: { nome: string };
  para?: { nome: string };
};

export type ProcessoComRel = Processo & {
  documentos: Documento[];
  movimentacoes: MovimentacaoComRel[];
};

// -----------------------------------------------------------------------------
// Separa processos que “pertencem” ao setor (Gerados) e os “Recebidos”
export function separarProcessosPorSetor(
  processos: ProcessoComRel[],
  setorId: number
): {
  processosGerados: ProcessoComRel[];
  processosRecebidos: ProcessoComRel[];
} {
  const processosGerados: ProcessoComRel[] = [];
  const processosRecebidos: ProcessoComRel[] = [];

  for (const proc of processos) {
    const movs = proc.movimentacoes ?? [];

    // 1) SEM movimentações → considera gerado no setor atual
    if (movs.length === 0) {
      processosGerados.push(proc);
      continue;
    }

    // 2) COM movimentações
    const primeira = movs[0];
    const ultima = movs[movs.length - 1];

    // Foi criado aqui se a 1ª mov. tem DE = PARA = setorId
    const foiGeradoAqui =
      primeira.deSetor === setorId && primeira.paraSetor === setorId;

    // Continua no setor de origem?
    const continuaNoOrigem =
      ultima.manterAbertoNoSetorOrigem && ultima.deSetor === setorId;

    // Está ativo (presente) no setor destino?
    const estaNoDestino = ultima.paraSetor === setorId && ultima.ativo;

    if (foiGeradoAqui || continuaNoOrigem) {
      processosGerados.push(proc);
    }

    if (estaNoDestino) {
      processosRecebidos.push(proc);
    }
  }

  return { processosGerados, processosRecebidos };
}
