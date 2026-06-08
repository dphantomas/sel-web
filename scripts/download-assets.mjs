import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'

const urls = [
  'https://sanacionenluz.com/wp-content/uploads/2023/10/cropped-fav-150x150.png',
  'https://sanacionenluz.com/wp-content/uploads/2023/10/cropped-fav-300x300.png',
  'https://sanacionenluz.com/wp-content/uploads/2023/11/mail.png',
  'https://sanacionenluz.com/wp-content/uploads/2023/10/flecha.png',
  'https://sanacionenluz.com/wp-content/uploads/2023/10/cabezal.jpg',
  'https://sanacionenluz.com/wp-content/uploads/2023/11/cabezal2.jpg',
  'https://sanacionenluz.com/wp-content/uploads/2023/11/fondo-quienes.jpg',
  'https://sanacionenluz.com/wp-content/uploads/2023/10/sombra.png',
  'https://sanacionenluz.com/wp-content/uploads/2023/12/taller1-1.jpg',
  'https://sanacionenluz.com/wp-content/uploads/2023/12/Conexion.jpeg',
  'https://sanacionenluz.com/wp-content/uploads/2023/12/taller2.jpg',
  'https://sanacionenluz.com/wp-content/uploads/2023/12/taller3.jpg',
  'https://sanacionenluz.com/wp-content/uploads/2023/12/taller9.jpg',
  'https://sanacionenluz.com/wp-content/uploads/2023/12/taller8.jpg',
  'https://sanacionenluz.com/wp-content/uploads/2023/12/taller7.jpg',
  'https://sanacionenluz.com/wp-content/uploads/2023/12/flecha-blanca.png',
  'https://sanacionenluz.com/wp-content/uploads/2023/11/darioymonica.jpg',
  'https://sanacionenluz.com/wp-content/uploads/2023/10/logo-sel.png',
  'https://sanacionenluz.com/wp-content/uploads/2023/10/logo-principal-1.png',
  'https://sanacionenluz.com/wp-content/uploads/2023/11/wapp.png',
  'https://sanacionenluz.com/wp-content/uploads/2023/11/ig.png',
  'https://sanacionenluz.com/wp-content/uploads/2023/11/face.png'
]

async function run() {
  const assetsDir = path.join(process.cwd(), 'public', 'assets')
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true })

  for (const url of urls) {
    // some use http or https and might redirect. Use https://www
    const fetchUrl = url.replace('https://sanacionenluz.com', 'https://www.sanacionenluz.com')
    const fileName = path.basename(url)
    
    console.log(`Downloading ${fetchUrl}...`)
    try {
      const res = await fetch(fetchUrl)
      if (!res.ok) throw new Error(`Failed to download ${fetchUrl}`)
      const dest = path.join(assetsDir, fileName)
      await pipeline(res.body, fs.createWriteStream(dest))
      console.log(`Saved ${fileName}`)
    } catch (err) {
      console.error(err.message)
    }
  }
}

run().catch(console.error)
