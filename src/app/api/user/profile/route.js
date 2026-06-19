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
  const parts = url.split('/upload/')
  if (parts.length < 2) return null
  const pathParts = parts[1].split('/')
  if (/^v\d+$/.test(pathParts[0])) pathParts.shift()
  const fileWithExtension = pathParts.join('/')
  const lastDotIndex = fileWithExtension.lastIndexOf('.')
  if (lastDotIndex === -1) return fileWithExtension
  return fileWithExtension.substring(0, lastDotIndex)
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
    const imageFile = formData.get('image')

    let imageUrl = undefined

    // Subir imagen a Cloudinary si existe
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const folder = `${process.env.CLOUDINARY_ROOT_FOLDER || 'sanacion-en-luz'}/${process.env.CLOUDINARY_PROFIL_FOLDER || 'perfil-usuario'}`

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
            await cloudinary.uploader.destroy(publicId)
          } catch (e) {
            console.error('Error eliminando imagen anterior de Cloudinary:', e)
          }
        }
      }
    }

    // Actualizar solo los datos permitidos del propio usuario
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        phone: phone !== null ? phone : undefined,
        ...(imageUrl && { image: imageUrl })
      }
    })

    return NextResponse.json({ message: 'Perfil actualizado', user: updatedUser })
  } catch (error) {
    console.error('Error actualizando perfil:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
