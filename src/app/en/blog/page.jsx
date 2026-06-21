import { getPostsByLang, getFeaturedImage, formatDate } from '@/lib/blog'
import Link from 'next/link'

export const metadata = {
  title: 'Blog | Sanación en Luz',
  description: 'Articles about Sanación en Luz, the New Human, and the Age of Light.',
}

export default async function EnBlogPage() {
  const posts = await getPostsByLang('en', { perPage: 50 })

  return (
    <section className="bg-white">
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
        className="relative pt-8 pb-16 md:pt-10 md:pb-24 bg-cover bg-center bg-fixed"
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
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '16px', color: '#999' }}>
              No posts available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const img = getFeaturedImage(post)
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}/`}
                  className="blog-card group"
                  style={{ textDecoration: 'none' }}
                >
                  {img && (
                    <div className="overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <img
                        src={img}
                        alt={post.title.rendered}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p
                      style={{
                        fontFamily: "'Open Sans', sans-serif",
                        fontSize: '11px',
                        color: '#c2a2e8',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        marginBottom: '6px',
                      }}
                    >
                      {formatDate(post.date, 'en')}
                    </p>
                    <h2
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontSize: '16px',
                        color: '#33275f',
                        fontWeight: 600,
                        lineHeight: '1.4em',
                      }}
                      dangerouslySetInnerHTML={{ __html: post.title?.rendered || post.title || '' }}
                    />
                    {post.excerpt?.rendered ? (
                      <div
                        className="mt-2 blog-excerpt"
                        dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                      />
                    ) : (
                      <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '13px', color: '#666', marginTop: '8px' }}>
                        Read full article here...
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
        </div>
      </div>
    </section>
  )
}
