import { prisma } from './src/lib/db.js'

async function main() {
  const users = await prisma.user.findMany()
  console.log('Usuarios en la DB:', users)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
