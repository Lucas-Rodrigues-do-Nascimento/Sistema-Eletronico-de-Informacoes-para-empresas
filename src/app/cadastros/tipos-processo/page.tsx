'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface TipoProcesso {
  id: number;
  nome: string;
  descricao: string;
}

export default function TiposProcessoPage() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipos, setTipos] = useState<TipoProcesso[]>([]);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function fetchTipos() {
    const res = await fetch('/api/tipos-processo');
    const data = await res.json();
    setTipos(data);
  }

  async function handleSalvar() {
    try {
      const res = await fetch('/api/tipos-processo', {
        method: 'POST',
        body: JSON.stringify({ nome, descricao }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      setNome('');
      setDescricao('');
      setMensagem('✅ Tipo salvo com sucesso!');
      fetchTipos();
    } catch (err) {
      console.error(err);
      setMensagem('❌ Erro ao salvar tipo de processo.');
    }
  }

  useEffect(() => {
    fetchTipos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Cabeçalho com dois botões */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          📚 Tipos de Processo
        </h1>
        <div className="flex gap-2">
          <Link href="/cadastros">
            <Button variant="outline">← Voltar</Button>
          </Link>
          <Link href="/controle-de-processos">
            <Button variant="outline">🏠 Voltar para Controle de Processos</Button>
          </Link>
        </div>
      </div>

      {/* Formulário */}
      <Card className="max-w-md mb-8">
        <CardContent className="space-y-4 p-6">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Requisição, Justificativa..."
            />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição opcional"
            />
          </div>
          <Button onClick={handleSalvar}>Salvar</Button>
          {mensagem && <p className="text-sm text-gray-700">{mensagem}</p>}
        </CardContent>
      </Card>

      {/* Lista de tipos cadastrados */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          🗂️ Tipos cadastrados
        </h2>
        {tipos.length === 0 ? (
          <p className="text-gray-500">Nenhum tipo de processo cadastrado.</p>
        ) : (
          <ul className="space-y-2">
            {tipos.map((tipo) => (
              <li key={tipo.id} className="border rounded p-4 bg-white">
                <p className="font-semibold text-gray-800">{tipo.nome}</p>
                <p className="text-sm text-gray-600">{tipo.descricao}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
