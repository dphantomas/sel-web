import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    // Validar autorización
    if (!session || (session.user.role !== 'Admin' && session.user.role !== 'Transmisor')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Falta el ID del curso' }, { status: 400 })
    }

    const body = await req.json()
    const { title, slug, description, published } = body

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        description: description !== undefined ? description : undefined, // Permite null/vacío
        ...(published !== undefined && { published }),
      }
    })

    return NextResponse.json({ message: 'Curso actualizado', course: updatedCourse })
  } catch (error) {
    console.error('Error actualizando curso:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
