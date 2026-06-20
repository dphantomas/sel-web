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
            className="transition-transform hover:scale-110 flex items-center justify-center w-9 h-9 bg-white rounded-full shadow-sm" aria-label="X (formerly Twitter)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1227" className="w-[18px] h-[18px]" fill="#33275f">
              <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
            </svg>
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
