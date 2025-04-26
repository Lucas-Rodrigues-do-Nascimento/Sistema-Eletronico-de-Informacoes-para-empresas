'use client'

import { useEffect, useState } from 'react'

interface Props {
  processoId: number
}

export default function HistoricoTramites({ processoId }: Props) {
  const [historico, setHistorico] = useState<any[]>([])
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const res = await fetch(`/api/processos/${processoId}/historico`)
        if (!res.ok) throw new Error('Erro ao buscar histórico')
        const data = await res.json()
        setHistorico(data)
        setErro(null)
      } catch (err) {
        console.error('Erro ao carregar histórico:', err)
        setErro('Erro ao carregar histórico')
      }
    }

    fetchHistorico()
  }, [processoId])

  if (erro) return <p className="text-red-600">{erro}</p>
  if (!historico.length) return <p className="text-sm text-gray-500">Nenhum trâmite encontrado.</p>

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📜 Histórico de Trâmites</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-600 border">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-4 py-2 border">De</th>
              <th className="px-4 py-2 border">Para</th>
              <th className="px-4 py-2 border">Data</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2 border">{item.de?.nome ?? '—'}</td>
                <td className="px-4 py-2 border">{item.para?.nome ?? '—'}</td>
                <td className="px-4 py-2 border">
                  {new Date(item.criadoEm).toLocaleString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
