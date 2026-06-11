import Link from 'next/link'

export default function Hero() {
  return (
    <section
      className="hero-bg relative min-h-screen flex flex-col items-center justify-center"
    >
      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 py-20">

        {/* Main Logo — 70% width on desktop, 100% on mobile (matching original CSS) */}
        <div className="mb-0">
          <img
            src="/assets/logo-principal-1.png"
            alt="Sanación en Luz"
            className="mx-auto w-auto"
            style={{ maxWidth: '880px', width: '70vw' }}
          />
        </div>

        {/* Tagline — EXACT text, Lato italic 30px white, line-height 1.2em */}
        {/* padding-top 15px, padding-bottom 60px (from original inline CSS) */}
        <p
          className="text-white text-center"
          style={{
            fontFamily: "'Lato', Helvetica, Arial, Lucida, sans-serif",
            fontStyle: 'italic',
            fontSize: '30px',
            lineHeight: '1.2em',
            paddingTop: '15px',
            paddingBottom: '60px',
          }}
        >
          &ldquo;Nada de lo que has hecho hasta ahora define quién Eres&rdquo;
        </p>

        {/* Botón de Ingreso Principal */}
        <div className="mt-2">
          <Link
            href="/login"
            className="inline-block border-2 border-white text-white hover:bg-white hover:text-[#33275f] font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 shadow-lg"
          >
            Ingresar a mi cuenta
          </Link>
        </div>
      </div>
    </section>
  )
}
