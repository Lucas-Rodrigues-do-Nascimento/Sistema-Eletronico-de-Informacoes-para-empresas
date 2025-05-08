// src/app/controle-de-processos/novo/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@/components/ui/breadcrumb'

interface Colaborador {
  id: number
  nome: string
}

export default function NovoProcessoPage() {
  const [tipo, setTipo] = useState('')
  const [especificacao, setEspecificacao] = useState('')
  const [interessado, setInteressado] = useState('')
  const [acesso, setAcesso] = useState('Público')
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [busca, setBusca] = useState('')
  const [autorizados, setAutorizados] = useState<Colaborador[]>([])
  const [focoIndex, setFocoIndex] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  useEffect(() => {
    // --- ALTERAÇÃO AQUI: Carrega colaboradores se acesso for Restrito OU Sigiloso ---
    if (acesso === 'Restrito' || acesso === 'Sigiloso') {
      fetch('/api/colaboradores/listar')
        .then((res) => res.json())
        .then(setColaboradores)
        .catch(() => toast.error('Erro ao carregar colaboradores'))
    } else {
        // Limpar busca e autorizados se voltar para Público
        setBusca('');
        setAutorizados([]);
        setColaboradores([]);
    }
  }, [acesso])
  // --- FIM DA ALTERAÇÃO ---

  const resultadosBusca = colaboradores.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) &&
      !autorizados.some((a) => a.id === c.id)
  )

  function adicionarColaborador(c: Colaborador) {
    setAutorizados([...autorizados, c])
    setBusca('')
    setFocoIndex(-1)
    inputRef.current?.focus()
  }

  function removerColaborador(id: number) {
    setAutorizados(autorizados.filter((c) => c.id !== id))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocoIndex((prev) => Math.min(prev + 1, resultadosBusca.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocoIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && focoIndex >= 0 && focoIndex < resultadosBusca.length) {
      e.preventDefault()
      adicionarColaborador(resultadosBusca[focoIndex])
    }
  }

  async function handleSalvar() {
    if (!tipo.trim()) {
        toast.error("O campo 'Tipo de Processo' é obrigatório.");
        return;
    }
     if (!interessado.trim()) {
        toast.error("O campo 'Interessado' é obrigatório.");
        return;
    }

    // --- ALTERAÇÃO AQUI: Aviso e envio de 'autorizados' também para Sigiloso ---
    if ((acesso === 'Restrito' || acesso === 'Sigiloso') && autorizados.length === 0) {
        if(!confirm(`Você selecionou '${acesso}' mas não adicionou colaboradores à lista de acesso. Apenas o criador poderá ver este processo. Deseja continuar?`)) {
            return;
        }
    }
    // --- FIM DA ALTERAÇÃO ---

    try {
      const res = await fetch('/api/processos', {
        method: 'POST',
        body: JSON.stringify({
          tipo: tipo.trim(),
          especificacao: especificacao.trim(),
          interessado: interessado.trim(),
          acesso,
          // --- ALTERAÇÃO AQUI: Envia a lista se for Restrito OU Sigiloso ---
          autorizados: (acesso === 'Restrito' || acesso === 'Sigiloso') ? autorizados.map((c) => c.id) : [],
          // --- FIM DA ALTERAÇÃO ---
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: `Erro ${res.status} ao criar processo` }));
          throw new Error(errorData.error || `Erro ${res.status}`);
      }

      const processoCriado = await res.json()
      toast.success('Processo criado com sucesso!')
      await router.push(`/controle-de-processos/${processoCriado.id}`)
    } catch (err: any) {
      console.error("Erro ao salvar processo:", err)
      toast.error(`Erro ao criar processo: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-y-2">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/controle-de-processos">
              Controle de Processos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <span className="font-medium text-gray-500">Novo Processo</span>
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="flex gap-2">
          <Link href="/controle-de-processos">
            <Button variant="outline">← Voltar</Button>
          </Link>
        </div>
      </div>

      <Card className="max-w-xl mx-auto shadow-sm">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">🆕 Criar Novo Processo</h1>

          <div className="space-y-1">
            <Label htmlFor="tipo" className="text-sm font-medium">Tipo de Processo <span className="text-red-500">*</span></Label>
            <Input id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Ex: Requisição, Justificativa, Pagamento" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="especificacao" className="text-sm font-medium">Especificação</Label>
            <Input id="especificacao" value={especificacao} onChange={(e) => setEspecificacao(e.target.value)} placeholder="Detalhes adicionais sobre o processo..." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="interessado" className="text-sm font-medium">Interessado <span className="text-red-500">*</span></Label>
            <Input id="interessado" value={interessado} onChange={(e) => setInteressado(e.target.value)} placeholder="Nome ou departamento interessado" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="acesso" className="text-sm font-medium">Nível de Acesso</Label>
            <select
              id="acesso"
              value={acesso}
              onChange={(e) => setAcesso(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm p-2 bg-white"
            >
              <option value="Público">Público (Visível por todos)</option>
              <option value="Restrito">Restrito (Visível por criador e lista de acesso)</option>
              <option value="Sigiloso">Sigiloso (Visível apenas pelo criador e lista de acesso)</option>
            </select>
          </div>

          {/* --- ALTERAÇÃO AQUI: Mostrar para Restrito OU Sigiloso --- */}
          {(acesso === 'Restrito' || acesso === 'Sigiloso') && (
            <div className="space-y-3 pt-3 border-t mt-4">
              <Label className="text-sm font-medium">Adicionar Colaboradores Autorizados (Acesso {acesso})</Label>
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar colaborador por nome..."
                  value={busca}
                  onChange={(e) => { setBusca(e.target.value); setFocoIndex(-1); }}
                  onKeyDown={handleKeyDown}
                  className="pr-8"
                />
                {busca.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 border rounded bg-white max-h-40 overflow-y-auto text-sm shadow-lg">
                    {resultadosBusca.length > 0 ? (
                        resultadosBusca.map((c, idx) => (
                        <li key={c.id} className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 ${focoIndex === idx ? 'bg-indigo-100' : ''}`} onMouseDown={() => adicionarColaborador(c)}>
                            {c.nome}
                        </li>
                        ))
                    ) : ( <li className="px-3 py-2 text-gray-500">Nenhum colaborador encontrado.</li> )}
                    </ul>
                )}
              </div>

              {autorizados.length > 0 && (
                <div className="mt-3">
                    <h4 className="text-xs font-semibold text-gray-600 mb-1">Adicionados:</h4>
                    <ul className="space-y-1 text-sm">
                    {autorizados.map((c) => (
                        <li key={c.id} className="flex justify-between items-center px-2 py-1 bg-gray-100 rounded border border-gray-200">
                        <span>{c.nome}</span>
                        <button type="button" onClick={() => removerColaborador(c.id)} className="text-red-600 hover:text-red-800 text-xs font-medium ml-2" title="Remover acesso">✕</button>
                        </li>
                    ))}
                    </ul>
                </div>
              )}
            </div>
          )}
          {/* --- FIM DA ALTERAÇÃO --- */}


          <div className="pt-4 border-t mt-6">
            <Button onClick={handleSalvar} className="w-full sm:w-auto">Salvar Processo</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}