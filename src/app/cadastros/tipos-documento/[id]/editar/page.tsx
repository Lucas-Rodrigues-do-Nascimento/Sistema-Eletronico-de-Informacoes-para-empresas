'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function EditarTipoDocumentoPage() {
  const { id } = useParams();
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [modelo, setModelo] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTipo() {
      try {
        const res = await fetch(`/api/tipos-documento/${id}`);
        if (!res.ok) throw new Error('Tipo não encontrado');
        const tipo = await res.json();
        setNome(tipo.nome);
        setDescricao(tipo.descricao || '');
        setModelo(tipo.modeloPadrao || '');
      } catch (err) {
        setMensagem('❌ Falha ao carregar tipo de documento');
        console.error(err);
      }
    }

    fetchTipo();
  }, [id]);

  async function handleSalvar() {
    try {
      const res = await fetch(`/api/tipos-documento/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ nome, descricao, modeloPadrao: modelo }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Erro ao salvar alterações');

      setMensagem('✅ Alterações salvas com sucesso!');
      router.push('/cadastros/tipos-documento');
    } catch (err) {
      setMensagem('❌ Erro ao salvar alterações.');
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">✏️ Editar Tipo de Documento</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Input id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="modelo">Modelo (conteúdo padrão)</Label>
          <Textarea
            id="modelo"
            rows={12}
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
          />
        </div>
        <Button onClick={handleSalvar}>Salvar Alterações</Button>
        {mensagem && <p className="text-sm text-gray-700">{mensagem}</p>}
      </div>
    </div>
  );
}
