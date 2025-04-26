'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface MotivoArquivamento {
  id: number
  descricao: string
}

export default function MotivosArquivamentoPage() {
  const [descricao, setDescricao] = useState('')
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [motivos, setMotivos] = useState<MotivoArquivamento[]>([])
  const [editandoId, setEditandoId] = useState<number | null>(null)

  async function fetchMotivos() {
    const res = await fetch('/api/motivos-arquivamento')
    const data = await res.json()
    setMotivos(data)
  }

  async function handleSalvar() {
    try {
      if (editandoId) {
        const res = await fetch(`/api/motivos-arquivamento/${editandoId}`, {
          method: 'PUT',
          body: JSON.stringify({ descricao }),
          headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) throw new Error('Erro ao atualizar')
        setMensagem('✅ Motivo atualizado com sucesso!')
      } else {
        const res = await fetch('/api/motivos-arquivamento', {
          method: 'POST',
          body: JSON.stringify({ descricao }),
          headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) throw new Error('Erro ao salvar')
        setMensagem('✅ Motivo salvo com sucesso!')
      }

      setDescricao('')
      setEditandoId(null)
      fetchMotivos()
    } catch (err) {
      setMensagem('❌ Erro ao salvar/atualizar motivo.')
      console.error(err)
    }
  }

  async function handleExcluir(id: number) {
    const confirmado = confirm('Tem certeza que deseja excluir este motivo?')
    if (!confirmado) return

    try {
      const res = await fetch(`/api/motivos-arquivamento/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Erro ao excluir')

      fetchMotivos()
    } catch (err) {
      console.error('Erro ao excluir:', err)
    }
  }

  function iniciarEdicao(motivo: MotivoArquivamento) {
    setDescricao(motivo.descricao)
    setEditandoId(motivo.id)
  }

  useEffect(() => {
    fetchMotivos()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-gray-800">
          📌 Motivos de Arquivamento
        </h1>
        <div className="flex gap-2">
          <Link href="/cadastros">
            <Button variant="outline">← Voltar</Button>
          </Link>
          <Link href="/controle-de-processos">
            <Button variant="outline">← Voltar para Controle de Processos</Button>
          </Link>
        </div>
      </div>

      <Card className="max-w-md mb-8">
        <CardContent className="space-y-4 p-6">
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Processo concluído, por engano..."
            />
          </div>
          <Button onClick={handleSalvar}>
            {editandoId ? 'Atualizar' : 'Salvar'}
          </Button>
          {mensagem && <p className="text-sm text-gray-700">{mensagem}</p>}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          🗂️ Motivos cadastrados
        </h2>
        {motivos.length === 0 ? (
          <p className="text-gray-500">Nenhum motivo cadastrado.</p>
        ) : (
          <ul className="space-y-2">
            {motivos.map((motivo) => (
              <li
                key={motivo.id}
                className="border rounded p-4 bg-white flex justify-between items-start"
              >
                <p className="text-gray-800">{motivo.descricao}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => iniciarEdicao(motivo)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleExcluir(motivo.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
