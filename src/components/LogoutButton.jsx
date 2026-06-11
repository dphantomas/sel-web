'use client'

import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="border border-[#9187BA] text-[#33275f] hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm font-bold py-3 px-6 rounded-xl transition duration-300"
    >
      Cerrar Sesión
    </button>
  )
}
