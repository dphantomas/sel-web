'use client'

import { useState, useEffect } from 'react'
import { startRegistration, platformAuthenticatorIsAvailable } from '@simplewebauthn/browser'
import { Fingerprint, X, CheckCircle } from 'lucide-react'

/**
 * FastLoginPrompt
 * 
 * Banner que se muestra al usuario autenticado la primera vez que accede
 * desde un dispositivo que soporta biometría y que aún no tiene una passkey registrada.
 * 
 * Estados en localStorage:
 *  - `device_registered=true`   → ya configuró biometría, no mostrar
 *  - `biometricDismissed=true`  → eligió "No, gracias", no volver a ofrecer automáticamente
 *  - ninguno                    → mostrar oferta si el hardware lo soporta
 */
export default function FastLoginPrompt({ userEmail }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    async function checkAvailability() {
      try {
        // ¿Ya configuró biometría en este dispositivo?
        if (localStorage.getItem('device_registered') === 'true') return

        // ¿Ya rechazó la oferta?
        if (localStorage.getItem('biometricDismissed') === 'true') return

        // ¿El hardware soporta autenticadores de plataforma (Face ID, Touch ID, Windows Hello)?
        const isSupported = await platformAuthenticatorIsAvailable()
        if (!isSupported) return

        setIsVisible(true)
        // Pequeño delay para que la animación de entrada sea visible
        setTimeout(() => setAnimate(true), 50)
      } catch {
        // No mostrar si hay cualquier error de detección
      }
    }

    checkAvailability()
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('biometricDismissed', 'true')
    setAnimate(false)
    setTimeout(() => setIsVisible(false), 300)
  }

  const handleRegister = async () => {
    setIsRegistering(true)
    setError(null)

    try {
      // 1. Pedir opciones de registro al servidor
      const resp = await fetch('/api/auth/webauthn/generate-registration-options')
      if (!resp.ok) {
        const data = await resp.json()
        throw new Error(data.error || 'No se pudo iniciar el registro')
      }
      const options = await resp.json()

      // 2. Ejecutar el registro de passkey en el dispositivo
      let attResp
      try {
        attResp = await startRegistration({ optionsJSON: options })
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          // Solo descartar si el usuario explícitamente canceló
          const isCancel = err.message?.toLowerCase().includes('cancel') ||
                           err.message?.toLowerCase().includes('user')
          if (isCancel) {
            setIsRegistering(false)
            return
          }
          throw new Error('El dispositivo no pudo crear la passkey. Verificá que tenga biometría configurada.')
        }
        if (err.name === 'InvalidStateError') {
          throw new Error('Este dispositivo ya tiene una passkey registrada.')
        }
        throw new Error(err.message || 'No se pudo crear la passkey en este dispositivo.')
      }

      // 3. Verificar el registro en el servidor
      const verificationResp = await fetch('/api/auth/webauthn/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attResp),
      })

      const verification = await verificationResp.json()

      if (!verificationResp.ok) {
        throw new Error(verification.error || 'Error del servidor al validar el dispositivo.')
      }

      if (verification.verified) {
        localStorage.setItem('device_registered', 'true')
        if (userEmail) {
          localStorage.setItem('registered_email', userEmail)
        }
        setSuccess(true)
        // Ocultar el banner tras 3 segundos
        setTimeout(() => {
          setAnimate(false)
          setTimeout(() => setIsVisible(false), 300)
        }, 3000)
      } else {
        throw new Error('La validación del dispositivo falló.')
      }
    } catch (err) {
      console.error('Error en registro biométrico:', err)
      setError(err.message || 'Ocurrió un error al registrar el dispositivo.')
    } finally {
      setIsRegistering(false)
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl mb-8 text-white
        bg-gradient-to-br from-[#33275f] via-[#3d3070] to-[#4c3c86]
        border border-white/10 shadow-2xl
        transition-all duration-300 ease-out
        ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      {/* Decoración de fondo */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-[#B681AE]/10 pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-6">
        {success ? (
          <div className="flex items-center gap-3 py-2">
            <CheckCircle className="w-7 h-7 text-green-400 shrink-0" />
            <div>
              <p className="font-bold text-green-300">¡Passkey creada!</p>
              <p className="text-sm text-gray-300 mt-0.5">La próxima vez podés entrar al instante sin contraseña.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B681AE]/30 flex items-center justify-center shrink-0">
                  <Fingerprint className="w-5 h-5 text-[#d4a8d0]" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    Activá tu passkey en este dispositivo
                  </h3>
                  <p className="text-gray-300 text-xs mt-0.5">
                    Ingresá sin contraseña, como los bancos.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                disabled={isRegistering}
                className="text-white/40 hover:text-white/80 transition shrink-0 mt-0.5"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 text-xs p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="fast-login-register-btn"
                onClick={handleRegister}
                disabled={isRegistering}
                className="bg-white text-[#33275f] hover:bg-gray-100 font-bold text-sm py-2.5 px-5 rounded-xl transition duration-300 shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isRegistering ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#33275f]/30 border-t-[#33275f] rounded-full animate-spin" />
                    Configurando...
                  </>
                ) : (
                  <>
                    <Fingerprint size={16} />
                    Sí, crear passkey
                  </>
                )}
              </button>
              <button
                id="fast-login-dismiss-btn"
                onClick={handleDismiss}
                disabled={isRegistering}
                className="text-white/70 hover:text-white text-sm font-medium py-2.5 px-4 rounded-xl transition duration-300 hover:bg-white/10 disabled:opacity-50"
              >
                No, gracias
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
