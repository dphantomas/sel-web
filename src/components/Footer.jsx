'use client'

import { usePathname } from 'next/navigation'

const BASE = '/assets'

export default function Footer() {
  const pathname = usePathname()
  const lang = pathname.startsWith('/en') ? 'en' : 'es'

  return (
    <footer style={{ background: 'linear-gradient(90deg, #d4aeea 0%, #fefdff 100%)' }} className="py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Footer Logo */}
        <div className="text-center mb-6">
          <img
            src={`${BASE}/logo-sel-footer-1.png`}
            alt="Sanación en Luz"
            className="mx-auto h-auto"
            style={{ maxWidth: '245px' }}
          />
        </div>

        {/* Social Icons */}
        <div className="flex justify-center items-center gap-4 mb-6">
          <a href="https://www.instagram.com/sanacion_en_luz" target="_blank" rel="noopener noreferrer"
            className="transition-transform hover:scale-110" aria-label="Instagram">
            <img src={`${BASE}/ig.png`} alt="Instagram" className="w-9 h-9 object-contain" />
          </a>
          <a href="https://www.facebook.com/sanacionenluz.2020" target="_blank" rel="noopener noreferrer"
            className="transition-transform hover:scale-110" aria-label="Facebook">
            <img src={`${BASE}/face.png`} alt="Facebook" className="w-9 h-9 object-contain" />
          </a>
          <a href="https://twitter.com/SanacionEnLuz" target="_blank" rel="noopener noreferrer"
            className="transition-transform hover:scale-110" aria-label="Twitter">
            <img src={`${BASE}/twitter.png`} alt="Twitter" className="w-9 h-9 object-contain" />
          </a>
          <a href="https://api.whatsapp.com/send/?phone=5491141771120" target="_blank" rel="noopener noreferrer"
            className="transition-transform hover:scale-110" aria-label="WhatsApp">
            <img src={`${BASE}/wapp.png`} alt="WhatsApp" className="w-9 h-9 object-contain" />
          </a>
          <a href="mailto:contacto@sanacionenluz.com"
            className="transition-transform hover:scale-110" aria-label="Email">
            <img src={`${BASE}/mail.png`} alt="Email" className="w-9 h-9 object-contain" />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-center" style={{ color: '#33275f', fontSize: '11px' }}>
          {lang === 'en'
            ? 'Sanación en Luz® 2023 | All rights reserved.'
            : 'Sanación en Luz® 2023 | Todos los derechos reservados.'}
        </p>
      </div>
    </footer>
  )
}
