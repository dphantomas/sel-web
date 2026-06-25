'use client'

import { useState, useRef } from 'react'
import { UploadCloud, User as UserIcon, Fingerprint, Shield, Trash2, Plus, CheckCircle, Loader2 } from 'lucide-react'
import ImageCropperModal from '@/components/ImageCropperModal'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { startRegistration, platformAuthenticatorIsAvailable } from '@simplewebauthn/browser'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convierte credentialDeviceType + credentialBackedUp a un label amigable */
function getDeviceLabel(auth) {
  if (auth.credentialBackedUp) return 'Passkey sincronizada'
  if (auth.credentialDeviceType === 'platform') return 'Dispositivo local'
  return 'Llave de seguridad'
}

/** Formatea fecha a DD/MM/YYYY */
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ─── Sub-componente: Gestión Biométrica ───────────────────────────────────────

function BiometricSection({ initialAuthenticators }) {
  const [authenticators, setAuthenticators] = useState(initialAuthenticators || [])
  const [isRegistering, setIsRegistering] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [message, setMessage] = useState(null)
  const [isSupported, setIsSupported] = useState(null) // null = sin detectar aún

  // Detectar soporte biométrico al montar
  useState(() => {
    platformAuthenticatorIsAvailable()
      .then(setIsSupported)
      .catch(() => setIsSupported(false))
  })

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleRegisterDevice = async () => {
    setIsRegistering(true)
    setMessage(null)

    try {
      const resp = await fetch('/api/auth/webauthn/generate-registration-options')
      if (!resp.ok) {
        const data = await resp.json()
        throw new Error(data.error || 'No se pudo iniciar el registro')
      }
      const options = await resp.json()

      let attResp
      try {
        attResp = await startRegistration({ optionsJSON: options })
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          setIsRegistering(false)
          return
        }
        throw err
      }

      const verificationResp = await fetch('/api/auth/webauthn/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attResp),
      })

      const verification = await verificationResp.json()

      if (!verificationResp.ok) {
        throw new Error(verification.error || 'Error al verificar el dispositivo.')
      }

      if (verification.verified) {
        // Marcar en localStorage para que el login detecte el dispositivo
        localStorage.setItem('device_registered', 'true')
        const emailResp = await fetch('/api/auth/webauthn/list-authenticators')
        if (emailResp.ok) {
          const data = await emailResp.json()
          setAuthenticators(data.authenticators)
        }
        showMessage('success', '¡Dispositivo registrado! Ahora podés iniciar sesión con biometría.')
      } else {
        throw new Error('La verificación del dispositivo falló.')
      }
    } catch (err) {
      console.error('Error registrando dispositivo:', err)
      showMessage('error', err.message || 'Error al registrar el dispositivo.')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleDeleteDevice = async (credentialID) => {
    if (!confirm('¿Eliminás este dispositivo biométrico? Tendrás que volver a configurarlo si querés usarlo de nuevo.')) return

    setDeletingId(credentialID)

    try {
      const resp = await fetch('/api/auth/webauthn/delete-authenticator', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialID }),
      })

      if (!resp.ok) {
        const data = await resp.json()
        throw new Error(data.error || 'Error al eliminar el dispositivo.')
      }

      const updated = authenticators.filter(a => a.credentialID !== credentialID)
      setAuthenticators(updated)

      // Si no quedan dispositivos, limpiar localStorage
      if (updated.length === 0) {
        localStorage.removeItem('device_registered')
        localStorage.removeItem('registered_email')
      }

      showMessage('success', 'Dispositivo eliminado correctamente.')
    } catch (err) {
      console.error('Error eliminando dispositivo:', err)
      showMessage('error', err.message || 'Error al eliminar el dispositivo.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="md:col-span-2 mt-2">
      {/* Header de sección */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
        <Shield className="w-4 h-4 text-[#9187BA]" />
        <h3 className="text-sm font-bold text-[#33275f]">Seguridad — Acceso Biométrico</h3>
      </div>

      {/* Mensaje de feedback */}
      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Lista de dispositivos registrados */}
      {authenticators.length > 0 ? (
        <div className="space-y-2 mb-4">
          {authenticators.map((auth) => (
            <div
              key={auth.credentialID}
              className="flex items-center justify-between gap-3 p-3.5 bg-gray-50/70 rounded-xl border border-gray-100"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#9187BA]/10 flex items-center justify-center shrink-0">
                  <Fingerprint className="w-4 h-4 text-[#9187BA]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {getDeviceLabel(auth)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Registrado el {formatDate(auth.createdAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteDevice(auth.credentialID)}
                disabled={!!deletingId}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40"
                aria-label="Eliminar dispositivo"
              >
                {deletingId === auth.credentialID ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 mb-4">
          <Fingerprint className="w-5 h-5 text-gray-300 shrink-0" />
          <p className="text-sm text-gray-400">
            No tenés ningún dispositivo biométrico configurado.
          </p>
        </div>
      )}

      {/* Botón para agregar dispositivo */}
      {isSupported !== false && (
        <button
          id="add-biometric-device-btn"
          type="button"
          onClick={handleRegisterDevice}
          disabled={isRegistering}
          className="flex items-center gap-2 text-sm font-semibold text-[#9187BA] hover:text-[#33275f] border border-[#9187BA]/30 hover:border-[#33275f]/40 hover:bg-[#9187BA]/5 px-4 py-2.5 rounded-xl transition duration-200 disabled:opacity-50"
        >
          {isRegistering ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {isRegistering ? 'Configurando dispositivo...' : 'Agregar este dispositivo'}
        </button>
      )}

      {isSupported === false && (
        <p className="text-xs text-gray-400 italic">
          Tu dispositivo o navegador actual no soporta autenticación biométrica.
        </p>
      )}
    </div>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function UserProfileForm({ user, authenticators, hasInitiatoryRetreat }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || '',
    addressLine1: user.addressLine1 || '',
    addressLine2: user.addressLine2 || '',
    zipCode: user.zipCode || '',
    country: user.country || '',
    sparkName: user.sparkName || ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState(null)
  
  const router = useRouter()
  const { update } = useSession()
  const editFileInputRef = useRef(null)
  const [editImagePreview, setEditImagePreview] = useState(user.image || null)
  const [cropModalImage, setCropModalImage] = useState(null)
  const [croppedImageBlob, setCroppedImageBlob] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setCropModalImage(reader.result)
      reader.readAsDataURL(file)
    } else {
      setEditImagePreview(user.image || null)
      setCroppedImageBlob(null)
    }
    setRemoveImage(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const formPayload = new FormData()
      formPayload.append('firstName', formData.firstName)
      formPayload.append('lastName', formData.lastName)
      formPayload.append('phone', formData.phone)
      formPayload.append('addressLine1', formData.addressLine1)
      formPayload.append('addressLine2', formData.addressLine2)
      formPayload.append('zipCode', formData.zipCode)
      formPayload.append('country', formData.country)
      formPayload.append('sparkName', formData.sparkName)
      if (croppedImageBlob) {
        formPayload.append('image', croppedImageBlob, 'profile.jpg')
      } else if (removeImage) {
        formPayload.append('removeImage', 'true')
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formPayload
      })

      if (!res.ok) {
        throw new Error('Error al actualizar el perfil')
      }

      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente.' })
      
      // Actualizar sesión para reflejar el nuevo nombre/imagen en la Navbar
      await update()
      router.refresh()
      
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: 'Hubo un error al guardar los cambios.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/40 mb-8">
      
      {cropModalImage && (
        <ImageCropperModal
          imageSrc={cropModalImage}
          onCropComplete={(blob) => {
            setCroppedImageBlob(blob)
            setEditImagePreview(URL.createObjectURL(blob))
            setCropModalImage(null)
          }}
          onCancel={() => {
            setCropModalImage(null)
            if (editFileInputRef.current) editFileInputRef.current.value = ''
          }}
        />
      )}

      <h2 className="text-[#33275f] text-xl font-bold mb-4 tracking-wide">MI PERFIL</h2>
      
      {message && (
        <div className={`p-3 rounded-xl mb-4 text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Foto de Perfil */}
        <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 mb-2">
          <div className="relative w-24 h-24 shrink-0 rounded-full border-4 border-[#B681AE]/20 bg-white overflow-hidden flex items-center justify-center group">
            {editImagePreview ? (
              <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10 text-gray-300" />
            )}
            
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <UploadCloud className="w-6 h-6 text-white" />
            </div>
            
            <input 
              ref={editFileInputRef}
              type="file" 
              name="image" 
              accept="image/*" 
              onChange={handleEditImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
          </div>
          <div className="text-center sm:text-left">
            <span className="text-lg font-bold text-[#33275f] block mb-1">Foto de Perfil</span>
            <p className="text-sm text-gray-500 mb-2">Hacé clic en la imagen para cambiar tu foto.</p>
            {editImagePreview && (
              <button
                type="button"
                onClick={() => {
                  setEditImagePreview(null)
                  setCroppedImageBlob(null)
                  setRemoveImage(true)
                  if (editFileInputRef.current) editFileInputRef.current.value = ''
                }}
                className="text-xs text-red-500 font-bold hover:underline"
              >
                Eliminar foto
              </button>
            )}
          </div>
        </div>

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
        {(hasInitiatoryRetreat || user.sparkName) && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de Chispa (Opcional)</label>
            <input
              type="text"
              value={formData.sparkName}
              onChange={(e) => setFormData({ ...formData, sparkName: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none"
            />
          </div>
        )}
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
        <div className="md:col-span-2 mt-2">
          <h3 className="text-sm font-bold text-[#33275f] border-b pb-1">Datos Adicionales</h3>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">País</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dirección (Línea 1)</label>
          <input
            type="text"
            value={formData.addressLine1}
            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dirección (Línea 2) (Opcional)</label>
          <input
            type="text"
            value={formData.addressLine2}
            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Código Postal</label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            className="w-full px-4 py-2 rounded-xl border focus:border-[#9187BA] focus:ring-1 focus:ring-[#9187BA] outline-none"
          />
        </div>

        {/* ── Sección Biométrica ── */}
        <BiometricSection initialAuthenticators={authenticators} />

        <div className="md:col-span-2 flex justify-end mt-4">
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
