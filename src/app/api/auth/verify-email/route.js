import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req) {
  try {
    const { token } = await req.json()
    
    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado.' }, { status: 400 })
    }

    // Buscar token
    const verificationRecord = await prisma.emailVerificationToken.findUnique({
      where: { token }
    })

    if (!verificationRecord) {
      return NextResponse.json({ error: 'El enlace de verificación es inválido o ya ha sido utilizado.' }, { status: 400 })
    }

    // Comprobar expiración
    if (verificationRecord.expires < new Date()) {
      return NextResponse.json({ error: 'El enlace de verificación ha expirado. Por favor, regístrate nuevamente.' }, { status: 400 })
    }

    // Actualizar usuario
    const user = await prisma.user.findUnique({
      where: { email: verificationRecord.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 })
    }

    await prisma.user.update({
      where: { email: verificationRecord.email },
      data: { emailVerified: new Date() }
    })

    // Eliminar token usado
    await prisma.emailVerificationToken.delete({
      where: { id: verificationRecord.id }
    })

    return NextResponse.json({ success: true, message: 'Correo verificado exitosamente.' })
  } catch (error) {
    console.error('Error al verificar email:', error)
    return NextResponse.json({ error: 'Ocurrió un error inesperado.' }, { status: 500 })
  }
}
