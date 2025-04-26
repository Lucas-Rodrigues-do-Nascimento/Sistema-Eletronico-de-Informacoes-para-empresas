'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'

type Colaborador = {
  id: number
  nome: string
  email: string
  telefone: string
  cargo: string
  ativo: boolean
  setor: {
    id: number
    nome: string
  }
}

export default function ListaColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])

  async function fetchColaboradores() {
    try {
      const res = await fetch('/api/colaboradores/listar')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setColaboradores(data)
    } catch (err) {
      console.error('Erro ao buscar colaboradores:', err)
      toast.error('Erro ao carregar colaboradores')
    }
  }

  async function handleInativar(id: number) {
    try {
      const res = await fetch(`/api/colaboradores/${id}/ativo`, {
        method: 'PATCH',
      })
      if (!res.ok) throw new Error()
      toast.success('Status alterado com sucesso!')
      fetchColaboradores()
    } catch (err) {
      console.error('Erro ao alterar status:', err)
      toast.error('Erro ao alterar status do colaborador')
    }
  }

  useEffect(() => {
    fetchColaboradores()
  }, [])

  const colaboradoresPorSetor = colaboradores.reduce((acc, colab) => {
    const setorId = colab.setor.id
    if (!acc[setorId]) {
      acc[setorId] = { nome: colab.setor.nome, colaboradores: [] }
    }
    acc[setorId].colaboradores.push(colab)
    return acc
  }, {} as Record<number, { nome: string; colaboradores: Colaborador[] }>)

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">👥 Lista de Colaboradores</h1>
        <Link href="/cadastros/colaboradores">
          <Button variant="outline">+ Novo Colaborador</Button>
        </Link>
      </div>

      {Object.entries(colaboradoresPorSetor).length === 0 ? (
        <p className="text-gray-500">Nenhum colaborador cadastrado.</p>
      ) : (
        Object.entries(colaboradoresPorSetor).map(([id, grupo]) => (
          <div key={id} className="space-y-3">
            <h2 className="text-xl font-semibold text-indigo-700 mt-6">
              Setor: {grupo.nome}
            </h2>
            {grupo.colaboradores.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800">{c.nome}</h3>
                    <p className="text-sm text-gray-600">{c.email} · {c.telefone} · {c.cargo}</p>
                    <p className="text-xs text-gray-500">
                      Status: {c.ativo ? (
                        <span className="text-green-600 font-semibold">Ativo</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Inativo</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/cadastros/colaboradores/${c.id}`}>
                      <Button size="sm" variant="outline">Editar</Button>
                    </Link>
                    <Button
                      size="sm"
                      variant={c.ativo ? 'destructive' : 'default'}
                      onClick={() => handleInativar(c.id)}
                    >
                      {c.ativo ? 'Inativar' : 'Ativar'}
                    </Button>
                    {/* Aqui pode futuramente abrir um modal de Alterar Senha */}
                    {/* <Button size="sm" variant="outline">Alterar Senha</Button> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
