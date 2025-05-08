// src/components/ProcessosCliente.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FilePlus,
  ArrowLeftRight,
  FileDown,
  Archive,
  Trash,
  Pencil,
  Clock4,
  CornerDownLeft,
  LockOpen,
  Users,
  Loader2,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react'
import UploadDocumentoExterno from '@/components/UploadDocumentoExterno'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu'
import ModalAssinatura from '@/components/ModalAssinatura'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import SelectColaborador from '@/components/SelectColaborador'
import { useProcessoStore } from '@/stores/useProcessoStore'
// Importar os templates centralizados
import { templatesDocumentos } from '@/lib/templates'

interface Documento {
  id: number
  nome: string
  tipo: string
  conteudoHtml?: string
  assinadoPor?: string | null
  cargoAssinatura?: string | null
  dataAssinatura?: string | null
  criadoEm: string
}

interface MovimentacaoHistorico {
  id: number
  de?: { nome: string }
  para?: { nome: string }
  criadoEm: string
  ativo: boolean
}

interface MovimentacaoSimples {
  id: number
  deSetor: number
  paraSetor: number
  criadoEm: string
  ativo: boolean
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
  movimentacoes?: MovimentacaoHistorico[]
}

interface ColaboradorAutorizado {
  id: number
  nome: string
}

interface Props {
  processoId: string;
  onPermissionDenied: () => void;
}

const LOCAL_STORAGE_DOC_EDITADO_KEY = 'documentoEditadoInfo';

