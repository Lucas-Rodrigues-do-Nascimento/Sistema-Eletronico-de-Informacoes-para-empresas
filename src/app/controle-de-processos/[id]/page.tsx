// src/app/controle-de-processos/[id]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import ProcessosCliente from '@/components/ProcessosCliente'
import { useEffect } from 'react'

export default function Page() {
  const params = useParams()
  const router = useRouter()

  // Garante que ID existe e é string
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      // Redireciona se o ID for inválido
      router.push('/controle-de-processos')
    }
  }, [id, router])

  if (!id || isNaN(Number(id))) {
    return <div className="p-4 text-red-600">ID de processo inválido. Redirecionando…</div>
  }

  return <ProcessosCliente processoId={id} />
}