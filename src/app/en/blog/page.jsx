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
        className="section-header-bg flex items-end justify-center"
        style={{ minHeight: '220px', paddingBottom: '40px', paddingTop: '80px' }}
      >
        <h1
          style={{
            fontFamily: "'Lato', Helvetica, Arial, Lucida, sans-serif",
            fontSize: '28px',
            letterSpacing: '2px',
            color: '#ffffff',
            margin: 0,
            fontWeight: 400,
          }}
        >
          Blog
        </h1>
      </div>

      <div className="text-center mt-8 mb-10">
        <img
          src="/assets/flecha.png"
          alt=""
          style={{ width: '50px', height: 'auto', margin: '0 auto' }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
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
    </section>
  )
}
