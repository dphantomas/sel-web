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
      return NextResponse.json({ error: 'Falta el ID del usuario' }, { status: 400 })
    }

    const body = await req.json()
    const { firstName, lastName, phone, role } = body

    // Opcional: Validar que el rol sea uno válido según el schema
    const validRoles = ['Participante', 'Transmisor', 'Admin']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        phone: phone !== undefined ? phone : undefined, // Permite null/vacío
        ...(role && { role }),
      },
      // Devolvemos también los accesos para que AdminPanel tenga data completa
      include: {
        unlockedCourses: {
          select: {
            courseId: true
          }
        }
      }
    })

    return NextResponse.json({ message: 'Usuario actualizado', user: updatedUser })
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    // Validar autorización
    if (!session || (session.user.role !== 'Admin' && session.user.role !== 'Transmisor')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Falta el ID del usuario' }, { status: 400 })
    }

    // Prevenir que el admin se borre a sí mismo
    if (session.user.id === id) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Usuario eliminado correctamente' })
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
