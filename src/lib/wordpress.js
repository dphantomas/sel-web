const WP_API = 'https://sanacionenluz.com/wp-json/wp/v2'

/**
 * Detect if a post is in English by checking its slug and title.
 * Spanish posts typically contain Spanish words or special chars.
 * English posts use English vocabulary slugs.
 */
export function isEnglishPost(post) {
  const slug = post.slug || ''
  const title = (post.title?.rendered || '').toLowerCase()

  // Explicit Spanish markers in slug
  const spanishSlugs = [
    'que-es', 'como-funciona', 'dualidad', 'creacion', 'causa-y-efecto',
    'que-', 'como-', 'por-que', 'el-', 'la-', 'los-', 'las-',
    'nuevo-', 'nueva-', 'sanacion', 'luz', 'ascension', 'iniciacion',
  ]
  const hasSpanishSlug = spanishSlugs.some((s) => slug.includes(s))

  // Explicit English markers in slug
  const englishSlugs = [
    'what-is', 'how-does', 'how-to', 'duality', 'the-', 'why-',
    'about', 'workshop', 'healing', 'light', 'new-human',
  ]
  const hasEnglishSlug = englishSlugs.some((s) => slug.includes(s))

  if (hasEnglishSlug && !hasSpanishSlug) return true
  if (hasSpanishSlug && !hasEnglishSlug) return false

  // Fallback: check title for Spanish special characters
  const hasSpanishChars = /[áéíóúüñ¿¡]/i.test(title)
  return !hasSpanishChars
}

/**
 * Fetch all published posts from WordPress REST API
 * Used at build time for static generation
 */
export async function getPosts({ perPage = 10, page = 1 } = {}) {
  try {
    const res = await fetch(
      `${WP_API}/posts?per_page=${perPage}&page=${page}&_embed=true`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error(`WP API error: ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return []
  }
}

/**
 * Get posts filtered by language ('es' | 'en')
 */
export async function getPostsByLang(lang = 'es', { perPage = 50 } = {}) {
  const all = await getPosts({ perPage })
  return all.filter((post) =>
    lang === 'en' ? isEnglishPost(post) : !isEnglishPost(post)
  )
}

/**
 * Fetch a single post by slug
 */
export async function getPostBySlug(slug) {
  try {
    const res = await fetch(
      `${WP_API}/posts?slug=${slug}&_embed=true`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error(`WP API error: ${res.status}`)
    const posts = await res.json()
    return posts[0] || null
  } catch (error) {
    console.error(`Failed to fetch post "${slug}":`, error)
    return null
  }
}

/**
 * Get all post slugs for static path generation
 */
export async function getAllPostSlugs() {
  const posts = await getPosts({ perPage: 100 })
  return posts.map((post) => post.slug)
}

/**
 * Extract featured image URL from embedded post data
 */
export function getFeaturedImage(post) {
  try {
    return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
  } catch {
    return null
  }
}

/**
 * Format WordPress date string to locale format
 * @param {string} dateString
 * @param {'es'|'en'} lang
 */
export function formatDate(dateString, lang = 'es') {
  const date = new Date(dateString)
  const locale = lang === 'en' ? 'en-US' : 'es-AR'
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
