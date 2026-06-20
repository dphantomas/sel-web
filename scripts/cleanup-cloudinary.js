import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v2 as cloudinary } from 'cloudinary'

import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function main() {
  const rootFolder = process.env.CLOUDINARY_ROOT_FOLDER || 'sanacion-en-luz'
  const galleryFolder = process.env.CLOUDINARY_GALLERY_FOLDER || 'galeria'
  const folder = `${rootFolder}/${galleryFolder}`

  console.log('Obteniendo imágenes de la base de datos...')
  const dbImages = await prisma.galleryImage.findMany()
  const validPublicIds = new Set(dbImages.map(img => img.publicId))
  console.log(`Hay ${validPublicIds.size} imágenes en la base de datos.`)

  console.log(`Obteniendo imágenes de Cloudinary en la carpeta: ${folder}...`)
  
  let cloudinaryImages = []
  let nextCursor = null

  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder + '/',
      max_results: 500,
      next_cursor: nextCursor
    })
    cloudinaryImages = cloudinaryImages.concat(result.resources)
    nextCursor = result.next_cursor
  } while (nextCursor)

  console.log(`Hay ${cloudinaryImages.length} imágenes en Cloudinary.`)

  let deletedCount = 0

  for (const img of cloudinaryImages) {
    if (!validPublicIds.has(img.public_id)) {
      console.log(`Borrando imagen huérfana en Cloudinary: ${img.public_id}`)
      await cloudinary.uploader.destroy(img.public_id)
      deletedCount++
    }
  }

  console.log(`Limpieza completa. Se borraron ${deletedCount} imágenes huérfanas.`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
