'use client'

import { useState } from 'react'
import { startRegistration } from '@simplewebauthn/browser'

export default function UserProfileForm({ user }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        throw new Error('Error al actualizar el perfil')
      }

      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente.' })
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: 'Hubo un error al guardar los cambios.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRegisterDevice = async () => {
    setMessage(null)
    try {
      // 1. Pedir opciones de registro
      const resp = await fetch('/api/auth/webauthn/generate-registration-options')
      if (!resp.ok) throw new Error('No se pudo iniciar el registro')
      
      const options = await resp.json()

      // 2. Ejecutar registro en el dispositivo (pide huella o Face ID)
      let attResp;
      try {
        attResp = await startRegistration(options)
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          setMessage({ type: 'error', text: 'Registro cancelado.' })
          return
        }
        throw error
      }

      // 3. Verificar el registro en el servidor
      const verificationResp = await fetch('/api/auth/webauthn/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attResp),
      })

      const verification = await verificationResp.json()

      if (verification.verified) {
        setMessage({ type: 'success', text: '¡Dispositivo registrado exitosamente! Ya puedes usarlo para iniciar sesión.' })
      } else {
        setMessage({ type: 'error', text: 'Hubo un error al verificar el dispositivo.' })
      }
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: error.message || 'No se pudo registrar el dispositivo.' })
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/40 mb-8">
      <h2 className="text-[#33275f] text-xl font-bold mb-4 tracking-wide">MI PERFIL</h2>
      
      {message && (
        <div className={`p-3 rounded-xl mb-4 text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Apellido</label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (No editable)</label>
          <input
            type="email"
            disabled
            value={user.email}
            className="w-full px-4 py-2 rounded-xl border bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none"
          />
        </div>
        <div className="md:col-span-2 flex justify-end mt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#B681AE] hover:bg-[#9187BA] text-white text-sm font-bold py-2.5 px-6 rounded-xl transition duration-300 shadow-md disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>

      <div className="mt-12 pt-8 border-t border-gray-200 md:hidden">
        <h2 className="text-[#33275f] text-xl font-bold mb-4 tracking-wide flex items-center gap-2">
          SEGURIDAD Y ACCESO RÁPIDO
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Registra tu huella digital, Face ID o Windows Hello para iniciar sesión rápidamente sin necesidad de contraseña desde este dispositivo.
        </p>
        <button
          onClick={handleRegisterDevice}
          className="bg-white hover:bg-gray-50 border border-gray-300 text-[#33275f] text-sm font-bold py-2.5 px-6 rounded-xl transition duration-300 shadow-sm flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
          Añadir dispositivo actual
        </button>
      </div>
    </div>
  )
}
