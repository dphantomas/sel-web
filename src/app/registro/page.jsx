'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff } from 'lucide-react'

export default function RegistroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al registrarse.')
      }

      // Registro exitoso, hacer auto-login
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      })

      if (result?.error) {
        throw new Error('Cuenta creada, pero falló el inicio de sesión automático.')
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err.message)
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
            CREAR CUENTA
          </h2>
          <p className="text-[#666] text-sm mt-2 text-center">
            Únete a la plataforma LMS de Sanación en Luz
          </p>
          <div className="w-16 h-[2px] bg-[#9187BA] mt-4"></div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#33275f] uppercase tracking-wider mb-2">
                Nombre
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Juan"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9187BA] focus:border-transparent transition text-gray-800 bg-white/60"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#33275f] uppercase tracking-wider mb-2">
                Apellido
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Pérez"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9187BA] focus:border-transparent transition text-gray-800 bg-white/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#33275f] uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="tuemail@ejemplo.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9187BA] focus:border-transparent transition text-gray-800 bg-white/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#33275f] uppercase tracking-wider mb-2">
              Teléfono (WhatsApp)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+5491123456789"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9187BA] focus:border-transparent transition text-gray-800 bg-white/60"
            />
            <span className="text-[11px] text-gray-500 mt-1 block">
              Incluye código de país para poder enviarte notificaciones.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#33275f] uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
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
            <div>
              <label className="block text-xs font-semibold text-[#33275f] uppercase tracking-wider mb-2">
                Repetir Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9187BA] focus:border-transparent transition text-gray-800 bg-white/60 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#9187BA] transition"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9187BA] hover:bg-[#B681AE] text-white font-bold py-3 px-6 rounded-xl transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'REGISTRANDO...' : 'REGISTRARSE'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[#666]">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-[#33275f] font-bold hover:underline transition">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  )
}
