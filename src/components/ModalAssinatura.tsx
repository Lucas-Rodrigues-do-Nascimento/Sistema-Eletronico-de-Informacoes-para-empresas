'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  documentoId: number
  onClose: () => void
  onSuccess: () => void
}

export default function ModalAssinatura({ documentoId, onClose, onSuccess }: Props) {
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const assinar = async () => {
    setCarregando(true)
    setErro(null)
    try {
      const res = await fetch(`/api/documento/${documentoId}/assinar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao assinar documento')
      }

      // Espera um pequeno tempo antes de atualizar para garantir que o backend finalizou tudo
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 300) // ⏱️ esse delay de 300ms ajuda o fetch a refletir no reload

    } catch (err: any) {
      setErro(err.message || 'Erro ao assinar: senha incorreta ou problema no servidor.')
      setCarregando(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      assinar()
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Assinatura Digital</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600 mb-2">
          Digite sua senha para assinar digitalmente este documento:
        </p>

        <Input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={carregando}
        />

        {erro && <p className="text-sm text-red-600 mt-2">{erro}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={carregando}>
            Cancelar
          </Button>
          <Button onClick={assinar} disabled={carregando || senha.length === 0}>
            {carregando ? 'Assinando...' : 'Confirmar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
