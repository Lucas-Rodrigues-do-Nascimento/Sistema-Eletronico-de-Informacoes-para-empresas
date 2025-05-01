'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  setor: { id: number } | null;
  permissoes: { id: number }[];
}

interface ModalEditarColaboradorProps {
  open: boolean;
  onClose: () => void;
  colaborador: Colaborador;
  setores: Setor[];
  permissoes: Permissao[];
  onAtualizado: () => void;
}

export default function ModalEditarColaborador({
  open,
  onClose,
  colaborador,
  setores,
  permissoes,
  onAtualizado,
}: ModalEditarColaboradorProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cargo, setCargo] = useState('');
  const [setorId, setSetorId] = useState<number | ''>('');
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  function formatarCPF(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function formatarTelefone(value: string) {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{4})$/, '$1-$2');
  }

  useEffect(() => {
    if (colaborador && open) {
      setNome(colaborador.nome);
      setEmail(colaborador.email);
      setCpf(formatarCPF(colaborador.cpf));
      setTelefone(formatarTelefone(colaborador.telefone));
      setCargo(colaborador.cargo);
      setSetorId(colaborador.setor?.id ?? '');
      setPermissoesSelecionadas(colaborador.permissoes.map((p) => p.id));
    }
  }, [colaborador, open]); // ✅ atualiza ao abrir novo colaborador

  async function handleSalvar() {
    setLoading(true);

    try {
      const res = await fetch(`/api/colaboradores/${colaborador.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          cpf: cpf.replace(/\D/g, ''),
          telefone: telefone.replace(/\D/g, ''),
          cargo,
          setorId,
          permissoes: permissoesSelecionadas,
        }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar colaborador');

      toast.success('✅ Colaborador atualizado com sucesso!');
      onClose();
      onAtualizado();
    } catch (err) {
      console.error(err);
      toast.error('❌ Erro ao atualizar colaborador');
    } finally {
      setLoading(false);
    }
  }

  function handlePermissaoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) => Number(option.value));
    setPermissoesSelecionadas(selectedOptions);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>✏️ Editar Colaborador</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} disabled={loading} />
          </div>

          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>

          <div>
            <Label>CPF</Label>
            <Input
              value={cpf}
              onChange={(e) => setCpf(formatarCPF(e.target.value))}
              disabled={loading}
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <Label>Telefone</Label>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              disabled={loading}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <Label>Cargo</Label>
            <Input value={cargo} onChange={(e) => setCargo(e.target.value)} disabled={loading} />
          </div>

          <div>
            <Label>Setor</Label>
            <select
              value={setorId}
              onChange={(e) => setSetorId(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
              disabled={loading}
            >
              <option value="">Selecione o setor</option>
              {setores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Permissões</Label>
            <select
              multiple
              value={permissoesSelecionadas.map(String)}
              onChange={handlePermissaoChange}
              className="w-full border rounded px-3 py-2 text-sm"
              disabled={loading}
            >
              {permissoes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
            <small className="text-xs text-gray-500">Segure Ctrl (Windows) ou Cmd (Mac) para selecionar várias</small>
          </div>

          <div className="pt-2">
            <Button onClick={handleSalvar} className="w-full" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
