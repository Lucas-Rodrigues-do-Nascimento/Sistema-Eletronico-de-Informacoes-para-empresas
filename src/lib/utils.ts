// src/lib/utils.ts

// -----------------------------------------------------------------------------
// helpers de Tailwind
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Tipagens Prisma
import type { Processo, Documento, Movimentacao } from "@prisma/client";

// Helper de classes CSS
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

    if (movs.length === 0) {
      processosGerados.push(proc);
      continue;
    }

    const movimentacoesAtivas = movs.filter((m) => m.ativo);
    if (movimentacoesAtivas.length === 0) {
      continue;
    }

    const manterNoOrigem = movimentacoesAtivas.some(
      (m) => m.deSetor === setorId && m.manterAbertoNoSetorOrigem
    );

    const geradoAqui = movimentacoesAtivas.some(
      (m) => m.deSetor === setorId && m.paraSetor === setorId
    );

    const estaAtivoAqui = movimentacoesAtivas.some(
      (m) => m.paraSetor === setorId
    );

    if (manterNoOrigem || geradoAqui) {
      processosGerados.push(proc);
    } else if (estaAtivoAqui) {
      processosRecebidos.push(proc);
    }
  }

  return { processosGerados, processosRecebidos };
}
