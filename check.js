import { prisma } from './src/lib/db.js'

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'xerosiete@yahoo.com.ar' }
  })
  
  const tokens = await prisma.emailVerificationToken.findMany({
    where: { email: 'xerosiete@yahoo.com.ar' }
  })

  console.log('User verified:', user?.emailVerified)
  console.log('User object:', user)
  console.log('Tokens:', tokens)
}

main().catch(console.error).finally(() => prisma.$disconnect())
