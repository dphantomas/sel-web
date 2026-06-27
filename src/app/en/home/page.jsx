import HomeContent from '@/components/HomeContent'
import { getPostsByLang } from '@/lib/blog'

const BASE = '/assets'

const staticEnPosts = [
  {
    slug: 'duality',
    title: 'Duality',
    date: '11/28/2023',
    image: `${BASE}/sel-foto-21-400x250.jpg`,
    excerpt: 'The process of Ascension requires going beyond the illusion, to encounter our Truth.',
  },
  {
    slug: 'how-does-sanacion-en-luz-work',
    title: 'How does Sanacion en Luz work?',
    date: '11/01/2023',
    image: `${BASE}/sel-foto-2-400x250.jpg`,
    excerpt: '"Sanacion en Luz has begun. This process begins to be Sanacion en Luz."',
  },
  {
    slug: 'what-is-sanacion-en-luz',
    title: 'What is "Sanacion en Luz"?',
    date: '10/31/2023',
    image: `${BASE}/sel-foto-1-400x250.jpg`,
    excerpt: 'The Age of Light brings us many surprises regarding the Evolution and Ascension of the human being.',
  },
]

export const metadata = {
  title: 'Home | Sanación en Luz',
  description: 'Sanación en Luz is a process designed for evolution into the New Human and the return to your original Purity.',
}

export default async function EnHomePage() {
  // Try to load live English posts; fall back to static if API fails
  let posts = []
  try {
    const rawPosts = await getPostsByLang('en', { perPage: 3 }) // Fetch only latest 3 for home
    posts = rawPosts.map(post => ({
      slug: post.slug,
      title: post.title?.rendered || post.title,
      date: formatDate(post.date, 'en'),
      image: getFeaturedImage(post),
      excerpt: post.excerpt?.rendered || post.excerpt
    }))
  } catch {
    posts = []
  }
  const displayPosts = posts.length > 0 ? posts : staticEnPosts

  return <HomeContent lang="en" enPosts={displayPosts} cloudinaryUrl={process.env.CLOUDINARY_ROOT_URL} />
}
