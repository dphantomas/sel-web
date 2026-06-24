'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SecurePDFViewer from '@/components/SecurePDFViewer'
import SecureAudioPlayer from '@/components/SecureAudioPlayer'

export default function VisorPage({ params }) {
  // En Next.js 15+, params is a Promise that needs to be unwrapped with React.use()
  const unwrappedParams = use(params)
  const id = unwrappedParams.id
  
  const router = useRouter()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchResource() {
      try {
        const res = await fetch(`/api/resources/${id}`)
        const data = await res.json()
        
        if (!res.ok) {
          throw new Error(data.error || 'No se pudo cargar el recurso')
        }
        
        setResource(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchResource()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7FA]">
        <div className="w-16 h-16 border-4 border-[#B681AE]/30 border-t-[#B681AE] rounded-full animate-spin"></div>
        <p className="mt-4 text-[#33275f] font-medium animate-pulse">Preparando entorno seguro...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7FA] p-6">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.back()} 
            className="bg-[#33275f] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B681AE] transition-colors w-full"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  // Si el recurso es explícitamente descargable, o es de otro tipo (ej. Word, Excel) que no soportamos ver online
  const typeStr = resource?.type?.toLowerCase() || ''
  const nameStr = resource?.name?.toLowerCase() || ''
  const keyStr = resource?.cloudflareKey?.toLowerCase() || ''
  
  const isPDF = typeStr.includes('pdf') || nameStr.endsWith('.pdf') || keyStr.endsWith('.pdf')
  const isAudio = typeStr.includes('audio') || nameStr.endsWith('.mp3') || nameStr.endsWith('.wav') || nameStr.endsWith('.ogg') || keyStr.endsWith('.mp3') || keyStr.endsWith('.wav') || keyStr.endsWith('.ogg')

  if (!isPDF && !isAudio) {
    // Si no es un formato protegido en visor, lo descargamos/abrimos directamente
    window.location.href = resource.url
    return <p className="text-center mt-20 text-gray-500">Redirigiendo al archivo...</p>
  }

  return (
    <div className="min-h-screen bg-[#F8F7FA] pt-28 pb-8 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-5xl mx-auto w-full mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#33275f]">{resource?.name}</h1>
          <p className="text-[#9187BA] font-medium text-sm mt-1">
            Visualización segura y privada
          </p>
        </div>
        <button 
          onClick={() => router.back()}
          className="text-gray-500 hover:text-[#33275f] flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          <span className="hidden sm:inline">Volver al curso</span>
        </button>
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        {isPDF ? (
          <SecurePDFViewer url={resource.url} />
        ) : (
          <SecureAudioPlayer url={resource.url} />
        )}
      </div>

      <footer className="mt-12 text-center text-xs text-gray-400">
        <p>Los materiales están protegidos por derechos de autor. Su reproducción o descarga no autorizada está prohibida.</p>
      </footer>
    </div>
  )
}
