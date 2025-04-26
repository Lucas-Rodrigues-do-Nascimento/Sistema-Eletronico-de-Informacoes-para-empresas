'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface ModalAlterarSenhaProps {
  open: boolean
  onClose: () => void
  colaboradorId: number
  onAtualizado: () => void
}

export default function ModalAlterarSenha({
  open,
  onClose,
  colaboradorId,
  onAtualizado,
}: ModalAlterarSenhaProps) {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAlterar() {
    if (!novaSenha || !confirmacao) {
      toast.error('⚠️ Preencha todos os campos.')
      return
    }

    if (novaSenha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (novaSenha !== confirmacao) {
      toast.error('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/colaboradores/${colaboradorId}/alterar-senha`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novaSenha }),
      })

      if (!res.ok) throw new Error('Erro ao alterar senha')

      toast.success('✅ Senha alterada com sucesso!')
      setNovaSenha('')
      setConfirmacao('')
      onAtualizado()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('❌ Erro ao alterar senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🔐 Alterar Senha</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="novaSenha">Nova Senha</Label>
            <Input
              id="novaSenha"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite a nova senha"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="confirmacaoSenha">Confirmar Nova Senha</Label>
            <Input
              id="confirmacaoSenha"
              type="password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder="Confirme a nova senha"
              disabled={loading}
            />
          </div>

          <Button onClick={handleAlterar} className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Nova Senha'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
