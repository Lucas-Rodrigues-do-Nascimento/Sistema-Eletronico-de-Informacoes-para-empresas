// src/app/perfil/page.tsx
'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ModalAlterarSenha from '@/components/ui/ModalAlterarSenha'
import { useRouter } from 'next/navigation'

export default function PerfilPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [modalSenhaAberto, setModalSenhaAberto] = useState(false)

  if (!session?.user) return <p>Carregando sessão...</p>

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">👤 Meu Perfil</h1>
        <Button variant="outline" onClick={() => router.push('/controle-de-processos')}>
          Voltar
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={session.user.name} disabled />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={session.user.email} disabled />
          </div>
          <div>
            <Label>Setor</Label>
            <Input value={session.user.setorNome ?? '—'} disabled />
          </div>
          <div>
            <Label>Permissões</Label>
            <ul className="text-sm text-gray-600 list-disc pl-4">
              {session.user.permissoes?.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <Button onClick={() => setModalSenhaAberto(true)} variant="secondary">
            🔐 Alterar Senha
          </Button>
        </CardContent>
      </Card>

      <ModalAlterarSenha
        colaboradorId={parseInt(session.user.id)}
        open={modalSenhaAberto}
        onClose={() => setModalSenhaAberto(false)}
      />
    </div>
  )
}
