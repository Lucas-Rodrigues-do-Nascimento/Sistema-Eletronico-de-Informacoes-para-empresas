'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

interface Props {
  processoId: number
  onClose?: () => void
  onSuccess?: (docId: number) => void
}

export default function UploadDocumentoExterno({ processoId, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [arquivo, setArquivo] = useState<File | null>(null)

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    if (!arquivo || !titulo.trim()) {
      alert("Preencha o título e selecione um arquivo.")
      setSubmitting(false)
      return
    }

    const formData = new FormData()
    formData.append("file", arquivo)
    formData.append("tipo", "externo")
    formData.append("nome", titulo.trim())

    const res = await fetch(`/api/processos/${processoId}/documentos`, {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      const doc = await res.json()
      if (onSuccess) onSuccess(doc.id)
      if (onClose) onClose()
    } else {
      alert("Erro ao enviar documento")
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-3 p-4 border rounded bg-white shadow max-w-md">
      <Input
        type="text"
        name="nome"
        placeholder="Título do documento"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
      />

      <div className="flex items-center gap-2">
        <Label htmlFor="arquivo" className="w-full">
          <div className="flex justify-between items-center bg-gray-50 border px-3 py-2 rounded cursor-pointer hover:bg-gray-100">
            <span className="truncate text-sm">
              {arquivo ? arquivo.name : "Escolher arquivo"}
            </span>
            <Upload className="w-4 h-4 opacity-70" />
          </div>
        </Label>
        <Input
          id="arquivo"
          name="arquivo"
          type="file"
          className="hidden"
          onChange={(e) => setArquivo(e.target.files?.[0] || null)}
          required
        />
      </div>

      <Button type="submit" variant="default" disabled={submitting}>
        {submitting ? "Enviando..." : "Enviar"}
      </Button>
    </form>
  )
}
