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
    if (acesso !== 'Público') {
      fetch('/api/colaboradores/listar')
        .then((res) => res.json())
        .then(setColaboradores)
        .catch(() => toast.error('Erro ao carregar colaboradores'))
    }
  }, [acesso])

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
      setFocoIndex((prev) => (prev + 1) % resultadosBusca.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocoIndex((prev) => (prev - 1 + resultadosBusca.length) % resultadosBusca.length)
    } else if (e.key === 'Enter' && focoIndex >= 0) {
      e.preventDefault()
      adicionarColaborador(resultadosBusca[focoIndex])
    }
  }

  async function handleSalvar() {
    try {
      const res = await fetch('/api/processos', {
        method: 'POST',
        body: JSON.stringify({
          tipo,
          especificacao,
          interessado,
          acesso,
          autorizados: acesso === 'Público' ? [] : autorizados.map((c) => c.id),
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error('Erro ao criar processo')

      const processoCriado = await res.json()
      toast.success('Processo criado com sucesso!')
      await router.push(`/controle-de-processos/${processoCriado.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao criar processo')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/controle-de-processos">
              Controle de Processos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">Novo Processo</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="flex gap-2">
          <Link href="/cadastros">
            <Button variant="outline">← Voltar</Button>
          </Link>
          <Link href="/controle-de-processos">
            <Button variant="ghost">🏠 Controle de Processos</Button>
          </Link>
        </div>
      </div>

      <Card className="max-w-xl mx-auto">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-xl font-bold text-gray-800 mb-2">🆕 Criar Novo Processo</h1>

          <div>
            <Label htmlFor="tipo">Tipo de Processo</Label>
            <Input
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Ex: Requisição, Justificativa..."
            />
          </div>
          <div>
            <Label htmlFor="especificacao">Especificação</Label>
            <Input
              id="especificacao"
              value={especificacao}
              onChange={(e) => setEspecificacao(e.target.value)}
              placeholder="Escreva uma descrição detalhada..."
            />
          </div>
          <div>
            <Label htmlFor="interessado">Interessado</Label>
            <Input
              id="interessado"
              value={interessado}
              onChange={(e) => setInteressado(e.target.value)}
              placeholder="Nome do interessado"
            />
          </div>
          <div>
            <Label htmlFor="acesso">Acesso</Label>
            <select
              id="acesso"
              value={acesso}
              onChange={(e) => setAcesso(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="Público">Público</option>
              <option value="Restrito">Restrito</option>
              <option value="Sigiloso">Sigiloso</option>
            </select>
          </div>

          {acesso !== 'Público' && (
            <div className="space-y-2">
              <Label>Adicionar Colaboradores Autorizados</Label>
              <Input
                ref={inputRef}
                type="text"
                placeholder="Digite um nome..."
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value)
                  setFocoIndex(-1)
                }}
                onKeyDown={handleKeyDown}
              />
              {busca.length > 0 && resultadosBusca.length > 0 && (
                <ul className="border rounded bg-white max-h-48 overflow-y-auto text-sm shadow">
                  {resultadosBusca.map((c, idx) => (
                    <li
                      key={c.id}
                      className={`px-3 py-1 cursor-pointer hover:bg-gray-100 ${focoIndex === idx ? 'bg-gray-200' : ''}`}
                      onClick={() => adicionarColaborador(c)}
                    >
                      {c.nome}
                    </li>
                  ))}
                </ul>
              )}
              {autorizados.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {autorizados.map((c) => (
                    <li key={c.id} className="flex justify-between items-center px-3 py-1 bg-gray-100 rounded">
                      {c.nome}
                      <button
                        onClick={() => removerColaborador(c.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <Button onClick={handleSalvar}>Salvar</Button>
        </CardContent>
      </Card>
    </div>
  )
}
