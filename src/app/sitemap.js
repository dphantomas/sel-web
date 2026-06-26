import { prisma } from '@/lib/db'

export default async function sitemap() {
  const baseUrl = 'https://www.sanacionenluz.com'

  const staticRoutes = [
    '',
    '/talleres',
    '/quienes-somos',
    '/testimonios',
    '/galeria',
    '/contacto',
    '/blog',
    '/videos',
    '/en/home',
    '/en/workshops',
    '/en/about-us',
    '/en/testimonials',
    '/en/gallery',
    '/en/contact',
    '/en/blog',
    '/en/videos'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' || route === '/en/home' ? 1 : 0.8,
  }))

  // Add dynamic blog posts if needed later.
  
  return [...staticRoutes]
}
