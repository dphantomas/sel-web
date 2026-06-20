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
  const galeriaPath = path.join(__dirname, '../content/galeria.json')
  const publicDir = path.join(__dirname, '../public')
  
  if (!fs.existsSync(galeriaPath)) {
    console.error('No se encontro content/galeria.json')
    return
  }

  const galeria = JSON.parse(fs.readFileSync(galeriaPath, 'utf8'))
  console.log(`Encontradas ${galeria.length} imagenes en galeria.json`)

  const rootFolder = process.env.NEXT_PUBLIC_CLOUDINARY_ROOT_FOLDER || 'sanacion-en-luz'
  const galleryFolder = process.env.NEXT_PUBLIC_CLOUDINARY_GALLERY_FOLDER || 'galeria'
  const folder = `${rootFolder}/${galleryFolder}`

  for (let i = 0; i < galeria.length; i++) {
    const item = galeria[i]
    const localFilePath = path.join(publicDir, item.url)
    
    if (!fs.existsSync(localFilePath)) {
      console.warn(`[!] No se encontro el archivo local: ${localFilePath}`)
      continue
    }

    try {
      console.log(`[${i+1}/${galeria.length}] Subiendo ${item.url}...`)
      const uploadResult = await cloudinary.uploader.upload(localFilePath, {
        folder: folder,
      })

      await prisma.galleryImage.create({
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          alt: item.alt || 'Sanación en Luz — Galería',
          order: i,
        }
      })
      console.log(`    -> OK guardado en BD.`)
    } catch (e) {
      console.error(`[X] Error subiendo ${item.url}:`, e)
    }
  }

  console.log('Migración completa.')
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
