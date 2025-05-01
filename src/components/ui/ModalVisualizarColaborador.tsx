'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Setor {
  id: number;
  nome: string;
}

interface Permissao {
  id: number;
  nome: string;
}

interface Colaborador {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  cargo: string;
  ativo: boolean;
  setor: Setor | null;
  permissoes: Permissao[];
}

interface ModalVisualizarColaboradorProps {
  open: boolean;
  onClose: () => void;
  colaborador: Colaborador;
}

export default function ModalVisualizarColaborador({
  open,
  onClose,
  colaborador,
}: ModalVisualizarColaboradorProps) {
  const [avisado, setAvisado] = useState(false);

  function formatarCPF(cpf: string) {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function formatarTelefone(tel: string) {
    return tel
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{4})$/, '$1-$2');
  }

  useEffect(() => {
    if (open) {
      if (!avisado) {
        if (!colaborador.setor) {
          toast.warning(`⚠️ ${colaborador.nome} não possui setor vinculado.`);
        }
        if (!colaborador.permissoes || colaborador.permissoes.length === 0) {
          toast.warning(`⚠️ ${colaborador.nome} não possui permissão atribuída.`);
        }
        setAvisado(true);
      }
    } else {
      setAvisado(false); // ✅ reset ao fechar
    }
  }, [open, colaborador, avisado]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>👁️ Visualizar Colaborador</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Nome:</strong> {colaborador.nome}</p>
          <p><strong>Email:</strong> {colaborador.email}</p>
          <p><strong>CPF:</strong> {formatarCPF(colaborador.cpf)}</p>
          <p><strong>Telefone:</strong> {formatarTelefone(colaborador.telefone)}</p>
          <p><strong>Cargo:</strong> {colaborador.cargo}</p>
          <p><strong>Status:</strong> {colaborador.ativo ? '✅ Ativo' : '🚫 Inativo'}</p>
          <p><strong>Setor:</strong> {colaborador.setor?.nome ?? 'Não vinculado'}</p>
          <p>
            <strong>Permissões:</strong>{' '}
            {colaborador.permissoes?.length
              ? colaborador.permissoes.map((p) => p.nome).join(', ')
              : 'Não atribuída'}
          </p>
        </div>

        <div className="pt-4">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
