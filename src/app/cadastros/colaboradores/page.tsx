// Refatorado: src/app/cadastros/colaboradores/page.tsx
'use client';

import { useEffect, useState, ChangeEvent } from 'react';
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
  permissoes: Permissao[];
}

export default function CadastroColaboradoresPage() {
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', cpf: '', telefone: '', cargo: '', setorId: '', permissoes: [] as number[],
  });
  const [busca, setBusca] = useState('');
  const [setores, setSetores] = useState<Setor[]>([]);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(null);
  const [modal, setModal] = useState({ editar: false, excluir: false, senha: false, visualizar: false });

  useEffect(() => { fetchDados(); }, []);

  async function fetchDados() {
    try {
      const [setoresRes, permissoesRes, colaboradoresRes] = await Promise.all([
        fetch('/api/setores'),
        fetch('/api/permissoes'),
        fetch('/api/colaboradores/listar'),
      ]);
      setSetores(await setoresRes.json());
      setPermissoes(await permissoesRes.json());
      setColaboradores(await colaboradoresRes.json());
    } catch { toast.error('Erro ao carregar dados'); }
  }

  async function handleSalvar() {
    const { nome, email, senha, cpf, telefone, cargo, setorId, permissoes } = form;
    try {
      const res = await fetch('/api/colaboradores', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome, email, senha,
          cpf: cpf.replace(/\D/g, ''), telefone: telefone.replace(/\D/g, ''), cargo,
          setorId: setorId ? Number(setorId) : null, permissoes,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('✅ Colaborador cadastrado com sucesso!');
      setForm({ nome: '', email: '', senha: '', cpf: '', telefone: '', cargo: '', setorId: '', permissoes: [] });
      fetchDados();
    } catch { toast.error('❌ Erro ao cadastrar colaborador'); }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePermissoesChange(e: ChangeEvent<HTMLSelectElement>) {
    const selected = Array.from(e.target.selectedOptions).map((opt) => Number(opt.value));
    setForm((prev) => ({ ...prev, permissoes: selected }));
  }

  function formatarCPF(cpf: string) {
    return cpf.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function formatarTelefone(tel: string) {
    return tel.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{4})$/, '$1-$2');
  }

  async function handleInativar(id: number) {
    try {
      const res = await fetch(`/api/colaboradores/${id}/ativo`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      toast.success('Status alterado com sucesso');
      fetchDados();
    } catch { toast.error('Erro ao alterar status'); }
  }

  const colaboradoresFiltrados = colaboradores.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.email.toLowerCase().includes(busca.toLowerCase())
  );

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
          <Link href="/cadastros"><Button variant="outline">← Voltar</Button></Link>
          <Link href="/controle-de-processos"><Button variant="ghost">🏠 Controle de Processos</Button></Link>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-xl font-bold text-gray-800">👤 Cadastrar Colaborador</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['nome', 'email', 'senha', 'cargo'].map((field) => (
              <div key={field}><Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                <Input name={field} value={(form as any)[field]} onChange={handleChange} type={field === 'senha' ? 'password' : 'text'} />
              </div>
            ))}
            <div><Label>CPF</Label><Input name="cpf" value={form.cpf} onChange={(e) => setForm(f => ({ ...f, cpf: formatarCPF(e.target.value) }))} /></div>
            <div><Label>Telefone</Label><Input name="telefone" value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: formatarTelefone(e.target.value) }))} /></div>
            <div>
              <Label>Setor</Label>
              <select name="setorId" value={form.setorId} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm">
                <option value="">Selecione o setor</option>
                {setores.map((s) => (<option key={s.id} value={s.id}>{s.nome}</option>))}
              </select>
            </div>
            <div>
              <Label>Permissões</Label>
              <select multiple value={form.permissoes.map(String)} onChange={handlePermissoesChange} className="w-full border rounded px-3 py-2 text-sm">
                {permissoes.map((p) => (<option key={p.id} value={p.id}>{p.nome}</option>))}
              </select>
              <small className="text-xs text-gray-500">Segure Ctrl ou Cmd para múltiplas</small>
            </div>
          </div>
          <Button onClick={handleSalvar}>Salvar</Button>
        </CardContent>
      </Card>

      <div className="max-w-2xl mx-auto">
        <Label className="block mb-1">🔎 Buscar colaborador</Label>
        <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite o nome ou e-mail para filtrar..." />
      </div>

      {busca ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">🔍 Resultados da busca</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colaboradoresFiltrados.map((colab) => (
              <Card key={colab.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="font-bold">{colab.nome}</div>
                  <div className="text-sm text-gray-600">{colab.email}</div>
                  <div className="text-sm">Cargo: {colab.cargo}</div>
                  <div className="text-sm">CPF: {formatarCPF(colab.cpf)}</div>
                  <div className="text-sm">Telefone: {formatarTelefone(colab.telefone)}</div>
                  <div className="text-sm">Status: {colab.ativo ? 'Ativo' : 'Inativo'}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => { setColaboradorSelecionado(colab); setModal(p => ({ ...p, editar: true })); }}>Editar</Button>
                    <Button size="sm" variant="outline" onClick={() => { setColaboradorSelecionado(colab); setModal(p => ({ ...p, senha: true })); }}>Alterar Senha</Button>
                    <Button size="sm" variant="outline" onClick={() => { setColaboradorSelecionado(colab); setModal(p => ({ ...p, visualizar: true })); }}>Visualizar</Button>
                    <Button size="sm" variant="destructive" onClick={() => { setColaboradorSelecionado(colab); setModal(p => ({ ...p, excluir: true })); }}>Excluir</Button>
                    <Button size="sm" variant="secondary" onClick={() => handleInativar(colab.id)}>{colab.ativo ? 'Inativar' : 'Ativar'}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        setores.map((setor) => {
          const colaboradoresDoSetor = colaboradores.filter((c) => c.setor?.id === setor.id);
          if (colaboradoresDoSetor.length === 0) return null;
          return (
            <div key={setor.id} className="mt-8">
              <h2 className="text-lg font-semibold mb-4">{setor.nome}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {colaboradoresDoSetor.map((colab) => (
                  <Card key={colab.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="font-bold">{colab.nome}</div>
                      <div className="text-sm text-gray-600">{colab.email}</div>
                      <div className="text-sm">Cargo: {colab.cargo}</div>
                      <div className="text-sm">CPF: {formatarCPF(colab.cpf)}</div>
                      <div className="text-sm">Telefone: {formatarTelefone(colab.telefone)}</div>
                      <div className="text-sm">Status: {colab.ativo ? 'Ativo' : 'Inativo'}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => { setColaboradorSelecionado(colab); setModal(p => ({ ...p, editar: true })); }}>Editar</Button>
                        <Button size="sm" variant="outline" onClick={() => { setColaboradorSelecionado(colab); setModal(p => ({ ...p, senha: true })); }}>Alterar Senha</Button>
                        <Button size="sm" variant="outline" onClick={() => { setColaboradorSelecionado(colab); setModal(p => ({ ...p, visualizar: true })); }}>Visualizar</Button>
                        <Button size="sm" variant="destructive" onClick={() => { setColaboradorSelecionado(colab); setModal(p => ({ ...p, excluir: true })); }}>Excluir</Button>
                        <Button size="sm" variant="secondary" onClick={() => handleInativar(colab.id)}>{colab.ativo ? 'Inativar' : 'Ativar'}</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}

      {colaboradorSelecionado && (
        <>
          <ModalEditarColaborador colaborador={colaboradorSelecionado} open={modal.editar} setores={setores} permissoes={permissoes} onClose={() => setModal(p => ({ ...p, editar: false }))} onAtualizado={fetchDados} />
          <ModalExcluirColaborador colaboradorId={colaboradorSelecionado.id} colaboradorNome={colaboradorSelecionado.nome} open={modal.excluir} onClose={() => setModal(p => ({ ...p, excluir: false }))} onExcluido={fetchDados} />
          <ModalAlterarSenha colaboradorId={colaboradorSelecionado.id} open={modal.senha} onClose={() => setModal(p => ({ ...p, senha: false }))} />
          <ModalVisualizarColaborador colaborador={colaboradorSelecionado} open={modal.visualizar} onClose={() => setModal(p => ({ ...p, visualizar: false }))} />
        </>
      )}
    </div>
  );
}
