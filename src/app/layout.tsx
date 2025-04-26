import './globals.css'
import { ReactNode } from 'react'
import SessionWrapper from '@/components/SessionWrapper'
import { Toaster } from 'sonner'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SessionWrapper>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </SessionWrapper>
      </body>
    </html>
  )
}
