'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FilePlus, ArrowLeftRight, FileDown, Archive, Trash,
  Pencil, Clock4, CornerDownLeft, LockOpen, Users
} from 'lucide-react'
import UploadDocumentoExterno from '@/components/UploadDocumentoExterno'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu'
import ModalAssinatura from '@/components/ModalAssinatura'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'

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
}
interface Processo {
  id: number
  numero: string
  tipo: string
  especificacao: string
  interessado: string
  acesso: string
  criadoEm: string
  arquivado?: boolean
}
interface Props {
  processoId: string
}

export default function ProcessosCliente({ processoId }: Props) {
  const id = Number(processoId)
  const router = useRouter()
  const [processo, setProcesso] = useState<Processo | null>(null)
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [historico, setHistorico] = useState<Movimentacao[]>([])
  const [selected, setSelected] = useState<Documento | null>(null)
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUploadExterno, setShowUploadExterno] = useState(false)
  const [showAssinaturaModal, setShowAssinaturaModal] = useState(false)
  const [showHistoricoModal, setShowHistoricoModal] = useState(false)
  const [showGerenciarAcesso, setShowGerenciarAcesso] = useState(false)

  const modelosInternos = [
    { modelo: 'memorando', label: '📄 Memorando' },
    { modelo: 'requisicao', label: '🛒 Requisição' },
    { modelo: 'ordem', label: '🧾 Ordem' },
    { modelo: 'justificativa', label: '📑 Justificativa' },
    { modelo: 'pagamento', label: '💰 Pagamento' },
    { modelo: 'despacho', label: '📌 Despacho' },
  ]

  async function carregarDados(docIdParaSelecionar?: number) {
    try {
      const [pRes, dRes, hRes] = await Promise.all([
        fetch(`/api/processos/${id}`),
        fetch(`/api/processos/${id}/documentos`),
        fetch(`/api/processos/${id}/historico`)
      ])

      if (pRes.status === 403) {
        throw new Error('Você não tem permissão para acessar este processo.')
      }
      if (!pRes.ok) throw new Error('Falha ao carregar processo')
      if (!dRes.ok) throw new Error('Falha ao carregar documentos')
      if (!hRes.ok) throw new Error('Falha ao carregar histórico')

      const novoProcesso = await pRes.json()
      const novosDocumentos = await dRes.json()
      setProcesso(novoProcesso)
      setDocumentos(novosDocumentos)
      setHistorico(await hRes.json())

      if (docIdParaSelecionar) {
        const novoDoc = novosDocumentos.find((d: Documento) => d.id === docIdParaSelecionar)
        if (novoDoc) setSelected(novoDoc)
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function excluirDocumento(docId: number) {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return
    try {
      const res = await fetch(`/api/processos/${id}/documentos/${docId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir documento')
      setSelected(null)
      carregarDados()
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir documento')
    }
  }

  async function baixarZip() {
    window.open(`/api/processos/${id}/download-zip`, '_blank')
  }

  async function arquivarProcesso() {
    try {
      const res = await fetch(`/api/processos/${id}/arquivar`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Erro ao arquivar processo')
      await carregarDados()
      alert('Processo arquivado com sucesso.')
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Erro ao arquivar')
    }
  }

  async function reabrirProcesso() {
    try {
      const res = await fetch(`/api/processos/${id}/reabrir`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Erro ao reabrir processo')
      await carregarDados()
      alert('Processo reaberto com sucesso.')
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Erro ao reabrir')
    }
  }

  useEffect(() => {
    if (!isNaN(id) && id > 0) carregarDados()
    else {
      setError('ID de processo inválido')
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (selected) {
      setSelectedPdfUrl(`/api/processos/${id}/documentos/${selected.id}?v=${Date.now()}`)
    } else {
      setSelectedPdfUrl(null)
    }
  }, [selected, id])

  const renderDocumento = () => {
    if (!selectedPdfUrl) return null
    const isInterno = selected?.tipo === 'interno'
    return (
      <div className="flex-1 overflow-auto bg-white shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">{selected?.nome}</h3>
          <div className="flex gap-2">
            {isInterno && (
              <>
                <Button size="sm" variant="secondary" onClick={() => {
                  window.open(
                    `/controle-de-processos/${id}/editar-documento/${selected?.id}`,
                    '_blank',
                    'popup=yes,width=1000,height=800,scrollbars=yes,noopener'
                  )
                }}>
                  <Pencil className="w-4 h-4 mr-1" /> Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAssinaturaModal(true)}>
                  🔐 Assinar
                </Button>
              </>
            )}
            <Button size="sm" variant="destructive" onClick={() => excluirDocumento(selected!.id)}>
              <Trash className="w-4 h-4 mr-1" /> Excluir
            </Button>
          </div>
        </div>
        <iframe
          key={selectedPdfUrl}
          src={selectedPdfUrl}
          title={selected?.nome}
          className="w-full h-full min-h-[400px] border rounded"
        />
        {showAssinaturaModal && selected?.id && (
          <ModalAssinatura
            documentoId={selected.id}
            onClose={() => setShowAssinaturaModal(false)}
            onSuccess={() => {
              setShowAssinaturaModal(false)
              carregarDados(selected.id)
            }}
          />
        )}
      </div>
    )
  }

  if (loading) return <div className="p-4">Carregando…</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>
  if (!processo) return <div className="p-4">Processo não encontrado</div>

  return (
    <div className="flex h-screen">
      <aside className={`w-1/4 border-r bg-white p-4 overflow-auto transition-all duration-300 ${selected ? 'shadow-lg backdrop-blur-sm bg-white/80' : ''}`}>
        <button onClick={() => setSelected(null)} className="w-full text-left font-bold text-lg mb-4 hover:underline shadow-sm">
          <span className="drop-shadow-md">Processo #{processo.numero}</span>
        </button>
        <ul className="space-y-2">
          {documentos.map(doc => (
            <li
              key={doc.id}
              onClick={() => setSelected(doc)}
              className={`p-2 rounded cursor-pointer hover:bg-gray-100 transition ${selected?.id === doc.id ? 'bg-gray-200 font-semibold' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span>{doc.nome}</span>
                {doc.assinadoPor && (
                  <div className="ml-2 cursor-help relative group">
                    <span className="text-yellow-600">🖊️</span>
                    <div className="absolute z-10 hidden group-hover:block bg-yellow-100 text-yellow-900 text-xs p-2 rounded shadow w-48 right-0 top-full mt-1">
                      <div><strong>{doc.assinadoPor}</strong></div>
                      <div>{doc.cargoAssinatura}</div>
                      <div>{doc.dataAssinatura ? new Date(doc.dataAssinatura).toLocaleString() : '—'}</div>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex flex-col flex-1 p-6 overflow-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="ghost" onClick={() => router.push('/controle-de-processos')}>
            <CornerDownLeft className="w-4 h-4" /> Voltar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-1">
                <FilePlus className="w-4 h-4" /> Incluir Documento
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setShowUploadExterno(true)}>📎 Externo</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>📝 Interno</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {modelosInternos.map(({ modelo, label }) => (
                    <DropdownMenuItem
                      key={modelo}
                      onSelect={async () => {
                        try {
                          const formData = new FormData()
                          formData.append('nome', modelo)
                          formData.append('tipo', 'interno')
                          formData.append('html', '<p>Documento em branco</p>')

                          const res = await fetch(`/api/processos/${id}/documentos`, {
                            method: 'POST',
                            body: formData,
                          })

                          if (!res.ok) throw new Error('Erro ao criar documento')
                          const novoDocumento = await res.json()
                          carregarDados(novoDocumento.id)
                          window.open(
                            `/controle-de-processos/${id}/editar-documento/${novoDocumento.id}`,
                            '_blank',
                            'popup=yes,width=1000,height=800,scrollbars=yes,noopener'
                          )
                        } catch (err: any) {
                          console.error(err)
                          alert(err.message || 'Erro desconhecido ao criar documento')
                        }
                      }}
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={() => router.push(`/controle-de-processos/${processo.id}/tramitar`)}>
            <ArrowLeftRight className="w-4 h-4" /> Trâmite
          </Button>
          <Button variant="outline" onClick={baixarZip}>
            <FileDown className="w-4 h-4" /> Baixar
          </Button>
          <Button variant="outline" onClick={arquivarProcesso}>
            <Archive className="w-4 h-4" /> Arquivar
          </Button>
          {processo.arquivado && (
            <Button variant="outline" onClick={reabrirProcesso}>
              <LockOpen className="w-4 h-4" /> Reabrir
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowHistoricoModal(true)}>
            <Clock4 className="w-4 h-4" /> Histórico
          </Button>
          <Button variant="outline" onClick={() => setShowGerenciarAcesso(true)}>
            <Users className="w-4 h-4" /> Gerenciar Acesso
          </Button>
        </div>

        {showUploadExterno && (
          <UploadDocumentoExterno
            processoId={processo.id}
            onClose={() => setShowUploadExterno(false)}
            onSuccess={(docId: number) => {
              setShowUploadExterno(false)
              carregarDados(docId)
            }}
          />
        )}

        {selected ? renderDocumento() : (
          <Card className="mb-4">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">Detalhes do Processo</h2>
              <p><strong>Número:</strong> {processo.numero}</p>
              <p><strong>Tipo:</strong> {processo.tipo}</p>
              <p><strong>Interessado:</strong> {processo.interessado}</p>
              <p><strong>Acesso:</strong> {processo.acesso}</p>
              <p><strong>Criado em:</strong> {new Date(processo.criadoEm).toLocaleString()}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showHistoricoModal} onOpenChange={setShowHistoricoModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico completo do processo</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">De</th>
                  <th className="text-left">Para</th>
                  <th className="text-left">Data</th>
                </tr>
              </thead>
              <tbody>
                {historico.map(h => (
                  <tr key={h.id} className="border-t">
                    <td>{h.de?.nome || '—'}</td>
                    <td>{h.para?.nome || '—'}</td>
                    <td>{new Date(h.criadoEm).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showGerenciarAcesso} onOpenChange={setShowGerenciarAcesso}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar acesso ao processo</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">(em breve: adicionar/remover colaboradores autorizados)</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
