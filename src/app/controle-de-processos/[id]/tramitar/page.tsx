'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb'
import { Checkbox } from '@/components/ui/checkbox'
import { useSession } from 'next-auth/react'

interface Setor {
  id: number
  nome: string
}

export default function TramitePage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [setores, setSetores] = useState<Setor[]>([])
  const [paraSetorId, setParaSetorId] = useState<number | ''>('')
  const [observacoes, setObservacoes] = useState('')
  const [manterAberto, setManterAberto] = useState(false)
  const [loading, setLoading] = useState(false)

  const setorAtual = session?.user?.setor

  useEffect(() => {
    async function fetchSetores() {
      try {
        const res = await fetch('/api/setores')
        const data = await res.json()
        setSetores(data)
      } catch (error) {
        toast.error('❌ Erro ao carregar setores')
      }
    }

    fetchSetores()
  }, [])

  async function handleTramitar() {
    if (!setorAtual) {
      toast.error('⚠️ Setor atual não identificado.')
      return
    }

    if (!paraSetorId) {
      toast.error('⚠️ Selecione o setor de destino.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/processos/${id}/tramitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paraSetorId,
          observacoes,
          manterAbertoNoSetorOrigem: manterAberto,
        }),
      })

      if (!res.ok) throw new Error('Falha ao tramitar processo')

      toast.success('✅ Processo tramitado com sucesso!')
      router.push('/controle-de-processos')
    } catch (error) {
      console.error(error)
      toast.error('❌ Erro ao tramitar processo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/controle-de-processos">Controle de Processos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">Tramitar Processo</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="flex gap-2">
          <Link href={`/controle-de-processos/${id}`}>
            <Button variant="outline">← Voltar</Button>
          </Link>
          <Link href="/controle-de-processos">
            <Button variant="ghost">🏠 Controle de Processos</Button>
          </Link>
        </div>
      </div>

      <Card className="max-w-xl mx-auto">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-xl font-bold text-gray-800">📤 Tramitar Processo</h1>

          <div>
            <Label htmlFor="setor">Setor de Destino</Label>
            <select
              id="setor"
              value={paraSetorId}
              onChange={(e) => setParaSetorId(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Selecione o setor</option>
              {setores.map((setor) => (
                <option key={setor.id} value={setor.id}>
                  {setor.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="obs">Observações</Label>
            <Input
              id="obs"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Motivo ou observações do trâmite"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="manterAberto"
              checked={manterAberto}
              onCheckedChange={(checked) => setManterAberto(!!checked)}
            />
            <Label htmlFor="manterAberto">Manter processo aberto no setor atual</Label>
          </div>

          <Button onClick={handleTramitar} disabled={loading}>
            {loading ? 'Tramitando...' : 'Salvar Trâmite'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
