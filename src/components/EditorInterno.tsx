'use client'

import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import EditorInternoToolbar from './EditorInternoToolbar'

interface EditorInternoProps {
  content: string
  onChange: (html: string) => void
}

const EditorInterno: React.FC<EditorInternoProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Escreva o conteúdo do documento aqui...'
      })
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose max-w-none outline-none min-h-[900px] px-4 py-2'
      }
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className="border rounded shadow bg-white">
      <div className="border-b p-4 text-center">
        <img src="/logo-institucional.png" alt="Logo" className="mx-auto h-20 mb-2" />
        <h2 className="text-lg font-bold">CORRÊA MATERIAIS ELÉTRICOS</h2>
        <p className="text-sm">Sistema Interno Administrativo - PROTON</p>
        <hr className="my-2 border-gray-300" />
      </div>
      {editor && <EditorInternoToolbar editor={editor} />}
      <EditorContent editor={editor} className="p-4" />
    </div>
  )
}

export default EditorInterno
