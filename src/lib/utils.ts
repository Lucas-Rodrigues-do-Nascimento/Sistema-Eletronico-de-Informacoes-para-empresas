// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Processo, Documento, Movimentacao, ControleAcesso } from "@prisma/client";

// Helper de classes CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Tipos com relacionamentos
export type MovimentacaoSelecionada = Pick<Movimentacao, 'paraSetor' | 'manterAbertoNoSetorOrigem' | 'ativo' | 'deSetor'>;
export type DocumentoSelecionado = Pick<Documento, 'id' | 'nome'>;
export type ControleAcessoSelecionado = Pick<ControleAcesso, 'id'>;
export type ProcessoComRelSelecionado = Pick<Processo,
    'id' | 'numero' | 'tipo' | 'especificacao' | 'interessado' | 'acesso' | 'criadoEm' | 'arquivado' | 'criadorId' | 'setorOrigemId'
> & {
    documentos: DocumentoSelecionado[];
    movimentacoes: MovimentacaoSelecionada[];
    controleAcessos: ControleAcessoSelecionado[];
};

export function separarProcessosPorSetor(
  processos: ProcessoComRelSelecionado[],
  setorIdUsuario: number,
  userId: number,
  userPermissoes: string[] = []
): {
  processosGerados: ProcessoComRelSelecionado[];
  processosRecebidos: ProcessoComRelSelecionado[];
} {
  console.log(`--- [Separar] Iniciando separação para User ID: ${userId}, Setor ID: ${setorIdUsuario}. Total processos recebidos: ${processos.length}`);

  const processosGerados: ProcessoComRelSelecionado[] = [];
  const processosRecebidos: ProcessoComRelSelecionado[] = [];

  for (const proc of processos) {
    console.log(`\n--- [Separar] Processando Proc ID: ${proc.id}, Numero: ${proc.numero}, Acesso: ${proc.acesso}, CriadorID: ${proc.criadorId}`);

    // --- 1. VERIFICAÇÃO DE PERMISSÃO DE VISUALIZAÇÃO PARA A LISTAGEM PRINCIPAL ---
    let podeListar = false; // Nova variável para clareza
    let motivoPermissaoListagem = "Nenhuma condição atendida";

    // --- ALTERAÇÃO AQUI ---
    // Para a listagem, 'Público' E 'Restrito' são sempre visíveis.
    // A restrição real de 'Restrito' será aplicada ao tentar abrir (na API /processos/[id]).
    if (proc.acesso === 'Público' || proc.acesso === 'Restrito') {
      podeListar = true;
      motivoPermissaoListagem = `É ${proc.acesso} (permitido na listagem)`;
    }
    // Para 'Sigiloso', mantém a lógica anterior: só pode listar se for criador ou tiver acesso direto.
    // A permissão geral 'ACESSO_SIGILOSO' NÃO é verificada aqui, pois já simplificamos.
    else if (proc.acesso === 'Sigiloso') {
      if (proc.criadorId === userId) {
        podeListar = true;
        motivoPermissaoListagem = `É Criador (Sigiloso)`;
      } else if (proc.controleAcessos.length > 0) { // controleAcessos já veio filtrado
        podeListar = true;
        motivoPermissaoListagem = `Está no ControleAcesso (Sigiloso)`;
      }
    }
    // --- FIM DA ALTERAÇÃO ---

    console.log(`--- [Separar] ---> Decisão para LISTAGEM Proc ID ${proc.id}: podeListar = ${podeListar} (Motivo: ${motivoPermissaoListagem})`);

    if (!podeListar) {
      console.log(`--- [Separar] ---> PULANDO Proc ID ${proc.id} da listagem por falta de permissão.`);
      continue; // Pula para o próximo processo
    }
    // --- FIM VERIFICAÇÃO DE PERMISSÃO PARA LISTAGEM ---


    // --- 2. LÓGICA DE SEPARAÇÃO GERADOS/RECEBIDOS (sem alterações) ---
    const ultimaMovimentacaoAtiva = proc.movimentacoes.length > 0 ? proc.movimentacoes[0] : null;
    let geradoNoSetor = proc.setorOrigemId === setorIdUsuario;

    console.log(`--- [Separar] ---> Lógica Setor Proc ID ${proc.id}: geradoNoSetor=${geradoNoSetor}, ultimaMov=${JSON.stringify(ultimaMovimentacaoAtiva)}`);

    let foiParaGerados = false;
    if (geradoNoSetor && (!ultimaMovimentacaoAtiva || (ultimaMovimentacaoAtiva.manterAbertoNoSetorOrigem && ultimaMovimentacaoAtiva.deSetor === setorIdUsuario))) {
        processosGerados.push(proc);
        foiParaGerados = true;
        console.log(`--- [Separar] ---> Adicionado a GERADOS Proc ID ${proc.id}`);
    }

    if (ultimaMovimentacaoAtiva && ultimaMovimentacaoAtiva.paraSetor === setorIdUsuario) {
        const jaEstaEmGeradosPorManterAberto = geradoNoSetor && ultimaMovimentacaoAtiva.manterAbertoNoSetorOrigem && ultimaMovimentacaoAtiva.deSetor === setorIdUsuario;
        if (!jaEstaEmGeradosPorManterAberto) {
            processosRecebidos.push(proc);
             console.log(`--- [Separar] ---> Adicionado a RECEBIDOS Proc ID ${proc.id}`);
        } else {
             console.log(`--- [Separar] ---> Já está em Gerados (mantido aberto), não adicionando a Recebidos Proc ID ${proc.id}`);
        }
    } else if (!foiParaGerados && pertenceAoSetor(proc, setorIdUsuario)) {
         console.log(`--- [Separar] ---> Proc ID ${proc.id} pertence ao setor mas não se encaixa em Gerado/Recebido padrão.`);
    }

  } // Fim do loop for

  console.log(`--- [Separar] Finalizado. Gerados: ${processosGerados.length}, Recebidos: ${processosRecebidos.length}`);
  return { processosGerados, processosRecebidos };
}

// Função pertenceAoSetor (sem alterações)
function pertenceAoSetor(proc: ProcessoComRelSelecionado, setorIdUsuario: number): boolean {
    if (proc.setorOrigemId === setorIdUsuario && proc.movimentacoes.length === 0) { return true; }
    const ultimaMov = proc.movimentacoes.length > 0 ? proc.movimentacoes[0] : null;
    if (ultimaMov && ultimaMov.ativo && ultimaMov.paraSetor === setorIdUsuario) { return true; }
    if (ultimaMov && ultimaMov.ativo && ultimaMov.manterAbertoNoSetorOrigem && ultimaMov.deSetor === setorIdUsuario) { return true; }
    return false;
}