import fs from 'fs'
import path from 'path'

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f)
    const isDirectory = fs.statSync(dirPath).isDirectory()
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f))
  })
}

function fixBasePaths() {
  const targetDir = path.join(process.cwd(), 'src')
  
  walkDir(targetDir, (filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8')
      const regex = /\$\{BASE\}\/\d{4}\/\d{2}\//g
      
      if (regex.test(content)) {
        console.log(`Fixing BASE paths in ${filePath}`)
        content = content.replace(regex, '${BASE}/')
        fs.writeFileSync(filePath, content, 'utf8')
      }
    }
  })
}

fixBasePaths()