export default function ProcessosCliente({ processoId, onPermissionDenied }: Props) {
  const id = Number(processoId);
  const router = useRouter();

  const {
    processo,
    documentos,
    historico,
    selected,
    selectedPdfUrl,
    loading,
    error,
    colaboradoresAutorizados,
    novoColaboradorId,
    showUploadExterno,
    showAssinaturaModal,
    showHistoricoModal,
    showGerenciarAcesso,
    setSelected,
    setSelectedPdfUrl,
    setShowUploadExterno,
    setShowAssinaturaModal,
    setShowHistoricoModal,
    setShowGerenciarAcesso,
    setNovoColaboradorId,
    carregarDados,
    excluirDocumento,
    arquivarProcesso,
    reabrirProcesso,
    adicionarColaboradorAutorizado,
    removerColaboradorAutorizado
  } = useProcessoStore();

  // Usar os templates centralizados ao invés dos templates embutidos
  const modelosInternos = templatesDocumentos;

  useEffect(() => {
    if (processoId && !isNaN(id) && id > 0) {
      carregarDados(id);
    }

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === LOCAL_STORAGE_DOC_EDITADO_KEY && event.newValue) {
            try {
                const data = JSON.parse(event.newValue);
                const docIdEditado = Number(data?.docId);
                if (!isNaN(docIdEditado) && docIdEditado > 0) {
            carregarDados(id, docIdEditado);
                    localStorage.removeItem(LOCAL_STORAGE_DOC_EDITADO_KEY);
                }
            } catch (e) {
                console.error("[ProcessosCliente] Erro ao processar evento 'storage':", e);
            }
        }
    };

        window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [processoId, id, carregarDados]);

  useEffect(() => {
    if (selected && id > 0) {
      setSelectedPdfUrl(`/api/processos/${id}/documentos/${selected.id}?v=${Date.now()}`);
    } else {
      setSelectedPdfUrl(null);
    }
  }, [selected, id, setSelectedPdfUrl]);

  // --- Renderização Condicional ---
  if (loading && !processo && !error) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="ml-3 text-gray-600">Carregando dados do processo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full p-4">
        <ShieldAlert className="w-16 h-16 text-orange-500 mb-4" />
        <h2 className="text-xl font-semibold text-orange-700 mb-2">Ocorreu um Erro</h2>
        <p className="text-gray-600 mb-6 text-center">Não foi possível carregar os dados do processo: {error}</p>
        <Button onClick={() => router.push('/controle-de-processos')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Controle de Processos
        </Button>
      </div>
    );
  }

  if (!processo && !loading) {
     return (
      <div className="flex flex-col items-center justify-center h-screen w-full p-4">
        <ShieldAlert className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Processo Não Encontrado</h2>
        <p className="text-gray-500 mb-6 text-center">O processo solicitado não pôde ser carregado.</p>
        <Button onClick={() => router.push('/controle-de-processos')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Controle de Processos
        </Button>
      </div>
    );
  }

  if (!processo) return null;

  // --- Função de Renderização do Documento Selecionado ---
  const renderDocumento = () => {
    if (!selected || !processo) return null;
    const sel = selected;
    const isInterno = sel.tipo === 'interno';
    
    // Verificar estrutura de dados completa
    console.log('[ProcessosCliente] Estrutura completa do processo:', JSON.stringify(processo));
    console.log('[ProcessosCliente] Documento selecionado:', JSON.stringify(sel));
    
    // Verificar movimentações 
    const movimentacoes = (processo as any).movimentacoes || [];
    console.log('[ProcessosCliente] Movimentações raw:', movimentacoes);
    
    // CORREÇÃO: Forçar verificação de forma mais explícita
    // O problema pode estar aqui - alguns objetos podem ter ativo como string ou não ter o campo
    const movimentacoesAtivas = movimentacoes.filter((m: any) => {
      // Garantir que só consideramos movimentações com ativo explicitamente true
      return m.ativo === true; 
    });
    
    console.log('[ProcessosCliente] Movimentações ativas:', movimentacoesAtivas);
    
    // CORREÇÃO: Ignorar a movimentação inicial de criação do processo
    // Se há apenas uma movimentação ativa e ela contém "Criação do processo" nas observações,
    // então consideramos que o processo NÃO tramitou ainda
    const temMovimentacoesAlémDaInicial = movimentacoesAtivas.length > 0 && 
      !(movimentacoesAtivas.length === 1 && 
        movimentacoesAtivas[0].observacoes && 
        movimentacoesAtivas[0].observacoes.includes('Criação do processo'));
    
    // PROBLEMA: O documento pode estar configurado como assinado (tem valor em assinadoPor) 
    // mas o backend pode não estar reconhecendo isso se o campo assinadoEm estiver faltando
    const documentoFoiAssinado = !!sel.assinadoPor || (sel as any).assinadoEm || (sel as any).dataAssinatura;
    
    // IMPORTANTE: Aqui está a regra de negócio corrigida
    // Documento assinado só é bloqueado se houver movimentações ALÉM da inicial
    const deveBloquear = documentoFoiAssinado && temMovimentacoesAlémDaInicial;
    
    // FORÇAR desbloqueio se não tiver certeza 
    // Melhor permitir edição do que bloquear incorretamente
    if (documentoFoiAssinado && !temMovimentacoesAlémDaInicial) {
      console.log(`[ProcessosCliente] Documento ${sel.id} está assinado mas processo não tramitou além da movimentação inicial. PERMITINDO EDIÇÃO`); 
    }
    
    console.log(`[ProcessosCliente] Análise do documento ${sel.id} (${sel.nome}):`, {
      assinado: documentoFoiAssinado,
      assinadoPor: sel.assinadoPor,
      assinadoEm: (sel as any).assinadoEm,
      dataAssinatura: (sel as any).dataAssinatura,
      movimentacoes: movimentacoes.length,
      movimentacoesAtivas: movimentacoesAtivas.length,
      temMovimentacoesAlémDaInicial,
      deveBloquear
    });
    
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 shadow rounded-lg p-4">
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <h3 className="text-base font-semibold truncate" title={sel.nome}>{sel.nome}</h3>
          <div className="flex gap-2 flex-shrink-0">
            {isInterno && (
              <>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => window.open(`/controle-de-processos/${processo.id}/editar-documento/${sel.id}`, '_blank', 'popup=yes,width=1000,height=800,scrollbars=yes')}
                  title={
                    deveBloquear ? 
                    "Este documento já foi assinado e o processo tramitado. Não é possível editá-lo." : 
                    (documentoFoiAssinado ? "Editar (documento assinado, mas ainda não tramitado)" : "Editar documento")
                  }
                  disabled={deveBloquear}
                >
                  <Pencil className="w-4 h-4 mr-1" /> 
                  {deveBloquear ? 'Bloqueado' : 'Editar'}
                </Button>
                {!sel.assinadoPor && (
                  <Button size="sm" variant="outline" onClick={() => setShowAssinaturaModal(true)}>
                    🔐 Assinar
                  </Button>
                )}
                {/* Botão de diagnóstico (desenvolvimento) */}
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/processos/${processo.id}/documentos/debug`);
                        if (res.ok) {
                          const data = await res.json();
                          console.log('📊 Diagnóstico do processo:', data);
                          
                          // Verificar se há movimentações além da inicial
                          const movimentacoesCount = data.movimentacoesAtivas;
                          const apenasMovInicial = movimentacoesCount === 1 && 
                            data.movimentacoes?.length > 0 &&
                            data.movimentacoes[0]?.observacoes?.includes('Criação do processo');
                          
                          const realmenteDeveBloquear = !!sel.assinadoPor && movimentacoesCount > 0 && !apenasMovInicial;
                          
                          alert(`Status do documento ${sel.id}:\n` + 
                                `- Assinado: ${!!sel.assinadoPor}\n` +
                                `- Movimentações ativas: ${movimentacoesCount}\n` +
                                `- Apenas movimentação inicial: ${apenasMovInicial ? 'Sim' : 'Não'}\n` +
                                `- Deve bloquear edição: ${realmenteDeveBloquear}\n` +
                                `\nVeja o console para mais detalhes.`);
                        } else {
                          console.error('Erro ao obter diagnóstico:', await res.text());
                        }
                      } catch (err) {
                        console.error('Erro ao diagnosticar:', err);
                      }
                    }}
                  >
                    🔍 Debug
                  </Button>
                )}
              </>
            )}
            <Button size="sm" variant="destructive" onClick={() => excluirDocumento(sel.id)}>
              <Trash className="w-4 h-4 mr-1" /> Excluir
            </Button>
          </div>
        </div>
        <div className="flex-1 w-full h-full mt-2">
           {selectedPdfUrl ? (
             <iframe key={selectedPdfUrl} src={selectedPdfUrl} title={sel.nome} className="w-full h-full min-h-[500px] border rounded bg-white" />
           ) : (
             <div className="w-full h-full min-h-[500px] border rounded bg-white flex items-center justify-center text-gray-500">Carregando documento...</div>
           )}
        </div>
        {showAssinaturaModal && isInterno && (
           <ModalAssinatura
             documentoId={sel.id}
             onClose={() => setShowAssinaturaModal(false)}
             onSuccess={() => {
               setShowAssinaturaModal(false);
              carregarDados(processo.id, sel.id);
            }}
          />
        )}
      </div>
    );
  }

  // --- JSX Principal do Componente ---
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`w-80 border-r bg-white p-4 overflow-y-auto flex flex-col transition-all duration-300 flex-shrink-0 ${selected ? 'shadow-lg' : ''}`}>
        <button
          onClick={() => setSelected(null)}
          className="w-full text-left font-bold text-lg mb-4 p-2 rounded hover:bg-gray-100 transition-colors shadow-sm block"
          title="Ver detalhes do processo"
        >
          <span className="drop-shadow-md">Processo #{processo.numero || 'S/N'}</span>
        </button>
        <ul className="space-y-1 flex-1 overflow-y-auto">
          {documentos.length === 0 && !loading && processo && (
             <li className="p-2 text-gray-500">Nenhum documento neste processo.</li>
          )}
          {documentos.map((doc: Documento) => (
            <li key={doc.id}>
                <button
                  onClick={() => setSelected(doc as any)}
                  className={`w-full text-left p-2 rounded cursor-pointer hover:bg-blue-50 transition flex items-center justify-between gap-2 ${selected?.id === doc.id ? 'bg-blue-100 font-semibold text-blue-800' : 'text-gray-700'}`}
                  title={doc.nome}
                 >
                    <span className="truncate flex-1">{doc.nome}</span>
                    {doc.assinadoPor && (
                      <div className="ml-1 cursor-help relative group flex-shrink-0">
                        <span className="text-yellow-600 text-sm" aria-label="Documento assinado">🖊️</span>
                        <div className="absolute z-20 hidden group-hover:block bg-yellow-50 text-yellow-900 text-xs p-2 rounded shadow-lg w-52 right-0 top-full mt-1 border border-yellow-200">
                          <div className="font-semibold">Assinado por:</div>
                          <div><strong>{doc.assinadoPor}</strong></div>
                          {doc.cargoAssinatura && <div>{doc.cargoAssinatura}</div>}
                          {doc.dataAssinatura && <div>{new Date(doc.dataAssinatura).toLocaleString('pt-BR')}</div>}
                        </div>
                      </div>
                    )}
                </button>
            </li>
          ))}
        </ul>
        {loading && documentos.length > 0 && (
          <div className="text-sm text-gray-500 mt-2">Atualizando lista...</div>
        )}
      </aside>

      <main className="flex flex-col flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => router.push('/controle-de-processos')} title="Voltar para lista de processos">
            <CornerDownLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <FilePlus className="w-4 h-4" /> Incluir Documento
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setShowUploadExterno(true)}>📎 Externo</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>📝 Interno</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {modelosInternos.map(({ modelo, label, html }) => (
                    <DropdownMenuItem key={modelo} onSelect={async () => {
                      try {
                        // Extrai o nome base do documento (ex: Memorando, Despacho, etc) SEM número e emoji
                        const nomeBase = label.replace(/^[^\w]*([A-Za-zçÇãÃéÉíÍêÊôÔõÕáÁóÓúÚâÂêÊîÎôÔûÛüÜ ]+).*/, '$1').replace(/\d+$/, '').trim();
                        // Conta quantos documentos já existem desse tipo (baseado no nome base)
                        const count = documentos.filter(doc => doc.tipo === 'interno' && doc.nome.toLowerCase().startsWith(nomeBase.toLowerCase())).length;
                        // Gera o nome correto
                        const nome = `${nomeBase} ${count + 1}`;
                        // Usa o modelo institucional se existir, senão usa o padrão
                        const conteudoHtml = html || '<p>Digite o conteúdo aqui...</p>';
                        const res = await fetch(`/api/processos/${id}/documentos`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            nome,
                            tipo: 'interno',
                            html: conteudoHtml
                          })
                        });
                        if (!res.ok) {
                          const errorData = await res.json().catch(() => ({}));
                          throw new Error(errorData.error || `Erro ${res.status}`);
                        }
                        const novoDoc = await res.json();
                        window.open(`/controle-de-processos/${id}/editar-documento/${novoDoc.id}`, '_blank', 'popup=yes,width=1000,height=800,scrollbars=yes');
                        carregarDados(id, novoDoc.id);
                      } catch (e: any) {
                        console.error(`Erro ao criar ${modelo}:`, e);
                        alert(`Erro ao criar documento ${modelo}: ${e.message}`);
                      }
                    }}>
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" onClick={() => router.push(`/controle-de-processos/${processo.id}/tramitar`)}>
            <ArrowLeftRight className="w-4 h-4 mr-1" /> Trâmite
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.open(`/api/processos/${id}/download-zip`, '_blank')}>
            <FileDown className="w-4 h-4 mr-1" /> Baixar ZIP
          </Button>
          {!processo.arquivado && (
            <Button size="sm" variant="outline" onClick={arquivarProcesso}>
              <Archive className="w-4 h-4 mr-1" /> Arquivar
            </Button>
          )}
          {processo.arquivado && (
            <Button size="sm" variant="outline" onClick={reabrirProcesso}>
              <LockOpen className="w-4 h-4 mr-1" /> Reabrir
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setShowHistoricoModal(true)}>
            <Clock4 className="w-4 h-4 mr-1" /> Histórico
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowGerenciarAcesso(true)}>
            <Users className="w-4 h-4 mr-1" /> Gerenciar Acesso
          </Button>
        </div>

        {showUploadExterno && (
          <UploadDocumentoExterno
            processoId={processo.id}
            onClose={() => setShowUploadExterno(false)}
            onSuccess={(docId: number) => {
              setShowUploadExterno(false);
              carregarDados(processo.id, docId);
            }}
          />
        )}

        <div className="flex-1 mt-4">
          {selected ? renderDocumento() : (
            <Card className="mb-4 shadow-sm">
                <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Detalhes do Processo</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                       <p><strong>Número:</strong> {processo.numero || 'S/N'}</p>
                       <p><strong>Tipo:</strong> {processo.tipo}</p>
                       <p><strong>Especificação:</strong> {processo.especificacao || 'N/A'}</p>
                       <p><strong>Interessado:</strong> {processo.interessado}</p>
                       <p><strong>Nível de Acesso:</strong> {processo.acesso}</p>
                       <p><strong>Criado em:</strong> {new Date(processo.criadoEm).toLocaleString('pt-BR')}</p>
                       <p><strong>Status:</strong> {processo.arquivado ? 'Arquivado' : 'Ativo'}</p>
                    </div>
                </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Modais Histórico e Gerenciar Acesso */}
      {processo && (
        <Dialog open={showHistoricoModal} onOpenChange={setShowHistoricoModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Histórico Completo do Processo #{processo.numero || 'S/N'}</DialogTitle>
              <DialogDescription>Movimentações e trâmites registrados.</DialogDescription>
            </DialogHeader>
            <div className="overflow-auto max-h-[70vh] mt-4">
              {historico.length === 0 ? (
                <p className="text-gray-500 text-center p-4">Nenhuma movimentação registrada.</p>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2">De (Origem)</th>
                      <th className="p-2">Para (Destino)</th>
                      <th className="p-2">Data/Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((h: MovimentacaoHistorico) => (
                      <tr key={h.id} className="border-t hover:bg-gray-50">
                        <td className="p-2">{h.de?.nome || '—'}</td>
                        <td className="p-2">{h.para?.nome || '—'}</td>
                        <td className="p-2">{new Date(h.criadoEm).toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {processo && (
        <Dialog open={showGerenciarAcesso} onOpenChange={setShowGerenciarAcesso}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Gerenciar Acesso ao Processo #{processo.numero || 'S/N'}</DialogTitle>
              <DialogDescription>Adicione ou remova colaboradores que podem visualizar este processo.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex gap-2 items-center border-b pb-4">
                <div className="flex-1">
                  <SelectColaborador
                    value={novoColaboradorId}
                    onChange={setNovoColaboradorId}
                    placeholder="Selecione um colaborador..."
                  />
                </div>
                <Button onClick={adicionarColaboradorAutorizado} disabled={!novoColaboradorId}>
                  Adicionar
                </Button>
              </div>
              <h4 className="text-sm font-medium text-gray-600">Colaboradores com acesso:</h4>
              {colaboradoresAutorizados.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum colaborador com acesso adicional.</p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {colaboradoresAutorizados.map((c: ColaboradorAutorizado) => (
                    <li key={c.id} className="flex justify-between items-center border p-2 rounded bg-gray-50">
                      <span className="text-sm">{c.nome}</span>
                      <Button size="sm" variant="destructive" onClick={() => removerColaboradorAutorizado(c.id)}>
                        Remover
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}