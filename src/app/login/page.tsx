'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ✅ Garante que só redireciona se houver sessão carregada
  useEffect(() => {
    if (
      status === 'authenticated' &&
      session?.user?.email &&
      session?.user?.id
    ) {
      router.replace('/controle-de-processos')
    }
  }, [status, session, router])

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

  if (status === 'loading') return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-100 via-white to-blue-100 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">PROTON</h1>
          <p className="text-sm text-gray-500">Processo Online de Tramitação Organizacional</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              id="username"
              type="text"
              placeholder="exemplo@email.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl text-sm shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-xl text-sm shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 hover:from-indigo-600 hover:to-purple-600 transition-all font-semibold shadow-md"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-indigo-600 hover:underline">Esqueci minha senha</a>
        </div>

        <footer className="mt-6 text-center text-xs text-gray-400">
          © 2025 Sistema PROTON. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  )
}
