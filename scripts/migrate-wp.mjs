import fs from 'fs'
import path from 'path'
import https from 'https'
import TurndownService from 'turndown'

const WP_API = 'https://sanacionenluz.com/wp-json/wp/v2/posts?per_page=100&_embed=true'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
})

// Helper to determine language
function isEnglishPost(post) {
  const slug = post.slug || ''
  const title = (post.title?.rendered || '').toLowerCase()
  
  const spanishSlugs = ['que-es', 'como-funciona', 'dualidad', 'creacion', 'causa-y-efecto', 'que-', 'como-', 'por-que', 'el-', 'la-', 'los-', 'las-', 'nuevo-', 'nueva-', 'sanacion', 'luz', 'ascension', 'iniciacion']
  const englishSlugs = ['what-is', 'how-does', 'how-to', 'duality', 'the-', 'why-', 'about', 'workshop', 'healing', 'light', 'new-human']
  
  if (englishSlugs.some(s => slug.includes(s)) && !spanishSlugs.some(s => slug.includes(s))) return true
  if (spanishSlugs.some(s => slug.includes(s)) && !englishSlugs.some(s => slug.includes(s))) return false
  
  return !(/[áéíóúüñ¿¡]/i.test(title))
}

// Download image helper
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve(null)
    const file = fs.createWriteStream(dest)
    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve(dest)
      })
    }).on('error', (err) => {
      fs.unlink(dest, () => {})
      reject(err)
    })
  })
}

async function migrate() {
  console.log('Fetching posts from WordPress...')
  const res = await fetch(WP_API)
  const posts = await res.json()
  
  console.log(`Found ${posts.length} posts. Starting migration...`)
  
  for (const post of posts) {
    const isEn = isEnglishPost(post)
    const lang = isEn ? 'en' : 'es'
    const slug = post.slug
    const title = post.title.rendered.replace(/"/g, '\\"')
    const date = post.date.split('T')[0] // YYYY-MM-DD
    
    console.log(`Processing [${lang.toUpperCase()}] ${title}...`)
    
    let localImagePath = null
    const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0]?.source_url
    
    if (featuredMedia) {
      const fileName = path.basename(featuredMedia)
      const destPath = path.join(process.cwd(), 'public', 'blog-images', fileName)
      try {
        await downloadImage(featuredMedia, destPath)
        localImagePath = `/blog-images/${fileName}`
        console.log(`   -> Downloaded image: ${fileName}`)
      } catch (err) {
        console.error(`   -> Failed to download image: ${featuredMedia}`)
      }
    }
    
    // Convert HTML to Markdown
    let markdownContent = ''
    if (post.content?.rendered) {
      markdownContent = turndownService.turndown(post.content.rendered)
    }
    
    // Build Frontmatter
    const frontmatter = `---
title: "${title}"
date: "${date}"
image: "${localImagePath || ''}"
slug: "${slug}"
language: "${lang}"
---

${markdownContent}
`

    // Write file
    const mdPath = path.join(process.cwd(), 'content', 'blog', lang, `${slug}.md`)
    fs.writeFileSync(mdPath, frontmatter)
    console.log(`   -> Saved ${mdPath}`)
  }
  
  console.log('Blog Migration Complete!')
}

migrate()
