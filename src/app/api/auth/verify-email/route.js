import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'

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
      return NextResponse.json({ error: 'El enlace de verificación es inválido, expiró, o tu cuenta ya fue verificada anteriormente.' }, { status: 400 })
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

    // Enviar notificación al administrador
    try {
      await sendEmail({
        to: 'registro@sanacionenluz.com',
        subject: `Usuario verificado: ${user.firstName} ${user.lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h3 style="color: #2e7d32;">Un usuario ha verificado su cuenta</h3>
            <ul style="line-height: 1.6;">
              <li><strong>Nombre:</strong> ${user.firstName} ${user.lastName}</li>
              <li><strong>Email:</strong> ${user.email}</li>
              <li><strong>Teléfono:</strong> ${user.phone || 'No especificado'}</li>
              <li><strong>Estado:</strong> Cuenta Activa y Verificada</li>
              <li><strong>Fecha de verificación:</strong> ${new Date().toLocaleString('es-AR')}</li>
            </ul>
          </div>
        `
      })
    } catch (adminEmailError) {
      console.error('Error enviando notificación al admin de verificación:', adminEmailError)
    }

    return NextResponse.json({ success: true, message: 'Correo verificado exitosamente.' })
  } catch (error) {
    console.error('Error al verificar email:', error)
    return NextResponse.json({ error: 'Ocurrió un error inesperado.' }, { status: 500 })
  }
}
