import { create } from 'zustand'
import { toast } from 'sonner'

interface Documento {
  id: number
  nome: string
  tipo: string
  criadoEm: string
  assinadoPor?: string
  cargoAssinatura?: string
  dataAssinatura?: string
}

interface Movimentacao {
  id: number
  de?: { nome: string }
  para?: { nome: string }
  criadoEm: string
  ativo: boolean
}

interface Processo {
  id: number
  numero: string | null
  tipo: string
  especificacao: string
  interessado: string
  acesso: string
  criadoEm: string
  arquivado?: boolean
}

interface ColaboradorAutorizado {
  id: number
  nome: string
}

interface ProcessoState {
  // Estado
  processo: Processo | null
  documentos: Documento[]
  historico: Movimentacao[]
  selected: Documento | null
  selectedPdfUrl: string | null
  loading: boolean
  error: string | null
  colaboradoresAutorizados: ColaboradorAutorizado[]
  novoColaboradorId: number | null

  // Modais
  showUploadExterno: boolean
  showAssinaturaModal: boolean
  showHistoricoModal: boolean
  showGerenciarAcesso: boolean

  // Ações
  setProcesso: (processo: Processo | null) => void
  setDocumentos: (documentos: Documento[]) => void
  setHistorico: (historico: Movimentacao[]) => void
  setSelected: (selected: Documento | null) => void
  setSelectedPdfUrl: (url: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setColaboradoresAutorizados: (colaboradores: ColaboradorAutorizado[]) => void
  setNovoColaboradorId: (id: number | null) => void

  // Ações de Modal
  setShowUploadExterno: (show: boolean) => void
  setShowAssinaturaModal: (show: boolean) => void
  setShowHistoricoModal: (show: boolean) => void
  setShowGerenciarAcesso: (show: boolean) => void

  // Ações de CRUD
  carregarDados: (processoId: number, docIdParaSelecionar?: number) => Promise<void>
  excluirDocumento: (docId: number) => Promise<void>
  arquivarProcesso: () => Promise<void>
  reabrirProcesso: () => Promise<void>
  adicionarColaboradorAutorizado: () => Promise<void>
  removerColaboradorAutorizado: (colaboradorId: number) => Promise<void>
}

export const useProcessoStore = create<ProcessoState>((set, get) => ({
  // Estado inicial
  processo: null,
  documentos: [],
  historico: [],
  selected: null,
  selectedPdfUrl: null,
  loading: false,
  error: null,
  colaboradoresAutorizados: [],
  novoColaboradorId: null,

  // Estado dos modais
  showUploadExterno: false,
  showAssinaturaModal: false,
  showHistoricoModal: false,
  showGerenciarAcesso: false,

  // Setters
  setProcesso: (processo) => set({ processo }),
  setDocumentos: (documentos) => set({ documentos }),
  setHistorico: (historico) => set({ historico }),
  setSelected: (selected) => set({ selected }),
  setSelectedPdfUrl: (selectedPdfUrl) => set({ selectedPdfUrl }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setColaboradoresAutorizados: (colaboradoresAutorizados) => set({ colaboradoresAutorizados }),
  setNovoColaboradorId: (novoColaboradorId) => set({ novoColaboradorId }),

  // Setters de Modal
  setShowUploadExterno: (showUploadExterno) => set({ showUploadExterno }),
  setShowAssinaturaModal: (showAssinaturaModal) => set({ showAssinaturaModal }),
  setShowHistoricoModal: (showHistoricoModal) => set({ showHistoricoModal }),
  setShowGerenciarAcesso: (showGerenciarAcesso) => set({ showGerenciarAcesso }),

  // Ações de CRUD
  carregarDados: async (processoId, docIdParaSelecionar) => {
    set({ loading: true, error: null })
    try {
      // Salva o ID do processo atual antes de carregar o novo
      const processoAnteriorId = get().processo?.id;
      
      const [pRes, dRes, hRes] = await Promise.all([
        fetch(`/api/processos/${processoId}`),
        fetch(`/api/processos/${processoId}/documentos`),
        fetch(`/api/processos/${processoId}/historico`)
      ])

      if (pRes.status === 403 || dRes.status === 403 || hRes.status === 403) {
        throw new Error('Acesso negado a este processo')
      }

      if (!pRes.ok) throw new Error(`Falha ao carregar processo (Status: ${pRes.status})`)
      if (!dRes.ok) throw new Error(`Falha ao carregar documentos (Status: ${dRes.status})`)
      if (!hRes.ok) throw new Error(`Falha ao carregar histórico (Status: ${hRes.status})`)

      const processo = await pRes.json()
      const documentos = await dRes.json()
      const historico = await hRes.json()

      set({ processo, documentos, historico })

      // Verifica se estamos trocando de processo
      const mudouProcesso = processoAnteriorId !== undefined && processoAnteriorId !== processoId;
      
      if (docIdParaSelecionar) {
        // Caso específico: quero selecionar um documento específico
        const doc = documentos.find((d: Documento) => d.id === docIdParaSelecionar)
        set({ selected: doc || null })
      } else if (mudouProcesso) {
        // Se mudou de processo, seleciona o primeiro documento ou nenhum
        const primeiroDocumento = documentos.length > 0 ? documentos[0] : null;
        set({ selected: primeiroDocumento });
        console.log(`[useProcessoStore] Mudou de processo ${processoAnteriorId} -> ${processoId}. Selecionando primeiro documento:`, primeiroDocumento?.id || 'nenhum');
      } else {
        // Caso normal: mantém seleção atual se documento ainda existir
        const { selected } = get()
        if (selected) {
          const docAindaExiste = documentos.some((d: Documento) => d.id === selected.id)
          if (!docAindaExiste) set({ selected: null })
        }
      }
    } catch (error: any) {
      set({ error: error.message })
      toast.error(error.message)
    } finally {
      set({ loading: false })
    }
  },

  excluirDocumento: async (docId) => {
    const { processo } = get()
    if (!processo || !confirm('Confirma exclusão deste documento?')) return

    try {
      const res = await fetch(`/api/processos/${processo.id}/documentos/${docId}`, { 
        method: 'DELETE' 
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro ${res.status} ao excluir documento`)
      }

      set({ selected: null })
      await get().carregarDados(processo.id)
      toast.success('Documento excluído com sucesso!')
    } catch (error: any) {
      toast.error(error.message)
    }
  },

  arquivarProcesso: async () => {
    const { processo } = get()
    if (!processo || !confirm('Confirma arquivamento deste processo?')) return

    try {
      const res = await fetch(`/api/processos/${processo.id}/arquivar`, { 
        method: 'PATCH' 
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro ${res.status} ao arquivar`)
      }

      await get().carregarDados(processo.id)
      toast.success('Processo arquivado com sucesso!')
    } catch (error: any) {
      toast.error(error.message)
    }
  },

  reabrirProcesso: async () => {
    const { processo } = get()
    if (!processo || !confirm('Confirma reabertura deste processo?')) return

    try {
      const res = await fetch(`/api/processos/${processo.id}/reabrir`, { 
        method: 'PATCH' 
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro ${res.status} ao reabrir`)
      }

      await get().carregarDados(processo.id)
      toast.success('Processo reaberto com sucesso!')
    } catch (error: any) {
      toast.error(error.message)
    }
  },

  adicionarColaboradorAutorizado: async () => {
    const { processo, novoColaboradorId } = get()
    if (!processo || !novoColaboradorId) {
      toast.error("Selecione um colaborador.")
      return
    }

    try {
      const res = await fetch(`/api/processos/${processo.id}/colaboradores-autorizados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colaboradorId: novoColaboradorId })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `Erro ${res.status}`)
      }

      set({ novoColaboradorId: null })
      await get().carregarDados(processo.id)
      toast.success('Acesso concedido com sucesso!')
    } catch (error: any) {
      toast.error(error.message)
    }
  },

  removerColaboradorAutorizado: async (colaboradorId) => {
    const { processo } = get()
    if (!processo || !confirm(`Remover acesso do colaborador ID ${colaboradorId}?`)) return

    try {
      const res = await fetch(`/api/processos/${processo.id}/colaboradores-autorizados`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colaboradorId })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `Erro ${res.status}`)
      }

      await get().carregarDados(processo.id)
      toast.success('Acesso removido com sucesso!')
    } catch (error: any) {
      toast.error(error.message)
    }
  }
})) 