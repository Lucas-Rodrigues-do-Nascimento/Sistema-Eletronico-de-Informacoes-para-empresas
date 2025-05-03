'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface Setor {
  id: number
  nome: string
}

export default function SelectSetor() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const [setores, setSetores] = useState<Setor[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(false)

  const setorAtual = session?.user?.setor ?? null
  const permissoes: string[] = session?.user?.permissoes ?? []
  const podeTrocarSetor = permissoes.includes('mudar_setor') // 👈 corrigido aqui

  const setorSelecionado = setores.find((s) => s.id === setorAtual)

  useEffect(() => {
    async function carregarSetores() {
      try {
        const res = await fetch('/api/setores')
        const data = await res.json()
        setSetores(data)
      } catch (err) {
        console.error('Erro ao carregar setores:', err)
        setErro(true)
      } finally {
        setLoading(false)
      }
    }

    carregarSetores()
  }, [])

  async function handleChange(value: string) {
    try {
      const novoSetor = parseInt(value)
      const res = await fetch('/api/usuario/setor', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setor: novoSetor }),
      })

      if (!res.ok) throw new Error('Erro ao atualizar setor')

      await update()
      toast.success('✅ Setor alterado com sucesso!', { duration: 4000 })
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (err) {
      console.error(err)
      toast.error('❌ Erro ao atualizar setor', { duration: 4000 })
    }
  }

  if (loading) return null
  if (erro) return <p className="text-red-500 text-sm">Erro ao carregar setores.</p>
  if (!setorAtual) return null

  // 🔐 Caso o usuário não possa trocar de setor, apenas exibe o nome fixo
  if (!podeTrocarSetor) {
    return (
      <div className="px-4 py-2 border rounded text-sm bg-gray-100 text-gray-700">
        Setor: {setorSelecionado?.nome ?? '—'} (#{setorSelecionado?.id ?? '—'})
      </div>
    )
  }

  return (
    <Select onValueChange={handleChange} defaultValue={String(setorAtual)}>
      <SelectTrigger className="w-[240px] border-gray-300">
        <SelectValue>
          {setorSelecionado
            ? `Setor: ${setorSelecionado.nome} (#${setorSelecionado.id})`
            : 'Selecionar setor'}
        </SelectValue>
        <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
      </SelectTrigger>
      <SelectContent>
        {setores.map((s) => (
          <SelectItem key={s.id} value={String(s.id)}>
            {s.nome} (#{s.id})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
