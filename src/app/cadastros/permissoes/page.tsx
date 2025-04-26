'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface Permissao {
  id: number;
  nome: string;
  descricao: string;
  codigo: string;
}

export default function PermissoesPage() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [codigo, setCodigo] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  async function fetchPermissoes() {
    try {
      const res = await fetch('/api/permissoes');
      const data = await res.json();
      setPermissoes(data);
    } catch (err) {
      console.error('Erro ao carregar permissões:', err);
    }
  }

  async function handleSalvar() {
    if (!nome || !descricao || !codigo) {
      setMensagem('❌ Preencha todos os campos');
      return;
    }

    try {
      const res = await fetch('/api/permissoes', {
        method: 'POST',
        body: JSON.stringify({ nome, descricao, codigo }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      setNome('');
      setDescricao('');
      setCodigo('');
      setMensagem('✅ Permissão salva com sucesso!');
      fetchPermissoes();
    } catch (err) {
      setMensagem('❌ Erro ao salvar permissão.');
      console.error(err);
    }
  }

  async function handleAtualizar() {
    if (!editandoId) return;
    if (!nome || !descricao) {
      setMensagem('❌ Preencha todos os campos');
      return;
    }

    try {
      const res = await fetch(`/api/permissoes/${editandoId}`, {
        method: 'PUT',
        body: JSON.stringify({ nome, descricao }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Erro ao atualizar');

      setNome('');
      setDescricao('');
      setCodigo('');
      setEditandoId(null);
      setMensagem('✅ Permissão atualizada com sucesso!');
      fetchPermissoes();
    } catch (err) {
      console.error('Erro ao atualizar:', err);
    }
  }

  async function handleExcluir(id: number) {
    const confirmar = confirm('Deseja realmente excluir esta permissão?');
    if (!confirmar) return;

    try {
      const res = await fetch(`/api/permissoes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      fetchPermissoes();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  }

  function iniciarEdicao(p: Permissao) {
    setEditandoId(p.id);
    setNome(p.nome);
    setDescricao(p.descricao);
    setCodigo(p.codigo);
  }

  useEffect(() => {
    fetchPermissoes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🛡️ Níveis de Acesso / Permissões</h1>
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
            <Label htmlFor="codigo">Código (sem espaços)</Label>
            <Input
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: admin, editor, visualizador..."
              disabled={!!editandoId}
            />
          </div>
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Administrador, Visualizador..."
            />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Explique o que esse nível pode fazer"
            />
          </div>
          {editandoId ? (
            <Button onClick={handleAtualizar}>Atualizar</Button>
          ) : (
            <Button onClick={handleSalvar}>Salvar</Button>
          )}
          {mensagem && <p className="text-sm text-gray-700">{mensagem}</p>}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🔐 Permissões cadastradas</h2>
        {permissoes.length === 0 ? (
          <p className="text-gray-500">Nenhuma permissão cadastrada.</p>
        ) : (
          <ul className="space-y-2">
            {permissoes.map((perm) => (
              <li key={perm.id} className="border rounded p-4 bg-white flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{perm.nome} <span className="text-sm text-gray-400">({perm.codigo})</span></p>
                  <p className="text-sm text-gray-600">{perm.descricao}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => iniciarEdicao(perm)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleExcluir(perm.id)}>
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
