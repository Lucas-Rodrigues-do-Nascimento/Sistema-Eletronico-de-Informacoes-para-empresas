'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SelecionarSetorPage() {
  const router = useRouter()
  const [setor, setSetor] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch("/api/usuario/setor", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setor: Number(setor) }),
    });

    if (res.ok) {
      router.push("/controle-de-processos")
    } else {
      alert("Erro ao salvar setor")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-md w-full space-y-4">
        <h1 className="text-xl font-bold">Selecionar Setor</h1>
        <select
          value={setor}
          onChange={(e) => setSetor(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Selecione um setor</option>
          <option value="1">Financeiro</option>
          <option value="2">Logística</option>
          <option value="3">Compras</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Confirmar
        </button>
      </form>
    </div>
  )
}
