import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }

    const { lessonId, completed } = await request.json()

    if (!lessonId) {
      return NextResponse.json({ error: 'ID de lección requerido.' }, { status: 400 })
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId
        }
      },
      update: {
        completed: !!completed
      },
      create: {
        userId: session.user.id,
        lessonId,
        completed: !!completed
      }
    })

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    console.error('Error al actualizar progreso:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
