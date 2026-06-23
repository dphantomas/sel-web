'use client'

import React, { useEffect, useRef } from 'react'

export default function SecureAudioPlayer({ url }) {
  const audioRef = useRef(null)

  useEffect(() => {
    const audioEl = audioRef.current
    if (!audioEl) return

    const handleContextMenu = (e) => {
      e.preventDefault()
    }

    audioEl.addEventListener('contextmenu', handleContextMenu)
    return () => {
      audioEl.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  if (!url) return <p className="text-gray-500 animate-pulse">Cargando audio...</p>

  return (
    <div className="w-full max-w-xl mx-auto bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/50">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-[#9187BA]/10 text-[#9187BA] rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        
        {/* Usamos controlsList="nodownload" para ocultar el botón nativo de descarga */}
        <audio
          ref={audioRef}
          controls
          controlsList="nodownload"
          className="w-full focus:outline-none"
          src={url}
        >
          Tu navegador no soporta el elemento de audio.
        </audio>
        
        <p className="text-xs text-gray-400 mt-4 text-center">
          Material protegido. La descarga no está permitida.
        </p>
      </div>
    </div>
  )
}
