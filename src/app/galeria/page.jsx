import Gallery from '@/components/Gallery'
import prisma from '@/lib/prisma'

export const metadata = {
  title: 'Galería | Sanación en Luz',
  description: 'Galería de fotos de encuentros, talleres y retiros de Sanación en Luz.',
}

export default async function GaleriaPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { order: 'asc' },
  })
  
  return <Gallery initialImages={images} />
}
