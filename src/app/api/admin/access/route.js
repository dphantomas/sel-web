import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { sendWhatsAppNotification } from '@/lib/whatsapp'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'Admin' && session.user.role !== 'Transmisor')) {
      return NextResponse.json({ error: 'No autorizado. Se requieren permisos de Admin o Transmisor.' }, { status: 403 })
    }

    const { userId, courseId, enabled } = await request.json()

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    const course = await prisma.course.findUnique({ where: { id: courseId } })

    if (!user || !course) {
      return NextResponse.json({ error: 'Usuario o curso no encontrado.' }, { status: 404 })
    }

    if (enabled) {
      // Habilitar acceso
      await prisma.userCourseAccess.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        },
        update: {},
        create: {
          userId,
          courseId
        }
      })

      // Enviar notificación de WhatsApp si el usuario tiene teléfono
      if (user.phone) {
        const message = `¡Hola ${user.firstName}! Se ha habilitado tu acceso al taller "${course.title}" en la plataforma de Sanación en Luz. Ya puedes ingresar a tu panel en: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard`
        await sendWhatsAppNotification(user.phone, message)
      }

      // Ascender de Guest a Participante si es su primer curso
      if (user.role === 'Guest') {
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'Participante' }
        })
      }

    } else {
      // Deshabilitar acceso
      await prisma.userCourseAccess.deleteMany({
        where: {
          userId,
          courseId
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al actualizar acceso de taller:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
