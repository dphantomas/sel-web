'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import { createUser } from './actions'
import Link from 'next/link'
import { UploadCloud, User, X } from 'lucide-react'

export default function NewUserPage() {
  const [state, formAction, pending] = useActionState(createUser, { success: false, error: null, message: null })
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)

  // Limpiar la foto si el formulario fue exitoso y hacer scroll hacia arriba
  useEffect(() => {
    if (state?.success) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [state?.success])

  useEffect(() => {
    if (state?.error) {
      setIsErrorModalOpen(true)
    }
  }, [state?.timestamp, state?.error])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isErrorModalOpen) {
        setIsErrorModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isErrorModalOpen])

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Navegación */}
        <div className="mb-6">
          <Link href="/admin" className="text-sm font-bold text-[#33275f] hover:text-[#9187BA] transition flex items-center gap-1 w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Volver al Panel
          </Link>
        </div>

        {/* Encabezado */}
        <div className="bg-white rounded-t-2xl p-6 md:p-8 shadow-sm border border-gray-100 border-b-0">
          <h1 className="text-[#33275f] text-2xl md:text-3xl font-extrabold tracking-wide">
            ALTA DE NUEVO USUARIO
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Completa los datos para registrar a una nueva persona en la plataforma.
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-b-2xl p-6 md:p-8 shadow-sm border border-gray-100">

          {state?.success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-100">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-8">
            
            {/* Sección 1: Datos de la Cuenta (Email & Password) - Arriba de todo para el AutoFocus del navegador */}
            <div>
              <h3 className="text-lg font-bold text-[#33275f] mb-4">Datos de Acceso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Correo Electrónico *</label>
                  <input autoFocus defaultValue={state?.fields?.email || ''} required type="email" name="email" className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#B681AE] focus:border-transparent transition-all outline-none" placeholder="correo@ejemplo.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Contraseña Provisoria *</label>
                  <input required type="password" name="password" className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#B681AE] focus:border-transparent transition-all outline-none" placeholder="Mínimo 6 caracteres" />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Foto de Perfil */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className="relative w-32 h-32 shrink-0 rounded-full border-4 border-[#B681AE]/20 bg-white overflow-hidden flex items-center justify-center group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-300" />
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <UploadCloud className="w-6 h-6 text-white" />
                </div>
                
                <input 
                  ref={fileInputRef}
                  type="file" 
                  name="image" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  title="Subir foto"
                />
              </div>
              <div className="text-center sm:text-left">
                <span className="text-lg font-bold text-[#33275f] block mb-1">Foto de Perfil</span>
                <p className="text-sm text-gray-500">Haz clic en el círculo para subir una imagen desde tu computadora. Este paso es opcional.</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Sección 2: Datos Personales */}
            <div>
              <h3 className="text-lg font-bold text-[#33275f] mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Nombre *</label>
                  <input defaultValue={state?.fields?.firstName || ''} required type="text" name="firstName" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#B681AE] focus:border-transparent transition-all outline-none" placeholder="Ej: María" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Apellido *</label>
                  <input defaultValue={state?.fields?.lastName || ''} required type="text" name="lastName" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#B681AE] focus:border-transparent transition-all outline-none" placeholder="Ej: Pérez" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Nombre de su Chispa</label>
                  <input defaultValue={state?.fields?.sparkName || ''} type="text" name="sparkName" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#B681AE] focus:border-transparent transition-all outline-none" placeholder="Opcional" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Celular / WhatsApp</label>
                  <input defaultValue={state?.fields?.phone || ''} type="text" name="phone" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#B681AE] focus:border-transparent transition-all outline-none" placeholder="+54 9 11 1234-5678" />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Sección 3: Residencia */}
            <div>
              <h3 className="text-lg font-bold text-[#33275f] mb-4">Datos de Residencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Dirección</label>
                  <input defaultValue={state?.fields?.addressLine1 || ''} type="text" name="addressLine1" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#B681AE] focus:border-transparent transition-all outline-none" placeholder="Calle, Número, Depto..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Ciudad, Provincia</label>
                  <input defaultValue={state?.fields?.addressLine2 || ''} type="text" name="addressLine2" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#B681AE] focus:border-transparent transition-all outline-none" placeholder="Ej: CABA, Buenos Aires" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Código Postal</label>
                  <input defaultValue={state?.fields?.zipCode || ''} type="text" name="zipCode" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#B681AE] focus:border-transparent transition-all outline-none" placeholder="Ej: 1425" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">País *</label>
                  <select required defaultValue={state?.fields?.country || ''} name="country" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#B681AE] focus:border-transparent transition-all outline-none cursor-pointer">
                    <option value="" disabled>Selecciona un país...</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Chile">Chile</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Costa Rica">Costa Rica</option>
                    <option value="Cuba">Cuba</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="El Salvador">El Salvador</option>
                    <option value="España">España</option>
                    <option value="Estados Unidos">Estados Unidos</option>
                    <option value="Guatemala">Guatemala</option>
                    <option value="Honduras">Honduras</option>
                    <option value="México">México</option>
                    <option value="Nicaragua">Nicaragua</option>
                    <option value="Panamá">Panamá</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Perú">Perú</option>
                    <option value="Puerto Rico">Puerto Rico</option>
                    <option value="República Dominicana">República Dominicana</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Otro">Otro País</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={pending}
                className="w-full bg-[#33275f] text-white font-bold py-4 rounded-xl hover:bg-[#251c45] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {pending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Creando Usuario...
                  </>
                ) : (
                  'Crear Usuario'
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* Modal de Error */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-red-50 flex items-center justify-between border-b border-red-100">
              <h3 className="text-red-800 font-bold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Ocurrió un error
              </h3>
              <button onClick={() => setIsErrorModalOpen(false)} className="text-red-500 hover:text-red-800 transition-colors p-1 rounded-full hover:bg-red-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-sm">
                {state?.error || "Hubo un problema al procesar tu solicitud."}
              </p>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setIsErrorModalOpen(false)} 
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
