// src/app/controle-de-processos/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SelectSetor from "@/components/SelectSetor";
import { separarProcessosPorSetor } from "@/lib/utils";

import {
  FilePlus,
  Search,
  Archive,
  Settings,
  Folder,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

function getIcon(nome: string) {
  const ext = nome.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "📄";
    case "doc":
    case "docx":
      return "📝";
    case "png":
    case "jpg":
    case "jpeg":
      return "🖼️";
    case "xls":
    case "xlsx":
      return "📊";
    default:
      return "📎";
  }
}

export default async function ControleDeProcessosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/controle-de-processos");
  }

  console.log("Sessão carregada:", session); // ✅ debug para ver se setor vem corretamente

  const setorSelecionadoId = Number(session.user.setor);
  if (isNaN(setorSelecionadoId)) {
    return (
      <div className="p-4 text-red-600">
        Setor inválido ou não definido. Faça login novamente.
      </div>
    );
  }

  const todosProcessos = await prisma.processo.findMany({
    where: { arquivado: false },
    orderBy: { criadoEm: "desc" },
    include: {
      documentos: true,
      movimentacoes: {
        orderBy: { criadoEm: "asc" },
        include: {
          de: { select: { nome: true } },
          para: { select: { nome: true } },
        },
      },
    },
  });

  const { processosGerados, processosRecebidos } = separarProcessosPorSetor(
    todosProcessos,
    setorSelecionadoId
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 border-r border-gray-200 bg-white p-6 space-y-4">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Menu</h1>

        <div className="space-y-2">
          <Link href="/controle-de-processos/novo">
            <Button variant="outline" className="w-full flex gap-2 justify-start">
              <FilePlus className="w-4 h-4" /> Novo Processo
            </Button>
          </Link>

          <Link href="/cadastros">
            <Button variant="outline" className="w-full flex gap-2 justify-start">
              <Folder className="w-4 h-4" /> Cadastros
            </Button>
          </Link>

          <Link href="/controle-de-processos/consultar">
            <Button variant="outline" className="w-full flex gap-2 justify-start">
              <Search className="w-4 h-4" /> Consultar
            </Button>
          </Link>

          <Link href="/controle-de-processos/arquivados">
            <Button variant="outline" className="w-full flex gap-2 justify-start">
              <Archive className="w-4 h-4" /> Arquivados
            </Button>
          </Link>

          <Link href="/administracao">
            <Button variant="outline" className="w-full flex gap-2 justify-start">
              <Settings className="w-4 h-4" /> Administração
            </Button>
          </Link>

          <Link href="/verificar-assinatura">
            <Button variant="outline" className="w-full flex gap-2 justify-start">
              <ShieldCheck className="w-4 h-4" /> Verificar Assinatura
            </Button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <nav className="text-sm text-gray-500 mb-2">
              <ol className="flex">
                <li>
                  <Link href="/" className="hover:underline text-blue-600">
                    Início
                  </Link>
                </li>
                <li className="mx-2">/</li>
                <li className="text-gray-700 font-medium">Controle de Processos</li>
              </ol>
            </nav>

            <h1 className="text-2xl font-bold text-gray-800">
              📋 Controle de Processos
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <SelectSetor />

            <form action="/api/auth/signout" method="post">
              <Button type="submit" variant="outline" className="flex gap-2">
                <LogOut className="w-4 h-4" /> Sair
              </Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">📤 Processos Gerados</h2>
            <div className="space-y-3">
              {processosGerados.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum processo gerado.</p>
              ) : (
                processosGerados.map((proc) => (
                  <Link key={proc.id} href={`/controle-de-processos/${proc.id}`}>
                    <Card className="hover:shadow cursor-pointer relative group">
                      <CardContent className="p-4 space-y-1">
                        <h3 className="font-bold">
                          #{proc.numero} · {proc.tipo.toUpperCase()} – {proc.especificacao}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Interessado: {proc.interessado} · Acesso: {proc.acesso}
                        </p>
                        <p className="text-xs text-gray-500">
                          Criado em: {new Date(proc.criadoEm).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">📥 Processos Recebidos</h2>
            <div className="space-y-3">
              {processosRecebidos.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum processo recebido.</p>
              ) : (
                processosRecebidos.map((proc) => (
                  <Link key={proc.id} href={`/controle-de-processos/${proc.id}`}>
                    <Card className="hover:shadow cursor-pointer relative group">
                      <CardContent className="p-4 space-y-1">
                        <h3 className="font-bold">
                          #{proc.numero} · {proc.tipo.toUpperCase()} – {proc.especificacao}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Interessado: {proc.interessado} · Acesso: {proc.acesso}
                        </p>
                        <p className="text-xs text-gray-500">
                          Criado em: {new Date(proc.criadoEm).toLocaleDateString()}
                        </p>
                        <ul className="flex flex-wrap gap-1 mt-1 text-xs">
                          {proc.documentos.slice(0, 3).map((d) => (
                            <li key={d.id}>{getIcon(d.nome)}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
