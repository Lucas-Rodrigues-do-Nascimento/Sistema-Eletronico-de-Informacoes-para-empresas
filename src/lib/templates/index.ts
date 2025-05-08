import { htmlMemorandoTemplate } from './documentos/memorando';
import { htmlDespachoTemplate } from './documentos/despacho';
import { 
  htmlRequisicaoTemplate, 
  htmlOrdemTemplate,
  htmlJustificativaTemplate,
  htmlPagamentoTemplate
} from './documentos/simples';

// Estrutura dos templates
export interface TemplateDocumento {
  modelo: string;    // Identificador único do modelo (usado internamente)
  label: string;     // Nome exibido na interface do usuário (com emoji)
  html: string;      // Conteúdo HTML do template
  descricao?: string; // Descrição opcional do modelo
}

// Catálogo completo de templates
export const templatesDocumentos: TemplateDocumento[] = [
  { 
    modelo: 'memorando', 
    label: '📄 Memorando',
    html: htmlMemorandoTemplate,
    descricao: 'Comunicação interna formal entre setores ou colaboradores'
  },
  { 
    modelo: 'despacho', 
    label: '📌 Despacho',
    html: htmlDespachoTemplate,
    descricao: 'Documento para aprovação, encaminhamento ou decisão sobre processos'
  },
  { 
    modelo: 'requisicao', 
    label: '🛒 Requisição',
    html: htmlRequisicaoTemplate,
    descricao: 'Solicitação de materiais ou serviços'
  },
  { 
    modelo: 'ordem', 
    label: '🧾 Ordem',
    html: htmlOrdemTemplate,
    descricao: 'Ordem de serviço ou execução de tarefa'
  },
  { 
    modelo: 'justificativa', 
    label: '📑 Justificativa',
    html: htmlJustificativaTemplate,
    descricao: 'Documento que apresenta razões para determinada decisão ou pedido'
  },
  { 
    modelo: 'pagamento', 
    label: '💰 Pagamento',
    html: htmlPagamentoTemplate,
    descricao: 'Solicitação de pagamento a fornecedores ou prestadores'
  }
];

// Função auxiliar para obter um template específico por ID
export function getTemplateById(modeloId: string): TemplateDocumento | undefined {
  return templatesDocumentos.find(t => t.modelo === modeloId);
}

// Funções auxiliares específicas para tipos de documentos
export function getTemplateHtml(modeloId: string): string {
  const template = getTemplateById(modeloId);
  if (!template) {
    console.warn(`Template não encontrado: ${modeloId}. Usando template padrão.`);
    return '<p>Digite o conteúdo aqui...</p>';
  }
  return template.html;
}

// Exporta também os templates individuais para uso direto se necessário
export {
  htmlMemorandoTemplate,
  htmlDespachoTemplate,
  htmlRequisicaoTemplate,
  htmlOrdemTemplate,
  htmlJustificativaTemplate,
  htmlPagamentoTemplate
}; 