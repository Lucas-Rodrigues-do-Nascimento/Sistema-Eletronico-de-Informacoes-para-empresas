import { useState, useEffect } from 'react'

interface Colaborador {
  id: number
  nome: string
}

interface SelectColaboradorProps {
  value: number | null
  onChange: (id: number | null) => void
  placeholder?: string
}

export default function SelectColaborador({ value, onChange, placeholder = 'Selecione' }: SelectColaboradorProps) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchColaboradores() {
      setLoading(true)
      try {
        const res = await fetch('/api/colaboradores/listar')
        if (!res.ok) throw new Error('Erro ao buscar colaboradores')
        const data: Colaborador[] = await res.json()
        setColaboradores(data)
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchColaboradores()
  }, [])

  if (error) return <div className="text-red-600 text-sm">{error}</div>

  return (
    <select
      className="border rounded p-2 bg-white"
      value={value ?? ''}
      onChange={e => {
        const val = e.target.value
        onChange(val ? Number(val) : null)
      }}
    >
      <option value="" disabled>{placeholder}</option>
      {loading ? (
        <option value="" disabled>Carregando...</option>
      ) : (
        colaboradores.map(c => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))
      )}
    </select>
  )
}
