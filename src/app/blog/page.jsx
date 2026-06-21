import { getPostsByLang, getFeaturedImage, formatDate } from '@/lib/blog'
import Link from 'next/link'

export const metadata = {
  title: 'Blog | Sanación en Luz',
  description: 'Artículos sobre Sanación en Luz, Ascensión, el Nuevo Humano y la Era de la Luz.',
}

export default async function BlogPage() {
  let posts = []
  try {
    posts = await getPostsByLang('es', { perPage: 50 })
  } catch (e) {
    console.error('Failed to fetch posts:', e)
  }

  return (
    <section className="bg-white">
      {/* Section header */}
      <div
        className="section-header-bg flex flex-col items-center justify-center"
        style={{ minHeight: '160px', paddingTop: '60px', paddingBottom: '20px' }}
      >
        <h1 className="text-white text-[28px] md:text-[34px] tracking-[5px] md:tracking-[10px] font-light text-center pl-[5px] md:pl-[10px]">
          Blog
        </h1>
      </div>

      {/* Main content area with parallax background */}
      <div 
        className="relative py-16 md:py-24 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/assets/fondo-quienes.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/10"></div> 

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6">
          {/* Arrow ornament */}
          <div className="text-center mb-16">
            <img
              src="/assets/flecha2.png"
              alt=""
              style={{ width: '60px', height: 'auto', margin: '0 auto' }}
            />
          </div>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const imageUrl = getFeaturedImage(post)
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}/`}
                  className="blog-card block bg-white overflow-hidden"
                  style={{ textDecoration: 'none' }}
                >
                  {imageUrl && (
                    <div className="relative overflow-hidden" style={{ height: '250px' }}>
                      <img
                        src={imageUrl}
                        alt={post.title.rendered}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="blog-card-overlay absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold" style={{ fontFamily: "'Lato', sans-serif" }}>
                          leer más
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-5 text-center">
                    <h2
                      style={{
                        fontFamily: "'Lato', Helvetica, Arial, Lucida, sans-serif",
                        fontSize: '17px',
                        color: '#33275f',
                        fontWeight: 500,
                        marginBottom: '8px',
                        lineHeight: '1.3em',
                      }}
                      dangerouslySetInnerHTML={{ __html: post.title?.rendered || post.title || '' }}
                    />
                    <p style={{ color: '#c2a2e8', fontSize: '14px', fontFamily: "'Open Sans', sans-serif", marginBottom: '8px' }}>
                      {formatDate(post.date)}
                    </p>
                    {post.excerpt?.rendered ? (
                      <div
                        style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '14px', color: '#666', lineHeight: '1.6em' }}
                        dangerouslySetInnerHTML={{ __html: post.excerpt.rendered || '' }}
                      />
                    ) : (
                      <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '14px', color: '#666', lineHeight: '1.6em' }}>
                        Lee el artículo completo aquí...
                      </p>
                    )}
                    <span style={{ display: 'inline-block', marginTop: '12px', color: '#2ea3f2', fontSize: '14px', fontWeight: 700 }}>
                      leer más
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          /* Fallback: show static posts if WP API is unavailable */
          <div className="text-center py-10">
            <p style={{ color: '#666', fontFamily: "'Open Sans', sans-serif" }}>
              Cargando artículos desde WordPress...
            </p>
            <a
              href="/blog/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-2"
              style={{ backgroundColor: '#33275f', color: '#fff', fontFamily: "'Lato', sans-serif", textDecoration: 'none' }}
            >
              Ver blog en sanacionenluz.com
            </a>
          </div>
        )}
        </div>
      </div>
    </section>
  )
}
