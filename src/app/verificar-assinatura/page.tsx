'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function VerificarAssinaturaPage() {
  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState<any | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const handleVerificar = async () => {
    setErro(null)
    setResultado(null)
    try {
      const res = await fetch(`/api/documentos/${codigo}/acoes/verificar`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao verificar assinatura.')
      }
      setResultado(data)
    } catch (err: any) {
      setErro(err.message)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold">🔍 Verificar Assinatura de Documento</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Input
            placeholder="Digite o código de verificação"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          />
          <Button onClick={handleVerificar}>Verificar</Button>
        </CardContent>
      </Card>

      {erro && (
        <div className="bg-red-100 text-red-700 p-3 rounded border border-red-300">
          ❌ {erro}
        </div>
      )}

      {resultado && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <p>
              <strong>Status:</strong>{' '}
              {resultado.valido ? (
                <span className="text-green-600">✅ Válido</span>
              ) : (
                <span className="text-red-600">❌ Inválido</span>
              )}
            </p>
            <p>
              <strong>Hash Atual:</strong> {resultado.hashAtual}
            </p>
            <p>
              <strong>Hash Registrado:</strong> {resultado.hashRegistrado}
            </p>
            <p className={resultado.valido ? 'text-green-600' : 'text-red-600'}>
              {resultado.mensagem}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="pt-4">
        <Link href="/controle-de-processos">
          <Button variant="outline">← Voltar para Controle de Processos</Button>
        </Link>
      </div>
    </div>
  )
}
