'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error')
      }

      setMessage({ type: 'success', text: data.message })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center" style={{ backgroundImage: "url('/assets/fondo-quienes.jpg')" }}>
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>
      
      <div className="relative z-10 max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/40">
        <div className="text-center">
          <Link href="/">
            <img className="mx-auto h-12 w-auto" src="/assets/logo-sel.png" alt="Sanación en Luz" style={{ filter: 'brightness(0) invert(0)' }} />
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-[#33275f]">Recuperar Contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className={`p-3 rounded-xl text-sm font-bold text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div>
            <label htmlFor="email" className="sr-only">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#9187BA] focus:border-[#9187BA] focus:z-10 sm:text-sm"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#B681AE] hover:bg-[#9187BA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B681AE] transition disabled:opacity-50"
            >
              {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <Link href="/login" className="font-bold text-sm text-[#9187BA] hover:text-[#33275f]">
              Volver al Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
