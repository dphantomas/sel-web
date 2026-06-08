import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const contentDirectory = path.join(process.cwd(), 'content', 'blog')

/**
 * Get posts filtered by language ('es' | 'en')
 * Reads markdown files from content/blog/[lang]
 */
export async function getPostsByLang(lang = 'es', { perPage = 50 } = {}) {
  const langDir = path.join(contentDirectory, lang)
  
  if (!fs.existsSync(langDir)) {
    return []
  }

  const fileNames = fs.readdirSync(langDir)
  
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(langDir, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents)

      return {
        slug,
        title: { rendered: matterResult.data.title },
        date: matterResult.data.date,
        language: matterResult.data.language,
        _embedded: {
          'wp:featuredmedia': [
            { source_url: matterResult.data.image }
          ]
        },
        ...matterResult.data,
      }
    })
    
  // Sort posts by date
  const sortedPosts = allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })

  return sortedPosts.slice(0, perPage)
}

/**
 * Fetch a single post by slug and convert its markdown to HTML
 */
export async function getPostBySlugAndLang(slug, lang = 'es') {
  const fullPath = path.join(contentDirectory, lang, `${slug}.md`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html, { sanitize: false })
    .process(matterResult.content)
    
  const contentHtml = processedContent.toString()

  return {
    slug,
    title: { rendered: matterResult.data.title },
    date: matterResult.data.date,
    content: { rendered: contentHtml },
    _embedded: {
      'wp:featuredmedia': [
        { source_url: matterResult.data.image }
      ]
    },
    ...matterResult.data,
  }
}

/**
 * Format date string to locale format
 * @param {string} dateString
 * @param {'es'|'en'} lang
 */
export function formatDate(dateString, lang = 'es') {
  if (!dateString) return ''
  const date = new Date(dateString)
  const locale = lang === 'en' ? 'en-US' : 'es-AR'
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Extract featured image URL
 */
export function getFeaturedImage(post) {
  try {
    const url = post._embedded?.['wp:featuredmedia']?.[0]?.source_url
    return url || null
  } catch {
    return null
  }
}
