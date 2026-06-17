'use client'

import { useState, useEffect } from 'react'
import { startRegistration, platformAuthenticatorIsAvailable } from '@simplewebauthn/browser'

export default function FastLoginPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function checkAvailability() {
      // Verificar si el usuario ya decidió ocultar este banner en este dispositivo
      const dismissed = localStorage.getItem('dismissedFastLoginPrompt')
      const registered = localStorage.getItem('device_registered')
      
      if (dismissed === 'true' || registered === 'true') {
        return
      }

      // Verificar si el hardware soporta biometría local (Face ID, Touch ID, etc)
      const isAvailable = await platformAuthenticatorIsAvailable()
      if (isAvailable) {
        setIsVisible(true)
      }
    }

    checkAvailability()
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('dismissedFastLoginPrompt', 'true')
    setIsVisible(false)
  }

  const handleRegister = async () => {
    setIsRegistering(true)
    setError(null)
    
    try {
      // 1. Pedir opciones de registro
      const resp = await fetch('/api/auth/webauthn/generate-registration-options')
      if (!resp.ok) throw new Error('No se pudo iniciar el registro')
      const options = await resp.json()

      // 2. Ejecutar registro en el dispositivo
      let attResp;
      try {
        attResp = await startRegistration(options)
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          // El usuario canceló o el navegador bloqueó, simplemente no hacemos nada
          setIsRegistering(false)
          return
        }
        throw err
      }

      // 3. Verificar el registro en el servidor
      const verificationResp = await fetch('/api/auth/webauthn/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attResp),
      })

      const verification = await verificationResp.json()

      if (verification.verified) {
        // Guardar bandera en este dispositivo para no volver a molestar
        localStorage.setItem('device_registered', 'true')
        setSuccess(true)
        setTimeout(() => setIsVisible(false), 3000) // Ocultar después de 3 segs
      } else {
        throw new Error('No se pudo validar tu dispositivo en el servidor.')
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Ocurrió un error al intentar registrar el dispositivo.')
    } finally {
      setIsRegistering(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-[#33275f] to-[#4c3c86] rounded-[24px] p-6 shadow-xl border border-white/20 mb-8 text-white relative overflow-hidden">
      <div className="absolute -right-10 -top-10 opacity-10">
        <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <svg className="w-6 h-6 text-[#B681AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path>
          </svg>
          Inicia sesión más rápido
        </h3>
        
        {success ? (
          <p className="text-green-300 font-semibold mb-2">¡Dispositivo configurado exitosamente! La próxima vez podrás entrar al instante.</p>
        ) : (
          <>
            <p className="text-gray-200 text-sm mb-5 max-w-xl">
              Hemos detectado que estás usando un nuevo dispositivo. ¿Quieres conectar tu Face ID o Huella Digital para ingresar la próxima vez sin escribir contraseñas?
            </p>
            
            {error && (
              <div className="bg-red-500/20 text-red-200 text-sm p-3 rounded-lg mb-4 border border-red-500/50">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="bg-white text-[#33275f] hover:bg-gray-100 font-bold py-2.5 px-6 rounded-xl transition duration-300 shadow-lg disabled:opacity-50"
              >
                {isRegistering ? 'Conectando...' : 'Sí, conectar ahora'}
              </button>
              <button
                onClick={handleDismiss}
                disabled={isRegistering}
                className="bg-transparent border border-white/30 text-white hover:bg-white/10 font-medium py-2.5 px-6 rounded-xl transition duration-300 disabled:opacity-50"
              >
                Quizás más tarde
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
