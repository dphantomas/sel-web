import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { s3Client } from '@/lib/s3'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function GET(request, { params }) {
  try {
    const { id: resourceId } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Debes iniciar sesión para ver este recurso' }, { status: 401 })
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId }
    })

    if (!resource) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })
    }

    // 1. Verificar permisos (Admin/Transmisor tienen acceso total)
    let hasAccess = session.user.role === 'Admin' || session.user.role === 'Transmisor'

    // Si no es admin, verificamos si el Admin le habilitó manualmente el acceso al curso/instancia
    if (!hasAccess) {
      // Obtenemos los accesos del usuario que el Admin marcó en el panel
      const userAccesses = await prisma.userCourseAccess.findMany({
        where: { userId: session.user.id }
      })

      if (resource.courseId) {
        // ¿Tiene el switch activado para el curso general?
        hasAccess = userAccesses.some(a => a.courseId === resource.courseId)
      } else if (resource.courseInstanceId) {
        // ¿Tiene el switch activado para esta instancia específica?
        hasAccess = userAccesses.some(a => a.courseInstanceId === resource.courseInstanceId)
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'No tienes permisos para acceder a este material. Si creés que es un error, por favor contactá a la administración.' }, { status: 403 })
    }

    const bucketName = process.env.R2_BUCKET_NAME
    if (!bucketName) {
      return NextResponse.json({ error: 'Bóveda R2 no configurada' }, { status: 500 })
    }

    // 2. Generar el link seguro de lectura
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: resource.cloudflareKey,
      ResponseContentDisposition: resource.isDownloadable 
        ? `attachment; filename="${resource.name}"` 
        : 'inline',
    })

    // El link de lectura expira en 2 horas (por si es un video o audio largo)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 7200 })

    return NextResponse.json({ 
      url: signedUrl, 
      isDownloadable: resource.isDownloadable,
      type: resource.type,
      name: resource.name
    })

  } catch (error) {
    console.error('Error generando link de recurso:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
