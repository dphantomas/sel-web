'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import UserDropdown from './UserDropdown'

const NAV_ES = [
  { href: '/',               label: 'Inicio' },
  { href: '/talleres/',      label: 'Talleres' },
  { href: '/blog/',          label: 'Blog' },
  { href: '/videos/',        label: 'Videos' },
  { href: '/quienes-somos/', label: 'Quiénes Somos' },
  { href: '/testimonios/',   label: 'Testimonios' },
  { href: '/galeria/',       label: 'Galería' },
  { href: '/contacto/',      label: 'Contacto' },
]

const NAV_EN = [
  { href: '/en/home/',         label: 'Home' },
  { href: '/en/workshops/',    label: 'Workshops' },
  { href: '/en/blog/',         label: 'Blog' },
  { href: '/en/videos/',       label: 'Videos' },
  { href: '/en/about-us/',     label: 'About Us' },
  { href: '/en/testimonials/', label: 'Testimonials' },
  { href: '/en/gallery/',      label: 'Gallery' },
  { href: '/en/contact/',      label: 'Contact' },
]

// Maps each ES route to its EN equivalent and vice versa
const ROUTE_MAP = [
  { es: '/',               en: '/en/home/' },
  { es: '/talleres/',      en: '/en/workshops/' },
  { es: '/blog/',          en: '/en/blog/' },
  { es: '/videos/',        en: '/en/videos/' },
  { es: '/quienes-somos/', en: '/en/about-us/' },
  { es: '/testimonios/',   en: '/en/testimonials/' },
  { es: '/galeria/',       en: '/en/gallery/' },
  { es: '/contacto/',      en: '/en/contact/' },
]

// Known blog slug equivalences between ES and EN
const BLOG_SLUG_MAP = [
  { es: 'dualidad',                    en: 'duality' },
  { es: 'que-es-sanacion-en-luz',      en: 'what-is-sanacion-en-luz' },
  { es: 'como-funciona-sanacion-en-luz', en: 'how-does-sanacion-en-luz-work' },
]

/**
 * Given the current pathname and the current language,
 * returns the equivalent URL in the other language.
 */
function getLangEquivalent(pathname, currentLang) {
  const normalised = pathname.endsWith('/') ? pathname : pathname + '/'

  // All blog posts (ES and EN) live at /blog/[slug]/ — check both sides of the map
  const blogMatch = normalised.match(/^\/blog\/([^/]+)\/$/)
  if (blogMatch) {
    const slug = blogMatch[1]
    // Is it a Spanish slug? → return English equivalent
    const esMap = BLOG_SLUG_MAP.find((m) => m.es === slug)
    if (esMap) return `/blog/${esMap.en}/`
    // Is it an English slug? → return Spanish equivalent
    const enMap = BLOG_SLUG_MAP.find((m) => m.en === slug)
    if (enMap) return `/blog/${enMap.es}/`
    // Unknown slug — go to blog listing in target language
    return currentLang === 'es' ? '/en/blog/' : '/blog/'
  }

  // /en/blog/ listing page
  const enBlogListMatch = normalised.match(/^\/en\/blog\/$/)
  if (enBlogListMatch) return '/blog/'

  if (currentLang === 'es') {
    const match = ROUTE_MAP.find((r) => normalised === r.es)
    return match ? match.en : '/en/home/'
  } else {
    const match = ROUTE_MAP.find((r) => normalised === r.en)
    return match ? match.es : '/'
  }
}



