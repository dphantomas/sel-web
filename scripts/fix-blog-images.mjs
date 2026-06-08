import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'

const images = [
  { url: 'https://www.sanacionenluz.com/wp-content/uploads/2023/11/sel-foto-1.jpg', name: 'sel-foto-1.jpg' },
  { url: 'https://www.sanacionenluz.com/wp-content/uploads/2023/11/sel-foto-2.jpg', name: 'sel-foto-2.jpg' },
  { url: 'https://www.sanacionenluz.com/wp-content/uploads/2023/11/sel-foto-4.jpg', name: 'sel-foto-4.jpg' },
  { url: 'https://www.sanacionenluz.com/wp-content/uploads/2023/11/sel-foto-19.jpg', name: 'sel-foto-19.jpg' },
  { url: 'https://www.sanacionenluz.com/wp-content/uploads/2023/11/sel-foto-21.jpg', name: 'sel-foto-21.jpg' }
]

async function run() {
  for (const img of images) {
    console.log(`Downloading ${img.url}...`)
    const res = await fetch(img.url)
    if (!res.ok) throw new Error(`Failed to download ${img.url}`)
    const dest = path.join(process.cwd(), 'public', 'blog-images', img.name)
    await pipeline(res.body, fs.createWriteStream(dest))
    console.log(`Saved ${img.name}`)
  }
}

run().catch(console.error)
