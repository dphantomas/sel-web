import { getPostBySlugAndLang, getPostsByLang, getFeaturedImage, formatDate } from '@/lib/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'

export async function generateStaticParams() {
  const esDir = path.join(process.cwd(), 'content', 'blog', 'es')
  const enDir = path.join(process.cwd(), 'content', 'blog', 'en')
  let slugs = []
  
  if (fs.existsSync(esDir)) {
    const esFiles = fs.readdirSync(esDir).filter(f => f.endsWith('.md'))
    slugs = slugs.concat(esFiles.map(f => ({ slug: f.replace('.md', '') })))
  }
  
  if (fs.existsSync(enDir)) {
    const enFiles = fs.readdirSync(enDir).filter(f => f.endsWith('.md'))
    slugs = slugs.concat(enFiles.map(f => ({ slug: f.replace('.md', '') })))
  }
  
  return slugs
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  let post = await getPostBySlugAndLang(slug, 'es')
  if (!post) post = await getPostBySlugAndLang(slug, 'en')
  if (!post) return { title: 'Artículo no encontrado | Sanación en Luz' }
  return {
    title: `${post.title.rendered} | Sanación en Luz`,
    description: post.excerpt?.rendered?.replace(/<[^>]*>/g, '').slice(0, 160) ?? '',
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  let post = await getPostBySlugAndLang(slug, 'es')
  if (!post) post = await getPostBySlugAndLang(slug, 'en')
  
  if (!post) notFound()

  const lang = post.language || 'es'
  const backHref = lang === 'en' ? '/en/blog/' : '/blog/'
  const backLabel = lang === 'en' ? '← Back to Blog' : '← Volver al Blog'

  // Fetch sibling posts in same language for prev/next
  const sameLang = await getPostsByLang(lang, { perPage: 100 })
  const idx = sameLang.findIndex((p) => p.slug === slug)
  const prevPost = idx < sameLang.length - 1 ? sameLang[idx + 1] : null
  const nextPost = idx > 0 ? sameLang[idx - 1] : null

  const imageUrl = getFeaturedImage(post)

  return (
    <article className="bg-white">
      {/* Header with featured image */}
      <div
        className="relative flex items-end justify-center"
        style={{
          minHeight: '300px',
          paddingBottom: '40px',
          paddingTop: '100px',
          backgroundImage: imageUrl
            ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(51,39,95,0.7)), url(${imageUrl})`
            : 'linear-gradient(to bottom, #33275f, #5a4a8a)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center px-6 max-w-3xl">
          <h1
            style={{
              fontFamily: "'Lato', Helvetica, Arial, Lucida, sans-serif",
              fontSize: '32px',
              color: '#ffffff',
              margin: 0,
              fontWeight: 700,
              lineHeight: '1.3em',
            }}
            dangerouslySetInnerHTML={{ __html: post.title?.rendered || post.title || '' }}
          />
          <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '12px' }}>
            {formatDate(post.date, lang)}
          </p>
        </div>
      </div>

      {/* Arrow ornament */}
      <div className="text-center mt-8 mb-8">
        <img src="/assets/flecha.png" alt=""
          style={{ width: '50px', height: 'auto', margin: '0 auto' }} />
      </div>

      {/* Post content */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 pb-8">
        <div
          className="wp-content"
          style={{ fontFamily: "'Open Sans', Arial, sans-serif", fontSize: '15px', color: '#666', lineHeight: '1.7em' }}
          dangerouslySetInnerHTML={{ __html: post.content?.rendered || post.content || '' }}
        />
      </div>

      {/* Prev / Next navigation */}
      <div
        className="max-w-3xl mx-auto px-4 md:px-6 pb-16"
        style={{ borderTop: '1px solid #e3e1e8', paddingTop: '32px' }}
      >
        <div className="flex justify-between items-start gap-4">
          {/* Previous (older) */}
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}/`}
              style={{ textDecoration: 'none', maxWidth: '45%' }}
            >
              <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '11px', color: '#c2a2e8', marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                ← {lang === 'en' ? 'Previous' : 'Anterior'}
              </p>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '14px', color: '#33275f', fontWeight: 600, lineHeight: '1.4em' }}
                dangerouslySetInnerHTML={{ __html: prevPost.title?.rendered || prevPost.title || '' }} />
            </Link>
          ) : <span />}

          {/* Next (newer) */}
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}/`}
              style={{ textDecoration: 'none', maxWidth: '45%', textAlign: 'right' }}
            >
              <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '11px', color: '#c2a2e8', marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {lang === 'en' ? 'Next' : 'Siguiente'} →
              </p>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '14px', color: '#33275f', fontWeight: 600, lineHeight: '1.4em' }}
                dangerouslySetInnerHTML={{ __html: nextPost.title?.rendered || nextPost.title || '' }} />
            </Link>
          ) : <span />}
        </div>

        {/* Back to blog */}
        <div className="mt-8 text-center">
          <Link
            href={backHref}
            style={{ fontFamily: "'Lato', sans-serif", fontSize: '14px', fontWeight: 700, color: '#33275f', textDecoration: 'none' }}
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </article>
  )
}
