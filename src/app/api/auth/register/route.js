import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { firstName, lastName, email, phone, password } = await request.json()

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados.' },
        { status: 400 }
      )
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El formato del correo electrónico no es válido.' },
        { status: 400 }
      )
    }

    // Validación de contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      )
    }

    const emailLower = email.toLowerCase().trim()

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado.' },
        { status: 400 }
      )
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: emailLower,
        phone: phone || null,
        passwordHash,
        role: 'Guest' // Rol por defecto (Invitado hasta que asiste a un taller)
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    })
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado durante el registro.' },
      { status: 500 }
    )
  }
}
