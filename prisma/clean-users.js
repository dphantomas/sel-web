import { prisma } from '../src/lib/db.js'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Borrando todos los usuarios...')
  await prisma.user.deleteMany()
  console.log('Todos los usuarios, progresos y dispositivos han sido eliminados de la base de datos.')

  console.log('Creando usuario administrador por defecto...')
  const adminEmail = 'admin@sanacionenluz.com'
  const adminPassword = 'adminpassword123'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  const adminUser = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Sanación en Luz',
      email: adminEmail,
      phone: '+5491123456789',
      passwordHash,
      role: 'Admin'
    }
  })

  console.log(`Usuario Admin creado exitosamente: ${adminUser.email}`)
}

main()
  .catch((e) => {
    console.error('Error limpiando base de datos:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
