import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // 1. Borrar todos los usuarios y sus relaciones en cascada
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE;')
    
    // 2. Agregar las columnas nuevas si no existen
    await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT NOT NULL DEFAULT \'\';')
    await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT NOT NULL DEFAULT \'\';')
    
    // 3. Eliminar la columna vieja
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "User" DROP COLUMN "name";')
    } catch(e) {
      console.log('La columna name ya no existe o no se pudo borrar:', e.message)
    }

    // 4. Crear el administrador
    const passwordHash = await bcrypt.hash('adminpassword123', 10)
    
    await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'Sanación en Luz',
        email: 'admin@sanacionenluz.com',
        phone: '+5491123456789',
        passwordHash,
        role: 'Admin'
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "¡Base de datos de producción reseteada, esquema sincronizado y administrador creado exitosamente!" 
    })
  } catch (error) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
  }
}
