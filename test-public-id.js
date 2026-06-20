const url = "https://res.cloudinary.com/dgg-sel/image/upload/v1718826505/sel-web/avatars/user123.jpg"

const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null
  const parts = url.split('/upload/')
  if (parts.length < 2) return null
  const pathParts = parts[1].split('/')
  if (/^v\d+$/.test(pathParts[0])) pathParts.shift()
  const fileWithExtension = pathParts.join('/')
  const lastDotIndex = fileWithExtension.lastIndexOf('.')
  if (lastDotIndex === -1) return fileWithExtension
  return fileWithExtension.substring(0, lastDotIndex)
}

console.log(getPublicIdFromUrl(url))
