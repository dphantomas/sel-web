import fs from 'fs'
import path from 'path'
import https from 'https'

const BASE12 = 'https://www.sanacionenluz.com/wp-content/uploads/2023/12'

const ALL_IMAGES = [
  // ── Galería numerada ──────────────────────────────────────────────────────
  { id: 1,  url: `${BASE12}/galeria3-1.jpg`,                           alt: 'Sanación en Luz — Galería' },
  { id: 2,  url: `${BASE12}/galeria4-1.jpg`,                           alt: 'Sanación en Luz — Galería' },
  { id: 3,  url: `${BASE12}/galeria5-1.jpg`,                           alt: 'Sanación en Luz — Galería' },
  { id: 4,  url: `${BASE12}/galeria6-1.jpg`,                           alt: 'Sanación en Luz — Galería' },
  { id: 5,  url: `${BASE12}/galeria7-1.jpg`,                           alt: 'Sanación en Luz — Galería' },
  { id: 6,  url: `${BASE12}/galeria8-1.jpg`,                           alt: 'Sanación en Luz — Galería' },
  { id: 7,  url: `${BASE12}/galeria9-1.jpg`,                           alt: 'Sanación en Luz — Galería' },
  // ── Encuentro Noviembre 2022 ──────────────────────────────────────────────
  { id: 8,  url: `${BASE12}/galeria_20221121_162527.jpg`,              alt: 'Encuentro — Noviembre 2022' },
  { id: 9,  url: `${BASE12}/galeria_20221121_204740.jpg`,              alt: 'Encuentro — Noviembre 2022' },
  // ── Encuentro Noviembre 2023 ──────────────────────────────────────────────
  { id: 10, url: `${BASE12}/galeria_20231117_221255.jpg`,              alt: 'Encuentro — Noviembre 2023' },
  { id: 11, url: `${BASE12}/galeria_20231118_102233.jpg`,              alt: 'Encuentro — Noviembre 2023' },
  { id: 12, url: `${BASE12}/galeria_20231118_102238.jpg`,              alt: 'Encuentro — Noviembre 2023' },
  { id: 13, url: `${BASE12}/galeria_20231118_112919.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 14, url: `${BASE12}/galeria_20231118_113020.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 15, url: `${BASE12}/galeria_20231118_113123.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 16, url: `${BASE12}/galeria_20231118_113328.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 17, url: `${BASE12}/galeria_20231118_113422.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 18, url: `${BASE12}/galeria_20231118_113459.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 19, url: `${BASE12}/galeria_20231118_113522.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 20, url: `${BASE12}/galeria_20231118_113808.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 21, url: `${BASE12}/galeria_20231119_101834.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 22, url: `${BASE12}/galeria_20231119_101843.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 23, url: `${BASE12}/galeria_20231119_143451.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 24, url: `${BASE12}/galeria_20231119_143459.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 25, url: `${BASE12}/galeria_20231119_144250.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 26, url: `${BASE12}/galeria_20231119_144313.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 27, url: `${BASE12}/galeria_20231119_144344.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 28, url: `${BASE12}/galeria_20231119_144826.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 29, url: `${BASE12}/galeria_20231119_153133.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 30, url: `${BASE12}/galeria_20231120_172617.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 31, url: `${BASE12}/galeria_20231120_172625.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 32, url: `${BASE12}/galeria_20231120_172655.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 33, url: `${BASE12}/galeria_20231120_173807.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 34, url: `${BASE12}/galeria_20231120_173919.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 35, url: `${BASE12}/galeria_20231120_173933.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 36, url: `${BASE12}/galeria_20231120_173956.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 37, url: `${BASE12}/galeria_20231120_174629.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 38, url: `${BASE12}/galeria_20231120_174641.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 39, url: `${BASE12}/galeria_20231120_174758.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  { id: 40, url: `${BASE12}/galeria_20231120_183030.jpg`,            alt: 'Encuentro — Noviembre 2023' },
  // ── 2022 ─────────────────────────────────────────────────────────────────
  { id: 41, url: `${BASE12}/galeria_IMG-20220415-WA0026.jpg`,        alt: 'Sanación en Luz — 2022' },
  { id: 42, url: `${BASE12}/galeria_IMG-20220414-WA0024.jpg`,       alt: 'Sanación en Luz — 2022' },
  { id: 43, url: `${BASE12}/galeria_IMG-20220414-WA0059.jpg`,       alt: 'Sanación en Luz — 2022' },
  { id: 44, url: `${BASE12}/galeria_IMG-20220415-WA0002.jpg`,       alt: 'Sanación en Luz — 2022' },
  { id: 45, url: `${BASE12}/galeria_IMG-20220415-WA0018.jpg`,       alt: 'Sanación en Luz — 2022' },
  { id: 46, url: `${BASE12}/galeria_IMG-20220415-WA0021.jpg`,       alt: 'Sanación en Luz — 2022' },
  { id: 47, url: `${BASE12}/galeria_IMG-20220415-WA0054.jpg`,       alt: 'Sanación en Luz — 2022' },
  { id: 48, url: `${BASE12}/galeria_IMG-20221120-WA0007.jpg`,       alt: 'Encuentro — Noviembre 2022' },
  { id: 49, url: `${BASE12}/galeria_IMG-20221120-WA0010.jpg`,       alt: 'Encuentro — Noviembre 2022' },
  { id: 50, url: `${BASE12}/galeria_IMG-20221120-WA0020.jpg`,       alt: 'Encuentro — Noviembre 2022' },
  { id: 51, url: `${BASE12}/galeria_IMG-20221121-WA0017.jpg`,       alt: 'Encuentro — Noviembre 2022' },
  { id: 52, url: `${BASE12}/galeria_IMG-20221121-WA0020.jpg`,       alt: 'Encuentro — Noviembre 2022' },
  { id: 53, url: `${BASE12}/galeria_IMG-20221121-WA0021.jpg`,       alt: 'Encuentro — Noviembre 2022' },
  { id: 54, url: `${BASE12}/galeria_IMG-20221121-WA0022.jpg`,       alt: 'Encuentro — Noviembre 2022' },
  { id: 55, url: `${BASE12}/galeria_IMG-20221121-WA0023.jpg`,       alt: 'Encuentro — Noviembre 2022' },
  { id: 56, url: `${BASE12}/galeria_IMG-20221121-WA0024.jpg`,       alt: 'Encuentro — Noviembre 2022' },
  { id: 57, url: `${BASE12}/galeria_IMG-20221121-WA0028.jpg`,       alt: 'Encuentro — Noviembre 2022' },
  { id: 58, url: `${BASE12}/galeria_IMG-20221121-WA0029.jpg`,       alt: 'Encuentro — Noviembre 2022' },
  { id: 59, url: `${BASE12}/galeria_IMG_20221120_093543_944.webp`,  alt: 'Encuentro — Noviembre 2022' },
  { id: 60, url: `${BASE12}/galeria_IMG_20221124_171853.jpg`,       alt: 'Encuentro — Noviembre 2022' },
  { id: 61, url: `${BASE12}/galeria_IMG_20221124_180640_161.webp`,  alt: 'Encuentro — Noviembre 2022' },
]

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`))
        return
      }
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
  console.log(`Starting migration of ${ALL_IMAGES.length} gallery images...`)
  const newGalleryData = []
  
  for (const img of ALL_IMAGES) {
    const fileName = path.basename(img.url)
    const destPath = path.join(process.cwd(), 'public', 'gallery-images', fileName)
    
    try {
      if (!fs.existsSync(destPath)) {
        console.log(`Downloading ${fileName}...`)
        await downloadImage(img.url, destPath)
      } else {
        console.log(`Skipping ${fileName} (already exists)`)
      }
      
      newGalleryData.push({
        id: img.id,
        url: `/gallery-images/${fileName}`,
        alt: img.alt
      })
    } catch (e) {
      console.error(`Failed to migrate ${img.url}: ${e.message}`)
    }
  }
  
  // Write to JSON
  const jsonPath = path.join(process.cwd(), 'content', 'galeria.json')
  fs.writeFileSync(jsonPath, JSON.stringify(newGalleryData, null, 2))
  console.log(`Successfully migrated gallery! Data saved to content/galeria.json`)
}

migrate()
