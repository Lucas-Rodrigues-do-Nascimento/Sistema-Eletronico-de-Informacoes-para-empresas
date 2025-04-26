'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ModalExcluirColaboradorProps {
  open: boolean
  onClose: () => void
  colaboradorId: number
  colaboradorNome: string
  onExcluido: () => void
}

export default function ModalExcluirColaborador({
  open,
  onClose,
  colaboradorId,
  colaboradorNome,
  onExcluido,
}: ModalExcluirColaboradorProps) {
  const [loading, setLoading] = useState(false)

  async function handleExcluir() {
    if (!colaboradorId) {
      toast.error('❌ Colaborador inválido.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/colaboradores/${colaboradorId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Erro ao excluir colaborador')

      toast.success('✅ Colaborador excluído com sucesso!')
      onClose()
      onExcluido()
    } catch (error) {
      console.error(error)
      toast.error('❌ Erro ao excluir colaborador.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🗑️ Excluir Colaborador</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm">
            Tem certeza que deseja excluir o colaborador <strong>{colaboradorNome}</strong>?<br />
            Essa ação não poderá ser desfeita.
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleExcluir} disabled={loading}>
              {loading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
