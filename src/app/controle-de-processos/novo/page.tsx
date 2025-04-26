'use client'

import { useState } from 'react'
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

export default function NovoProcessoPage() {
  const [tipo, setTipo] = useState('')
  const [especificacao, setEspecificacao] = useState('')
  const [interessado, setInteressado] = useState('')
  const [acesso, setAcesso] = useState('Público')

  const router = useRouter()

  async function handleSalvar() {
    try {
      const res = await fetch('/api/processos', {
        method: 'POST',
        body: JSON.stringify({ tipo, especificacao, interessado, acesso }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error('Erro ao criar processo')

      const processoCriado = await res.json()

      toast.success('Processo criado com sucesso!')
      router.push(`/controle-de-processos/${processoCriado.id}`)
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

          <Button onClick={handleSalvar}>Salvar</Button>
        </CardContent>
      </Card>
    </div>
  )
}
