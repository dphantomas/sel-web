import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { paramsToSign } = body

    if (!paramsToSign) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    // Asegurar que el folder siempre sea el de la galería y esté controlado por el servidor
    const rootFolder = process.env.CLOUDINARY_ROOT_FOLDER
    const galleryFolder = process.env.CLOUDINARY_GALLERY_FOLDER
    const secureFolder = `${rootFolder}/${galleryFolder}`

    const finalParamsToSign = {
      ...paramsToSign,
      folder: secureFolder,
    }

    const signature = cloudinary.utils.api_sign_request(finalParamsToSign, process.env.CLOUDINARY_API_SECRET)

    return NextResponse.json({ signature, folder: secureFolder })
  } catch (error) {
    console.error('Error al generar firma de Cloudinary:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
