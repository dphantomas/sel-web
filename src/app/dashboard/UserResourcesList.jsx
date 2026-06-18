'use client'

import React, { useState } from 'react'
import { DownloadCloud, FileText, Headphones, PlayCircle, Folder } from 'lucide-react'

export default function UserResourcesList({ resources }) {
  const [loadingId, setLoadingId] = useState(null)

  if (!resources || resources.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <p className="text-gray-600">Aún no tienes materiales de estudio disponibles.</p>
      </div>
    )
  }

  const getIcon = (type) => {
    if (type.includes('pdf')) return <FileText className="w-6 h-6 text-[#B681AE]" />
    if (type.includes('audio')) return <Headphones className="w-6 h-6 text-[#9187BA]" />
    if (type.includes('video')) return <PlayCircle className="w-6 h-6 text-[#33275f]" />
    return <Folder className="w-6 h-6 text-gray-400" />
  }

  const handleOpenResource = async (resource) => {
    setLoadingId(resource.id)
    try {
      const res = await fetch(`/api/resources/${resource.id}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'No se pudo cargar el recurso')
      }
      const { url } = await res.json()
      
      // Abrir en nueva pestaña
      window.open(url, '_blank')
    } catch (error) {
      alert(error.message)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <button
          key={resource.id}
          onClick={() => handleOpenResource(resource)}
          disabled={loadingId === resource.id}
          className="bg-white/80 backdrop-blur-md rounded-[24px] p-6 text-left shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/40 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 group disabled:opacity-50 flex flex-col justify-between"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-[#B681AE]/10 rounded-xl group-hover:bg-[#B681AE]/20 transition-colors">
              {getIcon(resource.type)}
            </div>
            <div className="flex-1">
              <h3 className="text-[#33275f] font-bold text-lg leading-tight line-clamp-2">
                {resource.name}
              </h3>
              <p className="text-xs font-bold text-[#B681AE] mt-2 tracking-wide uppercase">
                {resource.course?.title}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto w-full">
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
              {resource.type.split('/')[1]?.toUpperCase() || 'ARCHIVO'}
            </span>
            <div className="flex items-center text-[#9187BA] text-sm font-bold group-hover:text-[#33275f] transition-colors">
              {loadingId === resource.id ? (
                <span className="animate-pulse">Cargando...</span>
              ) : (
                <>
                  <span className="mr-2">Abrir</span>
                  <DownloadCloud className="w-4 h-4" />
                </>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
