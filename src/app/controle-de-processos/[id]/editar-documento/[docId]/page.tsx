// src/app/controle-de-processos/[id]/editar-documento/[docId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import EditorInterno from '@/components/EditorInterno'
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { IMaskInput } from 'react-imask';

export const dynamic = 'force-dynamic'

export default function EditDocumentoPage() {
  const router = useRouter();
  const params = useParams<{ id: string; docId: string }>();

  const [conteudo, setConteudo] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [nomeDocumento, setNomeDocumento] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [dataMemo, setDataMemo] = useState('');
  const [para, setPara] = useState('');
  const [de, setDe] = useState('');
  const [assunto, setAssunto] = useState('');
  const [corpo, setCorpo] = useState('');
  const [numeroMemo, setNumeroMemo] = useState('___');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [cargoFuncao, setCargoFuncao] = useState('');

  // IDs numéricos para uso interno
  const processoId = Number(params.id);
  const documentoId = Number(params.docId);

  // useEffect para logar o window.opener na montagem do pop-up
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log("[Editor Pop-up - Montagem] Verificando window.opener:", window.opener);
      if (window.opener) {
        console.log("[Editor Pop-up - Montagem] typeof window.opener.atualizarDocumentoExibidoGlobal:", typeof window.opener.atualizarDocumentoExibidoGlobal);
        console.log("[Editor Pop-up - Montagem] window.opener.closed:", window.opener.closed);
      } else {
        console.warn("[Editor Pop-up - Montagem] window.opener é null ou undefined! A janela principal pode ter sido fechada ou a relação perdida.");
      }
    }
  }, []); // Roda apenas uma vez quando o pop-up monta


  const cabecalhoHTML = `
    <div style="text-align: center; margin-bottom: 20px; font-family: Arial, sans-serif;">
      <img src="/logo-institucional.png" alt="Logo" style="height: 60px; margin-bottom: 5px;" />
      <h2 style="margin: 0; font-size: 16px; color: #333;">CORRÊA MATERIAIS ELÉTRICOS</h2>
      <p style="margin: 0; font-size: 12px; color: #555;">Sistema Interno Administrativo - PROTON</p>
      <hr style="margin-top: 8px; border: 0; border-top: 1px solid #ccc;" />
    </div>
  `;

  useEffect(() => {
    if (isNaN(documentoId) || documentoId <= 0) {
        toast.error("ID de documento inválido na URL.");
        console.error("[Editor Pop-up] ID de documento inválido detectado no useEffect:", documentoId);
        if (typeof window !== 'undefined') window.close();
        return;
    }

    const buscarDocumento = async () => {
      setCarregando(true);
      console.log(`[Editor Pop-up] Buscando conteúdo para Doc ID: ${documentoId} do Processo ID: ${processoId}`);
      try {
        const res = await fetch(`/api/processos/${processoId}/documentos/${documentoId}/conteudo`);
        if (!res.ok) {
          let errorMsg = `Erro ${res.status} ao carregar documento.`;
          try {
              const errorData = await res.json();
              errorMsg = errorData.error || errorMsg;
          } catch(e) {}
          console.error(`[Editor Pop-up] Erro ${res.status} da API /conteudo: ${errorMsg}`);
          toast.error(errorMsg);
          if ((res.status === 404 || res.status === 403) && typeof window !== 'undefined') window.close();
          return;
        }
        const data = await res.json();
        if (data.tipo !== 'interno') {
          toast.error("Este não é um documento interno editável.");
          if (typeof window !== 'undefined') window.close();
          return;
        }
        console.log(`[Editor Pop-up] Conteúdo carregado para ${data.nome}`);
        let conteudoComCabecalho = data.conteudoHtml || '<p>Digite o conteúdo aqui...</p>';
        // Lógica para adicionar cabeçalho (apenas se não existir E não for o placeholder inicial)
        if (!conteudoComCabecalho.includes('/logo-institucional.png')) {
            if(conteudoComCabecalho.trim() === '<p>Digite o conteúdo aqui...</p>'){
                 conteudoComCabecalho = cabecalhoHTML + '<p>Digite o conteúdo aqui...</p>'; // Se placeholder, só adiciona
            } else {
                 conteudoComCabecalho = cabecalhoHTML + conteudoComCabecalho; // Se já tem conteúdo, prependa
            }
        }
        setConteudo(
          ajustarNumeroMemorando(conteudoComCabecalho, data.nome)
        );
        setNomeDocumento(data.nome || `Documento #${documentoId}`);
        // Extrai número do nome
        const match = (data.nome || '').match(/memorando\s*(\d+)/i);
        setNumeroMemo(match ? match[1] : '___');
        // Extrai campos do HTML (simples, pode ser melhorado)
        const html = data.conteudoHtml || '';
        setDataMemo(/<strong>Data:<\/strong>\s*([^<]+)/i.exec(html)?.[1]?.trim() || '');
        setPara(/<strong>Para:<\/strong>\s*([^<]+)/i.exec(html)?.[1]?.trim() || '');
        setDe(/<strong>De:<\/strong>\s*([^<]+)/i.exec(html)?.[1]?.trim() || '');
        setAssunto(/<strong>Assunto:<\/strong>\s*([^<]+)/i.exec(html)?.[1]?.trim() || '');
        // Extrai corpo (tudo após .memo-assunto até .memo-rodape)
        const corpoMatch = html.match(/<div class="memo-corpo"[^>]*>([\s\S]*?)<\/div>/i);
        setCorpo(corpoMatch ? corpoMatch[1].trim() : '');
        // Extrai nome do responsável e cargo/função do HTML
        setNomeResponsavel(/<div class="memo-rodape">\s*<div><span>([^<]*)<\/span><\/div>/i.exec(html)?.[1]?.trim() || '');
        setCargoFuncao(/<div class="memo-rodape">[\s\S]*?<div><span>([^<]*)<\/span><\/div>\s*<div><span>([^<]*)<\/span><\/div>/i.exec(html)?.[2]?.trim() || '');
      } catch (err: any) {
        console.error('[Editor Pop-up] Erro no try/catch ao carregar documento:', err);
        toast.error(err.message || "Falha ao carregar dados do documento.");
        if (typeof window !== 'undefined') window.close();
      } finally {
        setCarregando(false);
      }
    };
    // Adicionado processoId à lista de dependências para recarregar se ele mudar (caso raro em pop-up)
    if (processoId > 0) { // Garante que processoId seja válido antes de buscar
        buscarDocumento();
    }
  }, [documentoId, processoId, cabecalhoHTML]); // Removido router da dependência

  const salvar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isNaN(documentoId) || documentoId <= 0) {
        toast.error("Não é possível salvar: ID de documento inválido.");
        return;
    }
    setSalvando(true);
    console.log(`[Editor Pop-up] Tentando salvar Doc ID: ${documentoId}`);
    try {
      // Monta HTML institucional completo
      const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const htmlFinal = `
        <style>
          .a4-memo { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 24mm 20mm 20mm 20mm; background: #fff; font-family: 'Arial', sans-serif; font-size: 13pt; color: #222; box-sizing: border-box; }
          .memo-cabecalho { text-align: center; margin-bottom: 18px; }
          .memo-cabecalho img { height: 60px; margin-bottom: 6px; }
          .memo-info { margin-bottom: 8px; display: flex; justify-content: space-between; font-size: 1em; }
          .memo-info div { min-width: 120px; }
          .memo-assunto { margin-bottom: 18px; font-weight: bold; }
          .memo-corpo { min-height: 200px; margin-bottom: 32px; line-height: 1.7; }
        </style>
        <div class="a4-memo">
          <div class="memo-cabecalho">
            <img src="${host}/logo-institucional.png" alt="Logo Corrêa" />
          </div>
          <div class="memo-info">
            <div><strong>Memorando nº:</strong> <span>${numeroMemo}</span></div>
            <div><strong>Data:</strong> ${dataMemo}</div>
          </div>
          <div class="memo-info">
            <div><strong>Para:</strong> ${para}</div>
            <div><strong>De:</strong> ${de}</div>
          </div>
          <div class="memo-assunto">
            <strong>Assunto:</strong> ${assunto}
          </div>
          <div class="memo-corpo">${corpo}</div>
        </div>
      `;
      const res = await fetch(`/api/processos/${processoId}/documentos/${documentoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudoHtml: htmlFinal }),
      });
      console.log(`[Editor Pop-up] Resposta do PATCH recebida, status: ${res.status}`);

      if (res.ok) {
        toast.success('Documento salvo com sucesso!');
        console.log("[Editor Pop-up] Salvamento OK. Notificando janela principal via localStorage...");

        // Notifica a janela principal via localStorage
        const data = {
          docId: documentoId,
          timestamp: Date.now()
        };
        localStorage.setItem('documentoEditadoInfo', JSON.stringify(data));
        
        // Se a janela principal estiver aberta, dispara o evento manualmente
        if (window.opener && !window.opener.closed) {
          window.opener.dispatchEvent(new StorageEvent('storage', {
            key: 'documentoEditadoInfo',
            newValue: JSON.stringify(data),
            storageArea: localStorage
          }));
        }

        window.close();
      } else {
        let errorMsg = `Erro ${res.status} ao salvar documento`;
        try {
             const errorData = await res.json();
             errorMsg = errorData?.error || errorMsg;
        } catch {}
        console.error(`[Editor Pop-up] Erro ao salvar: ${errorMsg}`);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error('[Editor Pop-up] Erro no try/catch ao salvar:', err);
      toast.error(err.message || 'Erro inesperado ao salvar documento');
    } finally {
        setSalvando(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (!salvando) {
          salvar();
        }
      }
    };
    if (typeof window !== 'undefined') {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }
    // Ajuste nas dependências para refletir 'salvar' e 'salvando'
  }, [conteudo, salvando, salvar]);

  // Função utilitária para ajustar o número do memorando no HTML
  function ajustarNumeroMemorando(html: string, nomeDoc: string) {
    // Só aplica se for memorando
    if (!nomeDoc.toLowerCase().startsWith('memorando')) return html;
    // Extrai número do nome (ex: "Memorando 3" -> 3)
    const match = nomeDoc.match(/memorando\s*(\d+)/i);
    const numero = match ? match[1] : '___';
    // Substitui o campo do número no HTML
    return html.replace(
      /(<strong>Memorando nº:<\/strong>\s*<span[^>]*)(contenteditable=["']true["'])?[^>]*>.*?<\/span>/i,
      `$1contenteditable="false">${numero}</span>`
    );
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">Carregando editor e documento...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col items-center py-4 px-2">
      <div className="w-full max-w-[880px] flex flex-col h-screen">
        <div className="flex justify-between items-center mb-3 px-2 flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-700 truncate" title={nomeDocumento}>
            Edição: {nomeDocumento || "Documento Interno"}
          </h1>
          <div className="flex gap-2">
            <Button onClick={salvar} disabled={salvando} size="sm">
              {salvando ? <Loader2 className="h-4 w-4 animate-spin mr-1"/> : null}
              Salvar e Fechar
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => {if (typeof window !== 'undefined') window.close()}} disabled={salvando}>
              Cancelar
            </Button>
          </div>
        </div>
        {/* Cabeçalho institucional customizável */}
        <div className="border rounded bg-gray-50 p-4 mb-4">
          <div className="flex flex-col items-center mb-2">
            <img src="/logo-institucional.png" alt="Logo Corrêa" style={{ height: 60, marginBottom: 6 }} />
          </div>
          <div className="flex gap-8 mb-2">
            <div><strong>Memorando nº:</strong> <span>{numeroMemo}</span></div>
            <div>
              <strong>Data:</strong>
              <IMaskInput
                mask="00/00/0000"
                value={dataMemo}
                onAccept={(value) => setDataMemo(value)}
                className="w-32 inline-block"
                placeholder="__/__/____"
              />
            </div>
          </div>
          <div className="flex gap-8 mb-2">
            <div><strong>Para:</strong> <Input value={para} onChange={e => setPara(e.target.value)} className="w-48 inline-block" placeholder="Destinatário" /></div>
            <div><strong>De:</strong> <Input value={de} onChange={e => setDe(e.target.value)} className="w-48 inline-block" placeholder="Remetente" /></div>
          </div>
          <div className="mb-2">
            <strong>Assunto:</strong> <Input value={assunto} onChange={e => setAssunto(e.target.value)} className="w-96 inline-block" placeholder="Assunto do memorando" />
          </div>
          <div className="flex gap-8 mb-2 justify-end">
            <div><strong>Nome do responsável:</strong> <Input value={nomeResponsavel} onChange={e => setNomeResponsavel(e.target.value)} className="w-64 inline-block" placeholder="Nome do responsável" /></div>
            <div><strong>Cargo/Função:</strong> <Input value={cargoFuncao} onChange={e => setCargoFuncao(e.target.value)} className="w-64 inline-block" placeholder="Cargo/Função" /></div>
          </div>
        </div>
        {/* Editor do corpo do memorando */}
        <div className="flex-grow overflow-y-auto border rounded-md shadow-sm bg-gray-50 p-2">
          <EditorInterno content={corpo} onChange={setCorpo} />
        </div>
      </div>
    </div>
  );
}