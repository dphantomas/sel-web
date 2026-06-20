'use server'

import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { v2 as cloudinary } from 'cloudinary'
import { revalidatePath } from 'next/cache'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function createUser(prevState, formData) {
  try {
    const firstName = formData.get('firstName')
    const lastName = formData.get('lastName')
    const email = formData.get('email')
    const password = formData.get('password')
    const phone = formData.get('phone')
    const addressLine1 = formData.get('addressLine1')
    const addressLine2 = formData.get('addressLine2')
    const zipCode = formData.get('zipCode')
    const country = formData.get('country')
    const sparkName = formData.get('sparkName')
    const imageFile = formData.get('image')

    const fields = { firstName, lastName, email, phone, addressLine1, addressLine2, zipCode, country, sparkName }

    // Validaciones básicas
    if (!firstName || !lastName || !email || !password) {
      return { success: false, error: 'Por favor completa todos los campos obligatorios.', fields, timestamp: Date.now() }
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: 'La dirección de correo electrónico no es válida.', fields, timestamp: Date.now() }
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { success: false, error: 'Ya existe un usuario registrado con ese correo electrónico.', fields, timestamp: Date.now() }
    }

    let imageUrl = null

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
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear usuario en base de datos
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        phone,
        addressLine1,
        addressLine2,
        zipCode,
        country,
        sparkName,
        image: imageUrl,
      }
    })

    revalidatePath('/admin')
    
    return { success: true, message: 'Usuario creado correctamente.' }

  } catch (error) {
    console.error('Error creating user:', error)
    
    const fields = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      addressLine1: formData.get('addressLine1'),
      addressLine2: formData.get('addressLine2'),
      zipCode: formData.get('zipCode'),
      country: formData.get('country')
    }

    return { success: false, error: 'Ocurrió un error inesperado al crear el usuario.', fields, timestamp: Date.now() }
  }
}
