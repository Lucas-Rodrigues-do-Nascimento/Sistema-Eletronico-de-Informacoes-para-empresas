'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const cadastros = [
  { icon: '📁', label: 'Setores', href: '/cadastros/setores' },
  { icon: '👤', label: 'Colaboradores', href: '/cadastros/colaboradores' },
  { icon: '🧾', label: 'Tipos de Documento', href: '/cadastros/tipos-documento' },
  { icon: '📚', label: 'Tipos de Processo', href: '/cadastros/tipos-processo' },
  { icon: '📂', label: 'Classificações', href: '/cadastros/classificacoes' },
  { icon: '📌', label: 'Motivos de Arquivamento', href: '/cadastros/motivos-arquivamento' },
  { icon: '🛡️', label: 'Permissões / Níveis de Acesso', href: '/cadastros/permissoes' },
  { icon: '🏬', label: 'Unidades de Loja', href: '/cadastros/unidades-loja' },
];

export default function CadastrosPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📋 Cadastros</h1>
        <div className="flex gap-2">
          <Link href="/controle-de-processos">
            <Button variant="outline">← Voltar</Button>
          </Link>
          <Link href="/controle-de-processos">
            <Button variant="ghost">🏠 Voltar para Controle de Processos</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cadastros.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h2 className="text-lg font-semibold text-gray-800">{item.label}</h2>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
