'use client'

import { Editor } from '@tiptap/react'
import {
  Bold, Italic, Underline, AlignLeft,
  AlignCenter, AlignRight
} from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface Props {
  editor: Editor | null
}

export default function EditorInternoToolbar({ editor }: Props) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-gray-50">
      <ToggleGroup type="multiple" className="gap-1">
        <ToggleGroupItem
          value="bold"
          aria-label="Negrito"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-state={editor.isActive('bold') ? 'on' : 'off'}
        >
          <Bold className="w-4 h-4" />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="italic"
          aria-label="Itálico"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-state={editor.isActive('italic') ? 'on' : 'off'}
        >
          <Italic className="w-4 h-4" />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="underline"
          aria-label="Sublinhado"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          data-state={editor.isActive('underline') ? 'on' : 'off'}
        >
          <Underline className="w-4 h-4" />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="left"
          aria-label="Alinhar à esquerda"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          data-state={editor.isActive({ textAlign: 'left' }) ? 'on' : 'off'}
        >
          <AlignLeft className="w-4 h-4" />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="center"
          aria-label="Centralizar"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          data-state={editor.isActive({ textAlign: 'center' }) ? 'on' : 'off'}
        >
          <AlignCenter className="w-4 h-4" />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="right"
          aria-label="Alinhar à direita"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          data-state={editor.isActive({ textAlign: 'right' }) ? 'on' : 'off'}
        >
          <AlignRight className="w-4 h-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
