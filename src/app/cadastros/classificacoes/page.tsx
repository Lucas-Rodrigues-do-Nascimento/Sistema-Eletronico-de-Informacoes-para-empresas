'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface Classificacao {
  id: number;
  nome: string;
}

export default function ClassificacoesPage() {
  const [nome, setNome] = useState('');
  const [classificacoes, setClassificacoes] = useState<Classificacao[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function fetchClassificacoes() {
    const res = await fetch('/api/classificacoes');
    const data = await res.json();
    setClassificacoes(data);
  }

  async function handleSalvar() {
    try {
      const res = await fetch('/api/classificacoes', {
        method: 'POST',
        body: JSON.stringify({ nome }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error();
      setNome('');
      setMensagem('✅ Classificação salva!');
      fetchClassificacoes();
    } catch (err) {
      setMensagem('❌ Erro ao salvar classificação.');
    }
  }

  async function handleAtualizar() {
    try {
      const res = await fetch(`/api/classificacoes/${editandoId}`, {
        method: 'PUT',
        body: JSON.stringify({ nome }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error();
      setNome('');
      setEditandoId(null);
      setMensagem('✅ Classificação atualizada!');
      fetchClassificacoes();
    } catch (err) {
      setMensagem('❌ Erro ao atualizar classificação.');
    }
  }

  async function handleExcluir(id: number) {
    const confirm = window.confirm('Tem certeza que deseja excluir?');
    if (!confirm) return;

    try {
      const res = await fetch(`/api/classificacoes/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error();
      fetchClassificacoes();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  }

  function iniciarEdicao(item: Classificacao) {
    setNome(item.nome);
    setEditandoId(item.id);
  }

  function getBadgeColor(nome: string) {
    const cor = nome.toLowerCase();
    if (cor.includes('urgente')) return 'bg-red-100 text-red-800';
    if (cor.includes('sigilo') || cor.includes('sigiloso')) return 'bg-blue-100 text-blue-800';
    if (cor.includes('normal')) return 'bg-gray-100 text-gray-800';
    return 'bg-yellow-100 text-yellow-800';
  }

  useEffect(() => {
    fetchClassificacoes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏷️ Classificações</h1>
        <div className="flex gap-2">
          <Link href="/cadastros">
            <Button variant="outline">← Voltar</Button>
          </Link>
          <Link href="/controle-de-processos">
            <Button variant="outline">🏠 Controle de Processos</Button>
          </Link>
        </div>
      </div>

      <Card className="max-w-md mb-8">
        <CardContent className="space-y-4 p-6">
          <div>
            <Label htmlFor="nome">Nome da Classificação</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Urgente, Sigiloso..."
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          📋 Classificações Cadastradas
        </h2>
        {classificacoes.length === 0 ? (
          <p className="text-gray-500">Nenhuma classificação cadastrada.</p>
        ) : (
          <ul className="space-y-2">
            {classificacoes.map((item) => (
              <li
                key={item.id}
                className={`border rounded p-4 bg-white flex justify-between items-center`}
              >
                <span className={`px-2 py-1 text-sm rounded ${getBadgeColor(item.nome)}`}>
                  {item.nome}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => iniciarEdicao(item)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleExcluir(item.id)}>
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
