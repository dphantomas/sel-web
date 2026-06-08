import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'

const urls = [
  'https://www.sanacionenluz.com/wp-content/uploads/2023/11/sel-foto-21-400x250.jpg',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/11/sel-foto-2-400x250.jpg',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/11/sel-foto-1-400x250.jpg',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/10/logo-principal-1.png',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/12/flecha-blanca.png',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/10/fondo-blog-1.jpg',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/12/flecha2.png',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/11/darioymonica.jpg',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/11/logo-sel-footer-1.png',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/11/ig.png',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/11/face.png',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/11/twitter.png',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/11/wapp.png',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/11/mail.png',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/11/sel-foto-19-400x250.jpg',
  'https://www.sanacionenluz.com/wp-content/uploads/2023/11/sel-foto-4-400x250.jpg',
  'https://www.sanacionenluz.com/blog/'
]

async function run() {
  const assetsDir = path.join(process.cwd(), 'public', 'assets')
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true })

  for (const url of urls) {
    if (url.endsWith('/blog/')) continue;
    
    const fileName = path.basename(url)
    console.log(`Downloading ${url}...`)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to download ${url}`)
      const dest = path.join(assetsDir, fileName)
      await pipeline(res.body, fs.createWriteStream(dest))
      console.log(`Saved ${fileName}`)
    } catch (err) {
      console.error(err.message)
    }
  }
}

run().catch(console.error)
