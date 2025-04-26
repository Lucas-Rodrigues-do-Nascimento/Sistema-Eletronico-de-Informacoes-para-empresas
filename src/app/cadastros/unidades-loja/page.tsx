"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface UnidadeLoja {
  id: number;
  nome: string;
  descricao?: string;
}

export default function UnidadesLojaPage() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [unidades, setUnidades] = useState<UnidadeLoja[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  async function fetchUnidades() {
    const res = await fetch("/api/unidades-loja");
    const data = await res.json();
    setUnidades(data);
  }

  async function handleSalvar() {
    try {
      const res = await fetch("/api/unidades-loja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, endereco: descricao }),
      });

      if (!res.ok) throw new Error("Erro ao salvar unidade");

      setNome("");
      setDescricao("");
      setMensagem("✅ Unidade cadastrada com sucesso!");
      fetchUnidades();
    } catch (err) {
      console.error("Erro ao salvar unidade:", err);
      setMensagem("❌ Erro ao cadastrar unidade.");
    }
  }

  async function handleAtualizar() {
    try {
      const res = await fetch(`/api/unidades-loja/${editandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, descricao }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar unidade");

      setNome("");
      setDescricao("");
      setEditandoId(null);
      setMensagem("✅ Unidade atualizada com sucesso!");
      fetchUnidades();
    } catch (err) {
      console.error("Erro ao atualizar unidade:", err);
      setMensagem("❌ Erro ao atualizar unidade.");
    }
  }

  async function handleExcluir(id: number) {
    const confirmar = confirm("Deseja excluir esta unidade?");
    if (!confirmar) return;

    try {
      await fetch(`/api/unidades-loja/${id}`, { method: "DELETE" });
      fetchUnidades();
    } catch (err) {
      console.error("Erro ao excluir unidade:", err);
    }
  }

  function iniciarEdicao(unidade: UnidadeLoja) {
    setEditandoId(unidade.id);
    setNome(unidade.nome ?? "");
    setDescricao(unidade.descricao ?? "");
  }

  useEffect(() => {
    fetchUnidades();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏬 Cadastro de Unidades de Loja</h1>
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
            <Label htmlFor="nome">Nome da Unidade</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome da unidade"
            />
          </div>
          <div>
            <Label htmlFor="descricao">Endereço / Descrição</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Unidade central, centro logístico..."
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">🏷️ Unidades cadastradas</h2>
        {unidades.length === 0 ? (
          <p className="text-gray-500">Nenhuma unidade cadastrada.</p>
        ) : (
          <ul className="space-y-2">
            {unidades.map((u) => (
              <li key={u.id} className="border rounded p-4 bg-white">
                <p className="font-semibold text-gray-800">{u.nome}</p>
                <p className="text-sm text-gray-600">
                  {u.descricao || "Sem descrição"}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => iniciarEdicao(u)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleExcluir(u.id)}>
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
