'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@/components/ui/breadcrumb'

const modelosPredefinidos: Record<string, string> = {
  memorando: 'MEMORANDO INTERNO\n\nDe: [Remetente]\nPara: [Destinatário]\nAssunto: [Assunto]\n\nTexto...',
  requisicao: 'REQUISIÇÃO DE MATERIAL\n\nItem 1: ...\nItem 2: ...\n\nJustificativa...',
  ordem: 'ORDEM DE SERVIÇO\n\nDescrição do serviço: ...\nResponsável: ...',
  justificativa: 'JUSTIFICATIVA\n\nJustificativa para: ...',
  pagamento: 'SOLICITAÇÃO DE PAGAMENTO\n\nFornecedor: ...\nValor: ...',
  despacho: 'DESPACHO\n\nEncaminho para: ...\nAssinado por: ...',
}

export default function NovoDocumentoPage() {
  const router = useRouter()
  const routeParams = useParams()
  const query = useSearchParams()

  const [modeloParam, setModeloParam] = useState('memorando')
  const [processoId, setProcessoId] = useState('')
  const [conteudo, setConteudo] = useState('')

  // ✅ useEffect para resolver `params` e `searchParams`
  useEffect(() => {
    const id = routeParams?.id?.toString() || ''
    const modelo = query.get('modelo') || 'memorando'
    const padrao = modelosPredefinidos[modelo] || ''

    setProcessoId(id)
    setModeloParam(modelo)
    setConteudo(padrao)
  }, [routeParams, query])

  async function handleSalvar() {
    const formData = new FormData()
    formData.append('html', `<pre>${conteudo}</pre>`)
    formData.append('nome', `${modeloParam.toUpperCase()}_${Date.now()}.pdf`)
    formData.append('tipo', 'interno')

    try {
      const res = await fetch(`/api/processos/${processoId}/documentos`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Erro ao criar documento')

      toast.success('📄 Documento interno criado!')
      router.push(`/controle-de-processos/${processoId}`)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar documento')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/controle-de-processos">Controle de Processos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/controle-de-processos/${processoId}`}>Detalhes do Processo</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">Novo Documento</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>← Voltar</Button>
          <Button variant="ghost" onClick={() => router.push('/controle-de-processos')}>🏠 Controle de Processos</Button>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-xl font-bold mb-4">
            📝 Criar Documento Interno - {modeloParam.toUpperCase()}
          </h1>

          <Textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={20}
            className="w-full border rounded p-2 font-mono text-sm"
          />

          <Button onClick={handleSalvar}>Salvar como PDF</Button>
        </CardContent>
      </Card>
    </div>
  )
}
