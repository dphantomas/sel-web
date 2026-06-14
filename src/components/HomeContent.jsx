'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import BlogGrid from '@/components/BlogGrid'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'

const BASE = '/assets'

export default function HomeContent({ lang = 'es', enPosts = null }) {
  const { data: session } = useSession()
  const isEn = lang === 'en';
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [latestVideo, setLatestVideo] = useState(null)

  useEffect(() => {
    fetch('/api/videos')
      .then(res => res.json())
      .then(data => {
        if (data?.videos?.length > 0) {
          setLatestVideo(data.videos[0])
        }
      })
      .catch(console.error)
  }, [])

  const t = {
    heroTagline: isEn 
      ? '“Nothing you have done so far defines who you Are”' 
      : '«Nada de lo que has hecho hasta ahora define quién Eres»',
    process: {
      title: 'El Proceso', // We can use the tagline here
      line1: isEn ? <><strong>Sanación en Luz</strong> comes to us for the <strong>Age of Light</strong>.</> : <><strong>Sanación en Luz</strong> llega a nosotros para la <strong>Era de la Luz</strong>.</>,
      line2: isEn ? <><strong>Sanación en Luz</strong> is a process designed for evolution into the <strong>New Human</strong>.</> : <><strong>Sanación en Luz</strong> es un proceso diseñado para la evolución hacia el <strong>Nuevo Humano</strong>.</>,
      line3: isEn ? <><strong>Sanación en Luz</strong> is the path to your original <strong>Purity</strong>.</> : <><strong>Sanación en Luz</strong> es el camino hacia tu <strong>Pureza</strong> original.</>,
      btn: isEn ? 'Discover the Workshops' : 'Descubrir los Talleres',
      link: isEn ? '/en/workshops' : '/talleres'
    },
    facilitators: {
      title: isEn ? 'The Facilitators' : 'Los Facilitadores',
      text: isEn 
        ? 'We are Darío and Mónica. Sanación en Luz began to arrive to us in August 2020. They showed us that we were Divine Complements, and that at this time it is necessary that we receive their guidance for the next process: Sanacion en Luz.'
        : 'Somos Darío y Mónica. Sanación en Luz comenzó a llegar a nosotros en agosto de 2020. Nos mostraron que éramos Complementos Divinos y que en este tiempo es necesario que recibamos su guía para el próximo proceso: Sanación en Luz.',
      btn: isEn ? 'Read our story' : 'Leer nuestra historia',
      link: isEn ? '/en/about-us' : '/quienes-somos'
    },
    testimonials: {
      title: isEn ? 'Testimonials' : 'Testimonios',
      items: [
        {
          text: isEn 
            ? "When I started doing the process of Sanación en Luz my life changed completely. I feel happy, with a lot of peace, in harmony and above all I managed to unblock what had me stagnant."
            : "Cuando empecé a hacer el proceso de Sanación en Luz mi vida cambió por completo. Me siento feliz, con mucha paz, en armonía y por sobre todo logré destrabar eso que me tenía estancada.",
          author: "Miriam (Argentina)"
        },
        {
          text: isEn
            ? "Darío and Mónica accompany from pure Love and a deep respect for the individual process. Finding them was a before and after in my life."
            : "Darío y Mónica acompañan desde el Amor puro y un respeto profundo por el proceso individual. Encontrarlos fue un antes y un después en mi vida.",
          author: "Laura (España)"
        },
        {
          text: isEn
            ? "The Quietude workshop is an experience that cannot be explained in words. It is a return home, a return to the center."
            : "El taller de Quietud es una experiencia que no se puede explicar con palabras. Es un volver a casa, un volver al centro.",
          author: "Carlos (México)"
        }
      ],
      btn: isEn ? 'Read more testimonials' : 'Leer más testimonios',
      link: isEn ? '/en/testimonials' : '/testimonios'
    },
    blog: {
      title: 'Blog',
      btn: isEn ? 'View all articles' : 'Ver todos los artículos',
      link: isEn ? '/en/blog' : '/blog'
    },
    cta: {
      title: isEn ? 'Do you feel the call?' : '¿Sentís el llamado?',
      text: isEn 
        ? 'Start your process towards the New Human today.' 
        : 'Comenzá tu proceso hacia el Nuevo Humano hoy mismo.',
      btn1: 'WhatsApp',
      btn2: 'Email'
    }
  };

  const handleNextTestimonial = () => setActiveTestimonial((p) => (p + 1) % t.testimonials.items.length)
  const handlePrevTestimonial = () => setActiveTestimonial((p) => (p - 1 + t.testimonials.items.length) % t.testimonials.items.length)

  return (
    <div className="bg-white">
      {/* 1. HERO SECTION */}
      <section className="hero-bg relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center text-center px-4 py-20 animate-fade-in-up mt-10">
          <div className="mb-8 transform transition-transform duration-1000 hover:scale-105">
            <img
              src={`${BASE}/logo-principal-1.png`}
              alt="Sanación en Luz"
              className="mx-auto w-auto drop-shadow-2xl"
              style={{ maxWidth: '650px', width: '80vw' }}
            />
          </div>
          <p
            className="text-white text-center drop-shadow-lg max-w-3xl mb-10"
            style={{
              fontFamily: "'Lato', Helvetica, Arial, Lucida, sans-serif",
              fontStyle: 'italic',
              fontSize: '22px',
              lineHeight: '1.5em',
              fontWeight: 300,
              letterSpacing: '1px'
            }}
          >
            {t.heroTagline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!session && (
              <Link
                href="/login"
                className="bg-transparent border-2 border-white hover:bg-white text-white hover:text-[#33275f] px-8 py-3 rounded-full font-bold tracking-wide transition-all duration-300 shadow-lg"
              >
                {isEn ? 'Log In' : 'Ingresar a mi cuenta'}
              </Link>
            )}
            <Link
              href={t.process.link}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-transparent text-white px-8 py-3 rounded-full font-bold tracking-wide transition-all duration-300"
            >
              {isEn ? 'The Process' : 'El Proceso'}
            </Link>
            <Link
              href={isEn ? '/en/workshops' : '/talleres'}
              className="bg-[#c2a2e8] hover:bg-[#9187BA] text-[#33275f] hover:text-white px-8 py-3 rounded-full font-bold tracking-wide transition-all duration-300 shadow-lg"
            >
              {isEn ? 'Workshops' : 'Talleres'}
            </Link>
          </div>
          
          {/* Scroll down indicator */}
          <div className="absolute bottom-6 animate-bounce cursor-pointer opacity-80 hover:opacity-100 transition-opacity" onClick={() => window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' })}>
            <img src={`${BASE}/flecha-blanca.png`} alt="Scroll down" className="w-8 rotate-90" />
          </div>
        </div>
      </section>

      {/* 2. THE PROCESS SECTION (Parallax) */}
      <section
        className="relative py-16 parallax-bg"
        style={{
          backgroundImage: `url(${BASE}/fondo-blog-1.jpg)`,
        }}
      >
        <div className="absolute inset-0 bg-white/80" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="mb-8">
            <img src={`${BASE}/flecha2.png`} alt="" className="mx-auto w-[60px]" />
          </div>

          <div className="space-y-6 text-[#33275f] text-[20px] md:text-[24px] font-light leading-relaxed mb-10" style={{ fontFamily: "'Lato', sans-serif" }}>
            <p className="drop-shadow-sm">{t.process.line1}</p>
            <p className="drop-shadow-sm">{t.process.line2}</p>
            <p className="drop-shadow-sm">{t.process.line3}</p>
          </div>

          <Link
            href={t.process.link}
            className="inline-block bg-[#9187BA] hover:bg-[#33275f] text-white px-8 py-3 rounded-full font-bold tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            {t.process.btn}
          </Link>
        </div>
      </section>

      {/* 3. MEET THE FACILITATORS */}
      <section className="py-16 bg-[#fcfbfe]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/2 relative">
            <div className="absolute -inset-4 bg-[#e8daf5] rounded-tl-[80px] rounded-br-[80px] opacity-50 transform -rotate-3"></div>
            <img 
              src={`${BASE}/darioymonica.jpg`} 
              alt="Darío y Mónica" 
              className="relative rounded-tl-[60px] rounded-br-[60px] shadow-2xl w-full object-cover"
              style={{ maxHeight: '400px', objectPosition: 'center top' }}
            />
          </div>
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl text-[#33275f] font-bold mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
              {t.facilitators.title}
            </h2>
            <div className="w-12 h-1 bg-[#c2a2e8] mx-auto md:mx-0 mb-6"></div>
            <p className="text-[#666] text-base leading-relaxed mb-8" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              {t.facilitators.text}
            </p>
            <Link
              href={t.facilitators.link}
              className="inline-block border-2 border-[#33275f] text-[#33275f] hover:bg-[#33275f] hover:text-white px-6 py-2 rounded-full font-bold transition-all duration-300"
            >
              {t.facilitators.btn}
            </Link>
          </div>
        </div>
      </section>

      {/* 4. TESTIMONIALS CAROUSEL */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <h2 className="text-2xl md:text-3xl text-[#33275f] font-bold mb-10" style={{ fontFamily: "'Lato', sans-serif" }}>
            {t.testimonials.title}
          </h2>
          
          <div className="relative bg-[#fcfbfe] p-6 md:p-10 rounded-3xl shadow-sm border border-[#e3e1e8] mb-8 min-h-[220px] flex flex-col justify-center">
            <div className="text-5xl text-[#e8daf5] absolute top-4 left-6 md:left-8 font-serif">"</div>
            <p className="text-[#555] text-base md:text-lg italic relative z-10 mb-6 mt-4" style={{ fontFamily: "'Open Sans', sans-serif", lineHeight: '1.7em' }}>
              {t.testimonials.items[activeTestimonial].text}
            </p>
            <p className="text-[#b085b3] font-bold text-base uppercase tracking-wider">
              — {t.testimonials.items[activeTestimonial].author}
            </p>
            
            {/* Carousel Controls */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 md:-mx-4 pointer-events-none">
              <button 
                onClick={handlePrevTestimonial}
                className="pointer-events-auto p-2 rounded-full bg-white shadow-md text-[#33275f] hover:bg-[#f9f7fc] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={handleNextTestimonial}
                className="pointer-events-auto p-2 rounded-full bg-white shadow-md text-[#33275f] hover:bg-[#f9f7fc] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {t.testimonials.items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activeTestimonial ? '24px' : '8px',
                  height: '8px',
                  backgroundColor: i === activeTestimonial ? '#33275f' : '#d4aeea',
                }}
              />
            ))}
          </div>

          <Link
            href={t.testimonials.link}
            className="text-[#9187BA] font-bold hover:text-[#33275f] transition-colors inline-flex items-center gap-2"
          >
            {t.testimonials.btn} <span className="text-lg">→</span>
          </Link>
        </div>
      </section>

      {/* 5. VIDEOS PREVIEW */}
      <section className="py-16 bg-[#33275f] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
            {lang === 'en' ? 'Connecting with the Frequency' : 'Conectando con la Frecuencia'}
          </h2>
          <div className="w-12 h-1 bg-[#c2a2e8] mx-auto mb-10"></div>
          
          <div className="max-w-2xl mx-auto relative rounded-2xl overflow-hidden shadow-2xl mb-8">
            {latestVideo ? (
              <div className="aspect-video w-full bg-black">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${latestVideo.id}`} 
                  title={latestVideo.title}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <Link href={lang === 'en' ? '/en/videos' : '/videos'} className="block relative aspect-video w-full bg-black/50 group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </div>
              </Link>
            )}
          </div>

          <Link
            href={lang === 'en' ? '/en/videos' : '/videos'}
            className="inline-block border-2 border-[#c2a2e8] text-[#c2a2e8] hover:bg-[#c2a2e8] hover:text-[#33275f] px-6 py-2 rounded-full font-bold transition-all duration-300"
          >
            {lang === 'en' ? 'Watch more videos' : 'Ver más videos'}
          </Link>
        </div>
      </section>

      {/* 6. BLOG PREVIEW */}
      <section className="py-16 bg-[#f9f9f9]">
        <div className="max-w-5xl mx-auto px-6 mb-10 text-center">
          <h2 className="text-2xl md:text-3xl text-[#33275f] font-bold mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
            {t.blog.title}
          </h2>
          <div className="w-12 h-1 bg-[#c2a2e8] mx-auto"></div>
        </div>
        
        <div className="pb-8">
          <BlogGrid enPosts={enPosts} limit={3} />
        </div>

        <div className="text-center mt-2">
          <Link
            href={t.blog.link}
            className="inline-block border-2 border-[#9187BA] text-[#9187BA] hover:bg-[#9187BA] hover:text-white px-6 py-2 rounded-full font-bold transition-all duration-300"
          >
            {t.blog.btn}
          </Link>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-16 bg-[#33275f] text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl text-white font-light mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
            {t.cta.title}
          </h2>
          <p className="text-[#e8daf5] text-lg mb-8" style={{ fontFamily: "'Open Sans', sans-serif" }}>
            {t.cta.text}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://api.whatsapp.com/send/?phone=5491141771120"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25d366] hover:bg-[#1da851] text-white px-6 py-2 rounded-full font-bold transition-colors flex items-center justify-center gap-2"
            >
              {t.cta.btn1}
            </a>
            <a
              href="mailto:contacto@sanacionenluz.com"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#33275f] px-6 py-2 rounded-full font-bold transition-colors flex items-center justify-center gap-2"
            >
              {t.cta.btn2}
            </a>
          </div>
        </div>
      </section>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
      `}} />
    </div>
  )
}
