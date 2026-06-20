'use client'

import { useState } from 'react'
import UserProfileForm from './UserProfileForm'
import UserResourcesList from './UserResourcesList'
import UserCourseHistory from './UserCourseHistory'

export default function DashboardTabs({ user, finalResources, unlockedInstances }) {
  const [activeTab, setActiveTab] = useState('resources') // 'profile' | 'resources'

  return (
    <div>
      {/* Pestañas de Navegación */}
      <div className="flex gap-2 sm:gap-6 mb-8 border-b border-white/40">
        <button 
          onClick={() => setActiveTab('resources')} 
          className={`pb-3 text-sm sm:text-base font-bold border-b-2 transition-all ${
            activeTab === 'resources' 
              ? 'border-[#33275f] text-[#33275f]' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Mis Talleres y Recursos
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`pb-3 text-sm sm:text-base font-bold border-b-2 transition-all ${
            activeTab === 'profile' 
              ? 'border-[#33275f] text-[#33275f]' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Mis Datos Personales
        </button>
      </div>

      {/* Contenido de la Pestaña Activa */}
      {activeTab === 'profile' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <UserProfileForm user={user} />
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-12">
          {/* Material de Estudio (Recursos) */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-[#33275f] text-xl font-bold tracking-wide">MATERIAL DE ESTUDIO</h2>
              <span className="bg-[#B681AE]/10 text-[#33275f] text-xs font-bold px-3 py-1 rounded-full">
                {finalResources.length} Archivos
              </span>
            </div>
            <UserResourcesList resources={finalResources} />
          </div>

          {/* Historial de Encuentros (Instancias) */}
          <div>
            <h2 className="text-[#33275f] text-xl font-bold mb-6 tracking-wide">HISTORIAL DE ENCUENTROS</h2>
            <UserCourseHistory instances={unlockedInstances} />
          </div>
        </div>
      )}
    </div>
  )
}
