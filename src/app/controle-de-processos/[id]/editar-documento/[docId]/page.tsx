'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import EditorInterno from '@/components/EditorInterno'

export const dynamic = 'force-dynamic'

export default function EditDocumentoPage() {
  const router = useRouter()
  const params = useParams<{ id: string; docId: string }>()

  const [conteudo, setConteudo] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [documentoId, setDocumentoId] = useState<number | null>(null)

  const cabecalhoHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="/logo-institucional.png" alt="Logo" style="height: 80px; margin-bottom: 8px;" />
      <h2 style="margin: 0; font-size: 18px;">CORRÊA MATERIAIS ELÉTRICOS</h2>
      <p style="margin: 0; font-size: 14px;">Sistema Interno Administrativo - PROTON</p>
      <hr style="margin-top: 10px; border: 1px solid #ccc;" />
    </div>
  `

  useEffect(() => {
    const buscarDocumento = async () => {
      const res = await fetch(`/api/documentos/${params.docId}`)
      if (!res.ok) {
        router.push('/404')
        return
      }
      const data = await res.json()
      if (data.tipo !== 'interno') {
        router.push('/404')
        return
      }

      let conteudoComCabecalho = data.conteudoHtml || ''
      if (!conteudoComCabecalho.includes('/logo-institucional.png')) {
        conteudoComCabecalho = cabecalhoHTML + conteudoComCabecalho
      }

      setConteudo(conteudoComCabecalho)
      setDocumentoId(data.id)
      setCarregando(false)
    }
    buscarDocumento()
  }, [params.docId, router])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!documentoId) return

    try {
      const res = await fetch(`/api/documento/${documentoId}/editar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudoHtml: conteudo }),
      })

      if (res.ok) {
        // Força atualização da tela anterior com novo PDF gerado
        if (window.opener) {
          window.opener.location.reload()
        }
        window.close()
      } else {
        const errorData = await res.json()
        alert(errorData?.error || 'Erro ao salvar documento')
      }
    } catch (err: any) {
      console.error('Erro ao salvar documento:', err)
      alert(err.message || 'Erro ao salvar documento')
    }
  }

  if (carregando) return <p className="p-4">Carregando documento...</p>

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center py-6 px-2">
      <form onSubmit={salvar} className="space-y-4 w-full max-w-[850px]">
        <h1 className="text-2xl font-bold text-center">Edição de Documento Interno</h1>
        <EditorInterno content={conteudo} onChange={setConteudo} />
        <div className="flex justify-center gap-4">
          <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
            Salvar e Fechar
          </Button>
          <Button type="button" variant="outline" onClick={() => window.close()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
