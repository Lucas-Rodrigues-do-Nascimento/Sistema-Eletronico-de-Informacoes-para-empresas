'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@/components/ui/breadcrumb';
import ModalEditarColaborador from '@/components/ui/ModalEditarColaborador';
import ModalExcluirColaborador from '@/components/ui/ModalExcluirColaborador';
import ModalAlterarSenha from '@/components/ui/ModalAlterarSenha';
import ModalVisualizarColaborador from '@/components/ui/ModalVisualizarColaborador';

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
  ativo: boolean;
  setor: Setor | null;
  permissao: Permissao | null;
}

export default function CadastroColaboradoresPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cargo, setCargo] = useState('');
  const [setorId, setSetorId] = useState<number | ''>('');
  const [permissaoId, setPermissaoId] = useState<number | ''>('');

  const [setores, setSetores] = useState<Setor[]>([]);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);

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

  async function fetchDados() {
    const [setoresRes, permissoesRes, colaboradoresRes] = await Promise.all([
      fetch('/api/setores'),
      fetch('/api/permissoes'),
      fetch('/api/colaboradores/listar'),
    ]);

    setSetores(await setoresRes.json());
    setPermissoes(await permissoesRes.json());
    setColaboradores(await colaboradoresRes.json());
  }

  async function handleSalvar() {
    try {
      const res = await fetch('/api/colaboradores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          senha,
          cpf: cpf.replace(/\D/g, ''),
          telefone: telefone.replace(/\D/g, ''),
          cargo,
          setorId,
          permissaoId,
        }),
      });

      if (!res.ok) throw new Error('Erro ao cadastrar colaborador');

      setNome('');
      setEmail('');
      setSenha('');
      setCpf('');
      setTelefone('');
      setCargo('');
      setSetorId('');
      setPermissaoId('');

      toast.success('✅ Colaborador cadastrado com sucesso!');
      fetchDados();
    } catch (err) {
      console.error(err);
      toast.error('❌ Erro ao cadastrar colaborador');
    }
  }

  async function handleInativar(id: number) {
    try {
      const res = await fetch(`/api/colaboradores/${id}/ativo`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      toast.success('Status alterado com sucesso.');
      fetchDados();
    } catch {
      toast.error('Erro ao alterar status.');
    }
  }

  useEffect(() => {
    fetchDados();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/cadastros">Cadastros</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">Colaboradores</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="flex gap-2">
          <Link href="/cadastros">
            <Button variant="outline">← Voltar</Button>
          </Link>
          <Link href="/controle-de-processos">
            <Button variant="ghost">🏠 Controle de Processos</Button>
          </Link>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-xl font-bold text-gray-800">👤 Cadastrar Colaborador</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Nome</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
            <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Senha</Label><Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /></div>
            <div><Label>CPF</Label><Input value={cpf} onChange={(e) => setCpf(formatarCPF(e.target.value))} placeholder="000.000.000-00" /></div>
            <div><Label>Telefone</Label><Input value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value))} placeholder="(00) 00000-0000" /></div>
            <div><Label>Cargo</Label><Input value={cargo} onChange={(e) => setCargo(e.target.value)} /></div>
            <div>
              <Label>Setor</Label>
              <select
                value={setorId}
                onChange={(e) => setSetorId(Number(e.target.value))}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">Selecione o setor</option>
                {setores.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Permissão</Label>
              <select
                value={permissaoId}
                onChange={(e) => setPermissaoId(Number(e.target.value))}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">Selecione a permissão</option>
                {permissoes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={handleSalvar}>Salvar</Button>
        </CardContent>
      </Card>

      {/* Listagem de Colaboradores */}
      <div className="mt-10">
        {setores.map((setor) => {
          const colaboradoresDoSetor = colaboradores.filter((c) => c.setor?.id === setor.id);
          if (colaboradoresDoSetor.length === 0) return null;

          return (
            <div key={setor.id} className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">👥 {setor.nome}</h2>
              <div className="space-y-2">
                {colaboradoresDoSetor.map((colab) => (
                  <div key={colab.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{colab.nome}</p>
                      <p className="text-sm text-gray-500">{colab.email} · CPF: {formatarCPF(colab.cpf)}</p>
                      <p className="text-sm text-gray-400">{colab.cargo} · <span className={colab.ativo ? 'text-green-600' : 'text-red-600'}>{colab.ativo ? 'Ativo' : 'Inativo'}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setColaboradorSelecionado(colab); setModalVisualizarAberto(true); }}>👁️ Visualizar</Button>
                      <Button size="sm" variant="outline" onClick={() => { setColaboradorSelecionado(colab); setModalEditarAberto(true); }}>✏️ Editar</Button>
                      <Button size="sm" variant={colab.ativo ? 'destructive' : 'default'} onClick={() => handleInativar(colab.id)}>{colab.ativo ? 'Inativar' : 'Ativar'}</Button>
                      <Button size="sm" variant="destructive" onClick={() => { setColaboradorSelecionado(colab); setModalExcluirAberto(true); }}>🗑️ Excluir</Button>
                      <Button size="sm" onClick={() => { setColaboradorSelecionado(colab); setModalSenhaAberto(true); }}>🔑 Senha</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modais */}
      {colaboradorSelecionado && (
        <>
          <ModalEditarColaborador
            open={modalEditarAberto}
            onClose={() => setModalEditarAberto(false)}
            colaborador={colaboradorSelecionado}
            setores={setores}
            permissoes={permissoes}
            onAtualizado={fetchDados}
          />
          <ModalExcluirColaborador
            open={modalExcluirAberto}
            onClose={() => setModalExcluirAberto(false)}
            colaboradorId={colaboradorSelecionado.id}
            colaboradorNome={colaboradorSelecionado.nome}
            onExcluido={fetchDados}
          />
          <ModalAlterarSenha
            open={modalSenhaAberto}
            onClose={() => setModalSenhaAberto(false)}
            colaboradorId={colaboradorSelecionado.id}
            onAtualizado={fetchDados}
          />
          <ModalVisualizarColaborador
            open={modalVisualizarAberto}
            onClose={() => setModalVisualizarAberto(false)}
            colaborador={colaboradorSelecionado}
          />
        </>
      )}
    </div>
  );
}
