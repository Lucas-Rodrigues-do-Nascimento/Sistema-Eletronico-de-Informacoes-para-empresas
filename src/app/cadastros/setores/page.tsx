'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface UnidadeLoja {
  id: number;
  nome: string;
  descricao?: string;
}

interface Setor {
  id: number;
  nome: string;
  unidade?: UnidadeLoja;
}

export default function CadastroSetoresPage() {
  const [nome, setNome] = useState('');
  const [unidadeId, setUnidadeId] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [unidades, setUnidades] = useState<UnidadeLoja[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  async function fetchUnidades() {
    const res = await fetch('/api/unidades-loja');
    const data = await res.json();
    setUnidades(data);
  }

  async function fetchSetores() {
    const res = await fetch('/api/setores');
    const data = await res.json();
    setSetores(data);
  }

  async function handleSalvar() {
    try {
      if (!nome || !unidadeId) {
        setMensagem('❌ Nome e unidade são obrigatórios');
        return;
      }

      const url = editandoId ? `/api/setores/${editandoId}` : '/api/setores';
      const method = editandoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: JSON.stringify({ nome, unidadeId: Number(unidadeId) }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      setNome('');
      setUnidadeId('');
      setEditandoId(null);
      setMensagem('✅ Setor salvo com sucesso!');
      fetchSetores();
    } catch (err) {
      console.error('Erro ao salvar setor:', err);
      setMensagem('❌ Erro ao salvar setor');
    }
  }

  async function handleExcluir(id: number) {
    const confirmado = confirm('Tem certeza que deseja excluir este setor?');
    if (!confirmado) return;

    try {
      await fetch(`/api/setores/${id}`, {
        method: 'DELETE',
      });
      fetchSetores();
    } catch (err) {
      console.error('Erro ao excluir setor:', err);
    }
  }

  function iniciarEdicao(setor: Setor) {
    setEditandoId(setor.id);
    setNome(setor.nome);
    setUnidadeId(setor.unidade?.id?.toString() || '');
  }

  useEffect(() => {
    fetchUnidades();
    fetchSetores();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📁 Cadastro de Setores</h1>
        <div className="flex gap-2">
          <Link href="/cadastros">
            <Button variant="outline">← Voltar</Button>
          </Link>
          <Link href="/controle-de-processos">
            <Button variant="ghost">🏠 Voltar para Controle de Processos</Button>
          </Link>
        </div>
      </div>

      <Card className="max-w-md mb-8">
        <CardContent className="space-y-4 p-6">
          <div>
            <Label htmlFor="nome">Nome do Setor</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Financeiro, Compras..."
            />
          </div>
          <div>
            <Label htmlFor="unidade">Unidade de Loja</Label>
            <select
              id="unidade"
              value={unidadeId}
              onChange={(e) => setUnidadeId(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Selecione uma unidade</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id.toString()}>
                  {u.nome} {u.descricao ? `– ${u.descricao}` : ''}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleSalvar}>
            {editandoId ? 'Atualizar' : 'Salvar'}
          </Button>
          {mensagem && <p className="text-sm text-gray-700">{mensagem}</p>}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🏷️ Setores Cadastrados</h2>
        {setores.length === 0 ? (
          <p className="text-gray-500">Nenhum setor cadastrado.</p>
        ) : (
          <ul className="space-y-2">
            {setores.map((setor) => (
              <li
                key={setor.id}
                className="border rounded p-4 bg-white flex justify-between items-start"
              >
                <div>
                  <p className="font-semibold text-gray-800">{setor.nome}</p>
                  <p className="text-sm text-gray-600">
                    Unidade: {setor.unidade?.nome || 'Não definida'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => iniciarEdicao(setor)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleExcluir(setor.id)}
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
  );
}
