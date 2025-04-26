'use client'

import { Button } from '@/components/ui/button'

interface BotaoEditarDocumentoProps {
  processoId: number
  documentoId: number
}

export default function BotaoEditarDocumento({
  processoId,
  documentoId,
}: BotaoEditarDocumentoProps) {
  const url = `/controle-de-processos/${processoId}/editar-documento/${documentoId}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block"
    >
      <Button variant="outline">Editar Documento</Button>
    </a>
  )
}
