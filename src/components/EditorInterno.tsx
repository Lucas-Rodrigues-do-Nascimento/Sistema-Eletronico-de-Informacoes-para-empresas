'use client'

import { useEffect, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import EditorInternoToolbar from './EditorInternoToolbar'

interface EditorInternoProps {
  defaultContent: string
  onChange: (html: string) => void
}

const EditorInterno: React.FC<EditorInternoProps> = ({ defaultContent, onChange }) => {
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
    content: defaultContent,
    editorProps: {
      attributes: {
        class: 'prose max-w-none outline-none min-h-[900px] px-4 py-2'
      }
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border rounded shadow bg-white">
      {editor && <EditorInternoToolbar editor={editor} />}
      <EditorContent editor={editor} className="p-4" />
    </div>
  );
}

export default EditorInterno
