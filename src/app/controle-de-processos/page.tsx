// src/app/controle-de-processos/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SelectSetor from "@/components/SelectSetor";
import { separarProcessosPorSetor, ProcessoComRelSelecionado } from "@/lib/utils";

import {
  FilePlus,
  Database,
  Settings,
  Folder,
  ShieldCheck,
  User,
  LogOut,
  KeyRound,
  ChevronRight, // Ícone para submenu
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"; // Importar Collapsible

export const dynamic = "force-dynamic";

function getIcon(nome: string) {
  const ext = nome.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return "📄";
    case "doc": case "docx": return "📝";
    case "png": case "jpg": case "jpeg": return "🖼️";
    case "xls": case "xlsx": return "📊";
    default: return "📎";
  }
}

export default async function ControleDeProcessosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/controle-de-processos");
  }

  const setorSelecionadoId = Number(session.user.setor);
  const userId = Number(session.user.id);
  const userPermissoes = session?.user?.permissoes || [];

  // Verifica se o usuário é ADMIN
  const isUserAdmin = userPermissoes.includes('ADMIN');

  if (isNaN(setorSelecionadoId)) {
    return <div className="p-4 text-red-600">Setor inválido ou não definido.</div>;
  }
  if (isNaN(userId)) {
     return <div className="p-4 text-red-600">ID de usuário inválido na sessão.</div>;
  }

  const todosProcessos: ProcessoComRelSelecionado[] = await prisma.processo.findMany({
    where: { arquivado: false },
    orderBy: { criadoEm: "desc" },
    select: {
        id: true, numero: true, tipo: true, especificacao: true, interessado: true,
        acesso: true, criadoEm: true, arquivado: true, criadorId: true, setorOrigemId: true,
        documentos: { select: { id: true, nome: true }, take: 3 },
        movimentacoes: { orderBy: { criadoEm: 'desc' }, take: 1, select: { paraSetor: true, manterAbertoNoSetorOrigem: true, ativo: true, deSetor: true }},
        controleAcessos: { where: { colaboradorId: userId }, select: { id: true }}
    }
  });

  const { processosGerados, processosRecebidos } = separarProcessosPorSetor(
    todosProcessos, setorSelecionadoId, userId, userPermissoes
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 border-r border-gray-200 bg-white p-6 space-y-4 flex flex-col">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Menu</h1>
        <nav className="space-y-1 flex-1"> {/* Diminuído space-y para melhor agrupamento do submenu */}
          <Link href="/controle-de-processos/novo">
            <Button variant="outline" className="w-full flex gap-2 justify-start text-sm">
              <FilePlus className="w-4 h-4" /> Novo Processo
            </Button>
          </Link>
          {/* Link de Pesquisa (mantido como antes) */}
          <Link href="/pesquisar">
            <Button variant="outline" className="w-full flex gap-2 justify-start text-sm">
              <Database className="w-4 h-4" /> Pesquisar
            </Button>
          </Link>

          {/* --- ITEM ADMINISTRAÇÃO COM SUBMENU E CONDICIONAL --- */}
          {isUserAdmin && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between items-center text-sm pr-2"> {/* pr-2 para dar espaço ao chevron */}
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Administração
                  </div>
                  <ChevronRight className="collapsible-chevron h-4 w-4 text-gray-500 transition-transform duration-200" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="py-1 pl-5 space-y-1 mt-1 border-l-2 border-gray-200 ml-2"> {/* Ajustes de estilo para submenu */}
                <Link href="/administracao/colaboradores">
                    <Button variant="ghost" className="w-full flex gap-2 justify-start text-sm h-9 font-normal text-gray-700 hover:bg-gray-100">
                        <User className="w-3.5 h-3.5" /> Colaboradores
                    </Button>
                </Link>
                <Link href="/cadastros">
                  <Button variant="ghost" className="w-full flex gap-2 justify-start text-sm h-9 font-normal text-gray-700 hover:bg-gray-100">
                    <Folder className="w-3.5 h-3.5" /> Cadastros Gerais
                  </Button>
                </Link>
                {/* Exemplo de outro link de admin */}
                 <Link href="/administracao/setores">
                    <Button variant="ghost" className="w-full flex gap-2 justify-start text-sm h-9 font-normal text-gray-700 hover:bg-gray-100">
                        <Folder className="w-3.5 h-3.5" /> Gerenciar Setores
                    </Button>
                </Link>
                 {/* Adicione mais links de administração aqui conforme necessário */}
              </CollapsibleContent>
            </Collapsible>
          )}
          {/* --- FIM ITEM ADMINISTRAÇÃO --- */}

          <Link href="/verificar-assinatura">
            <Button variant="outline" className="w-full flex gap-2 justify-start text-sm">
              <ShieldCheck className="w-4 h-4" /> Verificar Assinatura
            </Button>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
       {/* ... (cabeçalho da página e dropdown do usuário - sem alterações significativas aqui) ... */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
                <nav className="text-sm text-gray-500 mb-1"><ol className="flex flex-wrap"><li><Link href="/" className="hover:underline text-blue-600">Início</Link></li><li className="mx-2">/</li><li className="text-gray-700 font-medium">Controle de Processos</li></ol></nav>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>Controle de Processos</h1>
            </div>
            <div className="flex items-center gap-4">
                <SelectSetor />
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{session.user.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback></Avatar>
                        <span className="hidden sm:inline">{session.user.name?.split(" ")[0] ?? "Usuário"}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-sm font-normal">{session.user.name}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href="/perfil" className="text-sm"><User className="w-4 h-4 mr-2" /> Meu Perfil</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/perfil/alterar-senha" className="text-sm"><KeyRound className="w-4 h-4 mr-2" /> Alterar Senha</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="p-0">
                            <form action="/api/auth/signout" method="post" className="w-full">
                                <button type="submit" className="w-full flex items-center text-sm px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-sm"><LogOut className="w-4 h-4 mr-2" /> Sair</button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        {/* Grid para Gerados e Recebidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <section>
                <h2 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>Processos Gerados ({processosGerados.length})</h2>
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">{processosGerados.length === 0 ? ( <Card className="border-dashed border-gray-300"><CardContent className="p-4 text-center text-gray-500 text-sm">Nenhum processo gerado neste setor.</CardContent></Card> ) : ( processosGerados.map((proc) => (<Link key={proc.id} href={`/controle-de-processos/${proc.id}`}><Card className="hover:shadow-md hover:border-indigo-300 cursor-pointer transition-shadow duration-150 border"><CardContent className="p-3 space-y-1"><h3 className="font-semibold text-sm truncate text-gray-800" title={`${proc.tipo} - ${proc.especificacao}`}><span className="text-indigo-600">#{proc.numero || 'S/N'}</span> · {proc.tipo}</h3>{proc.especificacao && <p className="text-xs text-gray-600 truncate">{proc.especificacao}</p>}<p className="text-xs text-gray-500"><span title="Interessado">👤 {proc.interessado}</span> · <span title="Nível de Acesso">🌐 {proc.acesso}</span></p><p className="text-xs text-gray-400 pt-1">Criado em: {new Date(proc.criadoEm).toLocaleDateString()}</p></CardContent></Card></Link>)))}</div>
            </section>
           <section>
                 <h2 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" /></svg>Processos na Unidade ({processosRecebidos.length})</h2>
                 <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">{processosRecebidos.length === 0 ? ( <Card className="border-dashed border-gray-300"><CardContent className="p-4 text-center text-gray-500 text-sm">Nenhum processo neste setor.</CardContent></Card> ) : ( processosRecebidos.map((proc) => (<Link key={proc.id} href={`/controle-de-processos/${proc.id}`}><Card className="hover:shadow-md hover:border-indigo-300 cursor-pointer transition-shadow duration-150 border"><CardContent className="p-3 space-y-1"><h3 className="font-semibold text-sm truncate text-gray-800" title={`${proc.tipo} - ${proc.especificacao}`}><span className="text-indigo-600">#{proc.numero || 'S/N'}</span> · {proc.tipo}</h3>{proc.especificacao && <p className="text-xs text-gray-600 truncate">{proc.especificacao}</p>}<p className="text-xs text-gray-500"><span title="Interessado">👤 {proc.interessado}</span> · <span title="Nível de Acesso">🌐 {proc.acesso}</span></p><p className="text-xs text-gray-400 pt-1">Criado em: {new Date(proc.criadoEm).toLocaleDateString()}</p>{proc.documentos && proc.documentos.length > 0 && (<ul className="flex flex-wrap gap-1.5 mt-1 text-xs" title="Documentos recentes">{proc.documentos.slice(0, 3).map((d) => (<li key={d.id} className="text-base">{getIcon(d.nome)}</li>))}{proc.documentos.length > 3 && <li className="text-gray-400 self-center">...</li>}</ul>)}</CardContent></Card></Link>)))}</div>
            </section>
        </div>
      </main>
    </div>
  );
}