import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions)

    // Validar autenticación
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { firstName, lastName, phone } = body

    // Actualizar solo los datos permitidos del propio usuario
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        phone: phone !== undefined ? phone : undefined,
      }
    })

    return NextResponse.json({ message: 'Perfil actualizado', user: updatedUser })
  } catch (error) {
    console.error('Error actualizando perfil:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
