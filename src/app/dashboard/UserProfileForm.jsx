'use client'

import { useState } from 'react'

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

    </div>
  )
}
