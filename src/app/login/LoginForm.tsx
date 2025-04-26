'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'

export default function LoginForm() {
  const { data: session } = useSession()
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      router.push('/controle-de-processos')
    }
  }, [session, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      redirect: false,
      email: username,
      senha: password,
    })

    if (res?.ok) {
      router.push('/controle-de-processos')
    } else {
      setError('Credenciais inválidas ou erro ao autenticar.')
    }

    setLoading(false)
  }

  return (
    // ... mesma interface HTML aqui (copiar do anterior)
    // pode deixar só <form> se quiser testar primeiro
    <form onSubmit={handleLogin}>
      {/* campos... */}
    </form>
  )
}
