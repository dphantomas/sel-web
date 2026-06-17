import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admin = await prisma.user.update({
      where: { email: 'admin@sanacionenluz.com' },
      data: { emailVerified: new Date() }
    })
    return NextResponse.json({ 
      success: true, 
      message: '¡La cuenta admin@sanacionenluz.com fue verificada con éxito! Ya puedes iniciar sesión.' 
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
