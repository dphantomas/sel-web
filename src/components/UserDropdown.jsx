'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { User, BookOpen, Settings, LogOut, Shield, Folder } from 'lucide-react'

export default function UserDropdown({ session, isScrolled, hasDarkHeader }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const user = session?.user
  if (!user) return null

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Iniciales si no hay foto
  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()

  const textColor = (!isScrolled && hasDarkHeader) ? '#ffffff' : '#33275f'
  const borderColor = (!isScrolled && hasDarkHeader) ? 'rgba(255,255,255,0.4)' : 'rgba(51,39,95,0.2)'

  return (
    <div className="relative ml-2" ref={dropdownRef}>
      {/* Botón (Foto o Iniciales) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-transform hover:scale-105 overflow-hidden bg-[#B681AE]/10 focus:outline-none"
        style={{ borderColor }}
      >
        {user.image ? (
          <img src={user.image} alt="Perfil" className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-bold" style={{ color: textColor }}>
            {initials || <User className="w-5 h-5" />}
          </span>
        )}
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Cabecera del Menú */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-sm font-bold text-[#33275f] truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <div className="py-2">
            <Link 
              href="/dashboard/perfil" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#B681AE]/10 hover:text-[#33275f] transition-colors"
            >
              <User className="w-4 h-4" />
              Mis datos
            </Link>
            
            <Link 
              href="/dashboard/talleres" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#B681AE]/10 hover:text-[#33275f] transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Mis talleres
            </Link>

            <Link 
              href="/dashboard/recursos" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#B681AE]/10 hover:text-[#33275f] transition-colors"
            >
              <Folder className="w-4 h-4" />
              Mis materiales
            </Link>

            <Link 
              href="/dashboard/seguridad" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#B681AE]/10 hover:text-[#33275f] transition-colors"
            >
              <Shield className="w-4 h-4" />
              Seguridad y Passkeys
            </Link>

            {(user.role === 'Admin' || user.role === 'Transmisor') && (
              <Link 
                href="/admin" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#B681AE] hover:bg-[#B681AE]/10 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Panel de Admin
              </Link>
            )}

            <div className="h-px bg-gray-100 my-2"></div>

            <button 
              onClick={() => {
                setIsOpen(false)
                signOut({ callbackUrl: '/' })
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
