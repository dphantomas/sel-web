'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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


  // All pages have a dark section header at the top → white text when not scrolled
  const textColor = !isScrolled ? '#ffffff' : '#33275f'
  const borderColor = !isScrolled ? '#ffffff' : '#33275f'

  // Language toggle: links to the equivalent page in the other language
  const langToggle = lang === 'en'
    ? { href: getLangEquivalent(pathname, 'en'), label: 'ES' }
    : { href: getLangEquivalent(pathname, 'es'), label: 'EN' }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'navbar-scrolled py-2' : 'py-3 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">

        {/* Logo */}
        <Link href={lang === 'en' ? '/en/home/' : '/'} className="shrink-0" title="Home">
          <img
            src="/assets/logo-sel.png"
            alt="Sanación en Luz"
            className="h-10 md:h-12 w-auto object-contain transition-all duration-300"
            style={!isScrolled ? { filter: 'brightness(0) invert(1)' } : {}}
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[15px] xl:text-[16px] transition-all duration-300 whitespace-nowrap ${
                isActive(item.href) 
                  ? 'font-bold border-b-2 pb-0.5' 
                  : 'font-medium hover:opacity-80'
              }`}
              style={{
                color: textColor,
                borderColor: isActive(item.href) ? borderColor : 'transparent',
                textDecoration: 'none',
                textShadow: !isScrolled ? '0px 2px 4px rgba(0,0,0,0.6)' : 'none',
              }}
            >
              {item.label}
            </Link>
          ))}

          {/* Language toggle button — visually distinct */}
          <Link
            href={langToggle.href}
            className="text-xs font-bold px-3 py-1 rounded-full border-2 transition-all duration-200 hover:scale-105 whitespace-nowrap ml-2"
            style={{
              color: (isHome && !isScrolled) ? '#33275f' : '#fff',
              backgroundColor: (isHome && !isScrolled) ? 'rgba(255,255,255,0.9)' : '#33275f',
              borderColor: (isHome && !isScrolled) ? 'rgba(255,255,255,0.9)' : '#33275f',
              textDecoration: 'none',
              letterSpacing: '1px',
              boxShadow: !isScrolled ? '0px 2px 4px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            🌐 {langToggle.label}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-md transition-colors cursor-pointer"
          style={{ color: textColor }}
          aria-label={lang === 'en' ? 'Open menu' : 'Abrir menú'}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t shadow-xl">
          <div className="flex flex-col py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-left px-6 py-3 text-sm font-medium transition-colors hover:bg-purple-50"
                style={{
                  color: isActive(item.href) ? '#33275f' : '#555',
                  fontWeight: isActive(item.href) ? '700' : '500',
                  borderLeft: isActive(item.href) ? '3px solid #33275f' : '3px solid transparent',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            ))}

            {/* Language toggle — mobile */}
            <div className="px-6 pt-3 pb-1">
              <Link
                href={langToggle.href}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border-2 transition-all hover:opacity-80"
                style={{
                  color: '#fff',
                  backgroundColor: '#33275f',
                  borderColor: '#33275f',
                  textDecoration: 'none',
                  letterSpacing: '1px',
                }}
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
