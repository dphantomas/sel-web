import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null
  try {
    const parts = url.split('/upload/')
    if (parts.length < 2) return null
    let pathParts = parts[1].split('/')
    
    // Remover transformaciones (ej. c_fill, w_200, f_auto) si existen
    if (pathParts[0].includes(',') || /^[a-z]_[a-zA-Z0-9]+/.test(pathParts[0])) {
      pathParts.shift()
    }
    // Remover versión (ej. v1718826505) si existe
    if (/^v\d+$/.test(pathParts[0])) {
      pathParts.shift()
    }
    
    const fileWithExtension = pathParts.join('/')
    const lastDotIndex = fileWithExtension.lastIndexOf('.')
    if (lastDotIndex === -1) return fileWithExtension
    return fileWithExtension.substring(0, lastDotIndex)
  } catch (e) {
    return null
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions)

    // Validar autenticación
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const firstName = formData.get('firstName')
    const lastName = formData.get('lastName')
    const phone = formData.get('phone')
    const addressLine1 = formData.get('addressLine1')
    const addressLine2 = formData.get('addressLine2')
    const zipCode = formData.get('zipCode')
    const country = formData.get('country')
    const sparkName = formData.get('sparkName')
    const imageFile = formData.get('image')
    const removeImage = formData.get('removeImage')

    let imageUrl = undefined
    let setHideGooglePhoto = undefined

    // Subir imagen a Cloudinary si existe
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const folder = `${process.env.CLOUDINARY_ROOT_FOLDER}/${process.env.CLOUDINARY_PROFILE_FOLDER}`

      imageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: folder, transformation: [{ width: 500, height: 500, crop: 'fill' }] },
          (error, result) => {
            if (error) reject(error)
            else resolve(result.secure_url)
          }
        )
        uploadStream.end(buffer)
      })

      // Si subió una nueva exitosamente, borramos la vieja
      const existingUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { image: true }
      })

      if (existingUser?.image) {
        const publicId = getPublicIdFromUrl(existingUser.image)
        if (publicId) {
          try {
            const result = await cloudinary.uploader.destroy(publicId, { invalidate: true })
            console.log('Cloudinary delete result:', result)
          } catch (e) {
            console.error('Error eliminando imagen anterior de Cloudinary:', e)
          }
        }
      }
      setHideGooglePhoto = false // Si subió foto nueva, reseteamos este flag
    } else if (removeImage === 'true') {
      const existingUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { image: true }
      })

      if (existingUser?.image) {
        const publicId = getPublicIdFromUrl(existingUser.image)
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId, { invalidate: true })
          } catch (e) {
            console.error('Error eliminando imagen anterior de Cloudinary:', e)
          }
        }
      }
      imageUrl = null // Para que pise la bd con null
      setHideGooglePhoto = true
    }

    // Actualizar solo los datos permitidos del propio usuario
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(firstName && { firstName: firstName.trim() }),
        ...(lastName && { lastName: lastName.trim() }),
        phone: phone !== null ? phone.trim() : undefined,
        addressLine1: addressLine1 !== null ? addressLine1.trim() : undefined,
        addressLine2: addressLine2 !== null ? addressLine2.trim() : undefined,
        zipCode: zipCode !== null ? zipCode.trim() : undefined,
        country: country !== null ? country.trim() : undefined,
        sparkName: sparkName !== null ? sparkName.trim() : undefined,
        ...(imageUrl !== undefined && { image: imageUrl }),
        ...(setHideGooglePhoto !== undefined && { hideGooglePhoto: setHideGooglePhoto })
      }
    })

    return NextResponse.json({ message: 'Perfil actualizado', user: updatedUser })
  } catch (error) {
    console.error('Error actualizando perfil:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
