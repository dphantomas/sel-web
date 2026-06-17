'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { startAuthentication, platformAuthenticatorIsAvailable } from '@simplewebauthn/browser'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [supportsBiometrics, setSupportsBiometrics] = useState(false)
  const [isDeviceRegistered, setIsDeviceRegistered] = useState(false)
  const [autoTriggered, setAutoTriggered] = useState(false)

  useEffect(() => {
    platformAuthenticatorIsAvailable().then(setSupportsBiometrics)
    
    // Check if device is registered for auto-login
    const registered = localStorage.getItem('device_registered')
    const savedEmail = localStorage.getItem('registered_email')
    
    if (registered === 'true') {
      setIsDeviceRegistered(true)
      if (savedEmail && !autoTriggered) {
        setEmail(savedEmail)
        setAutoTriggered(true)
        // Agregamos un pequeño delay para asegurar que el usuario vea la UI antes de que el navegador bloquee la pantalla con Face ID
        setTimeout(() => {
          handleBiometricLogin(savedEmail)
        }, 500)
      }
    }
  }, [autoTriggered])

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('¡Registro completado con éxito! Por favor inicia sesión.')
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      })

      if (result?.error) {
        throw new Error(result.error || 'Credenciales incorrectas.')
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricLogin = async (emailToUse = email) => {
    if (!emailToUse) {
      setError('Por favor, ingresa tu correo electrónico primero para identificar tu cuenta.')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // 1. Obtener opciones de autenticación
      const resp = await fetch('/api/auth/webauthn/generate-authentication-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse })
      })

      if (!resp.ok) {
        const errorData = await resp.json()
        throw new Error(errorData.error || 'No se pudieron obtener las opciones de inicio de sesión.')
      }

      const options = await resp.json()

      // 2. Pedir la huella o Face ID al dispositivo
      let asseResp;
      try {
        asseResp = await startAuthentication(options)
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          throw new Error('Inicio de sesión cancelado.')
        }
        throw err
      }

      // 3. Enviar al provider de credenciales
      const result = await signIn('credentials', {
        redirect: false,
        email: emailToUse,
        assertion: JSON.stringify(asseResp)
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err.message || 'Error en el inicio de sesión biométrico.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed px-4 py-12"
      style={{ backgroundImage: "url('/assets/fondo-quienes.jpg')" }}
    >
      <div className="absolute inset-0 bg-[#33275f]/40 backdrop-blur-[2px]"></div>

      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.25)] border border-white/20">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-[#33275f] text-2xl md:text-3xl font-extrabold tracking-wide text-center">
            INICIAR SESIÓN
          </h2>
          <p className="text-[#666] text-sm mt-2 text-center">
            Ingresa a tu espacio de Sanación en Luz
          </p>
          <div className="w-16 h-[2px] bg-[#9187BA] mt-4"></div>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => {
              setLoading(true)
              signIn('google', { callbackUrl: '/' })
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl transition duration-300 shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 24c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 21.53 7.7 24 12 24z" />
              <path fill="#FBBC05" d="M5.84 15.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V8.06H2.18C1.43 9.55 1 11.22 1 13s.43 3.45 1.18 4.94l3.66-2.84z" />
              <path fill="#EA4335" d="M12 4.63c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.18 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O ingresa con tu correo</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#33275f] uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tuemail@ejemplo.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9187BA] focus:border-transparent transition text-gray-800 bg-white/60"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-[#33275f] uppercase tracking-wider">
                Contraseña
              </label>
              <Link href="/olvide-contrasena" className="text-xs text-[#9187BA] font-bold hover:underline transition">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9187BA] focus:border-transparent transition text-gray-800 bg-white/60 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#9187BA] transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9187BA] hover:bg-[#B681AE] text-white font-bold py-3 px-6 rounded-xl transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
            </button>

            {supportsBiometrics && !isDeviceRegistered && (
              <button
                type="button"
                onClick={() => handleBiometricLogin()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#33275f] font-bold py-3 px-6 rounded-xl border border-[#9187BA] transition duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
                Ingresar con Huella / Face ID
              </button>
            )}
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-[#666]">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/registro" className="text-[#33275f] font-bold hover:underline transition">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#33275f] text-white">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  )
}
