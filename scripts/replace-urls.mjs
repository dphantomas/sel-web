import fs from 'fs'
import path from 'path'

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f)
    const isDirectory = fs.statSync(dirPath).isDirectory()
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f))
  })
}

function replaceURLs() {
  const targetDir = path.join(process.cwd(), 'src')
  
  walkDir(targetDir, (filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.css')) {
      let content = fs.readFileSync(filePath, 'utf8')
      const regex = /https:\/\/sanacionenluz\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/([^'"\s\)]+)/g
      
      if (regex.test(content)) {
        console.log(`Updating ${filePath}`)
        content = content.replace(regex, '/assets/$1')
        fs.writeFileSync(filePath, content, 'utf8')
      }
    }
  })
}

replaceURLs()
