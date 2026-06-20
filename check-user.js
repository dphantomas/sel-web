import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'xerosiete@yahoo.com.ar' }
  })
  
  const tokens = await prisma.emailVerificationToken.findMany({
    where: { email: 'xerosiete@yahoo.com.ar' }
  })

  console.log('User:', user)
  console.log('Tokens:', tokens)
}

main().catch(console.error).finally(() => prisma.$disconnect())
