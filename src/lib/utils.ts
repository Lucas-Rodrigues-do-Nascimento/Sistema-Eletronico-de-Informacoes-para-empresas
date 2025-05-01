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
      // Sem movimentações: considera como gerado pelo setor atual
      processosGerados.push(proc);
      continue;
    }

    const primeira = movs[0];
    const ultima = movs[movs.length - 1];

    // Verifica se o processo foi gerado pelo setor atual
    const foiGeradoAqui = primeira.deSetor === setorId;

    // Verifica se o processo está ativo no setor atual
    const estaAtivoAqui =
      ultima.ativo && ultima.paraSetor === setorId;

    // Verifica se o processo permanece aberto no setor de origem
    const manterNoOrigem =
      ultima.manterAbertoNoSetorOrigem && ultima.deSetor === setorId;

    // Adiciona à lista de gerados se foi gerado aqui ou permanece no setor de origem
    if (foiGeradoAqui || manterNoOrigem) {
      processosGerados.push(proc);
    } else if (estaAtivoAqui) {
      // Caso contrário, se está ativo aqui, adiciona à lista de recebidos
      processosRecebidos.push(proc);
    }
  }

  return { processosGerados, processosRecebidos };
}