export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  // Auto-detect language from URL
  const lang = pathname.startsWith('/en') ? 'en' : 'es'
  const navItems = lang === 'en' ? NAV_EN : NAV_ES
  const isHome = lang === 'es'
    ? (pathname === '/' || pathname === '/new_ai' || pathname === '/new_ai/')
    : (pathname === '/en/home' || pathname === '/en/home/')

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href) => {
    if (href === '/' || href === '/en/home/') return isHome
    return pathname.startsWith(href.replace(/\/$/, ''))
  }


  // Solo las páginas internas de app y auth tienen fondo claro bajo el Navbar
  const isLightHeaderPage = [
    '/login',
    '/registro',
    '/verificar-email',
    '/olvide-contrasena',
    '/reset-password',
    '/dashboard',
    '/admin'
  ].some(route => pathname.startsWith(route))

  const hasDarkHeader = !isLightHeaderPage

  // Language toggle: links to the equivalent page in the other language
  const langToggle = lang === 'en'
    ? { href: getLangEquivalent(pathname, 'en'), label: 'ES' }
    : { href: getLangEquivalent(pathname, 'es'), label: 'EN' }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(51,39,95,0.08)] border-b border-sel-lavender/30 py-2' : 'py-3 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">

        {/* Logo */}
        <Link href={lang === 'en' ? '/en/home/' : '/'} className="shrink-0" title="Home">
          <Image
            src="/assets/logo-sel.png"
            alt="Sanación en Luz"
            width={180}
            height={48}
            priority
            className={`h-10 md:h-12 w-auto object-contain transition-all duration-300 ${
              (!isScrolled && hasDarkHeader) ? 'brightness-0 invert' : ''
            }`}
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[15px] xl:text-[16px] transition-all duration-300 whitespace-nowrap border-b-2 ${
                !isScrolled && hasDarkHeader
                  ? 'text-white'
                  : 'text-sel-purple'
              } ${
                !isScrolled ? 'drop-shadow-md' : ''
              } ${
                isActive(item.href) 
                  ? 'font-bold pb-0.5 border-current' 
                  : 'font-medium hover:opacity-80 border-transparent'
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Enlaces de Autenticación (Desktop) */}
          {status === 'authenticated' && (
            <UserDropdown session={session} isScrolled={isScrolled} hasDarkHeader={hasDarkHeader} />
          )}

          {/* Language toggle button — visually distinct */}
          <Link
            href={langToggle.href}
            className={`text-xs font-bold px-3 py-1 rounded-full border-2 transition-all duration-200 hover:scale-105 whitespace-nowrap ml-2 tracking-[1px] ${
              hasDarkHeader && !isScrolled
                ? 'text-sel-purple bg-white/90 border-white/90 drop-shadow-md'
                : 'text-white bg-sel-purple border-sel-purple'
            }`}
          >
            🌐 {langToggle.label}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`lg:hidden p-2 rounded-md transition-colors cursor-pointer ${
            !isScrolled && hasDarkHeader ? 'text-white' : 'text-sel-purple'
          } ${
            !isScrolled ? 'bg-black/15' : 'bg-transparent'
          }`}
          aria-label={lang === 'en' ? 'Open menu' : 'Abrir menú'}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t shadow-xl absolute top-full left-0 w-full">
          <div className="flex flex-col py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`text-left px-6 py-3 text-sm transition-colors hover:bg-purple-50 border-l-[3px] ${
                  isActive(item.href) 
                    ? 'text-sel-purple font-bold border-sel-purple' 
                    : 'text-gray-600 font-medium border-transparent'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Enlaces de Autenticación (Mobile) */}
            {status === 'authenticated' && (
              <div className="mt-2 border-t border-gray-100 pt-2">
                <Link
                  href="/dashboard/perfil"
                  onClick={() => setIsOpen(false)}
                  className="text-left px-6 py-3 text-sm font-bold transition-colors hover:bg-purple-50 block"
                  style={{ color: '#33275f', textDecoration: 'none' }}
                >
                  Mis datos
                </Link>
                <Link
                  href="/dashboard/talleres"
                  onClick={() => setIsOpen(false)}
                  className="text-left px-6 py-3 text-sm font-bold transition-colors hover:bg-purple-50 block"
                  style={{ color: '#33275f', textDecoration: 'none' }}
                >
                  Mis talleres
                </Link>
                <Link
                  href="/dashboard/recursos"
                  onClick={() => setIsOpen(false)}
                  className="text-left px-6 py-3 text-sm font-bold transition-colors hover:bg-purple-50 block"
                  style={{ color: '#33275f', textDecoration: 'none' }}
                >
                  Mis materiales
                </Link>
                <Link
                  href="/dashboard/seguridad"
                  onClick={() => setIsOpen(false)}
                  className="text-left px-6 py-3 text-sm font-bold transition-colors hover:bg-purple-50 block"
                  style={{ color: '#33275f', textDecoration: 'none' }}
                >
                  Seguridad y Passkeys
                </Link>
                {(session?.user?.role === 'Admin' || session?.user?.role === 'Transmisor') && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="text-left px-6 py-3 text-sm font-bold transition-colors hover:bg-purple-50 block text-[#B681AE]"
                  >
                    Panel de Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="text-left px-6 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 w-full"
                >
                  Cerrar sesión
                </button>
              </div>
            )}

            {/* Language toggle — mobile */}
            <div className="px-6 pt-3 pb-1">
              <Link
                href={langToggle.href}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border-2 transition-all hover:opacity-80 text-white bg-sel-purple border-sel-purple tracking-[1px]"
              >
                🌐 {langToggle.label}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
