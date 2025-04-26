
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface TipoDocumento {
  id: number;
  nome: string;
  descricao: string;
  criadoEm: string;
}

export default function TipoDeDocumentoPage() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);

  async function fetchTipos() {
    try {
      const res = await fetch('/api/tipo-de-documento');
      const data = await res.json();
      setTipos(data);
    } catch (err) {
      console.error('Erro ao carregar tipos de documento:', err);
    }
  }

  async function handleSalvar() {
    try {
      const res = await fetch('/api/tipo-de-documento', {
        method: 'POST',
        body: JSON.stringify({ nome, descricao }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      setNome('');
      setDescricao('');
      setMensagem('✅ Tipo de documento salvo com sucesso!');
      fetchTipos();
    } catch (err) {
      setMensagem('❌ Erro ao salvar tipo de documento.');
      console.error(err);
    }
  }

  async function handleExcluir(id: number) {
    const confirmado = confirm('Tem certeza que deseja excluir este tipo de documento?');
    if (!confirmado) return;

    try {
      const res = await fetch(`/api/tipo-de-documento/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao excluir');

      fetchTipos();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  }

  useEffect(() => {
    fetchTipos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          🧾 Cadastro de Tipo de Documento
        </h1>
        <Link href="/controle-de-processos">
          <Button variant="outline">← Voltar para Controle de Processos</Button>
        </Link>
      </div>

      <Card className="max-w-md mb-8">
        <CardContent className="space-y-4 p-6">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Despacho, Memorando..."
            />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o uso do tipo"
            />
          </div>
          <Button onClick={handleSalvar}>Salvar</Button>
          {mensagem && <p className="text-sm text-gray-700">{mensagem}</p>}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          📄 Tipos de Documento Cadastrados
        </h2>
        {tipos.length === 0 ? (
          <p className="text-gray-500">Nenhum tipo de documento cadastrado.</p>
        ) : (
          <ul className="space-y-2">
            {tipos.map((tipo) => (
              <li key={tipo.id} className="border rounded p-4 bg-white flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{tipo.nome}</p>
                  <p className="text-sm text-gray-600">{tipo.descricao}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/cadastros/tipos-documento/${tipo.id}/editar`}>
                    <Button variant="outline" size="sm">Editar</Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => handleExcluir(tipo.id)}>
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
