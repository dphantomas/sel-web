import { prisma } from './src/lib/db.js'
import bcrypt from 'bcryptjs'

async function checkLogin() {
  const email = 'admin@sanacionenluz.com'
  const password = 'adminpassword123'

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('No user found')
      return
    }
    
    console.log('User found:', user.email, 'emailVerified:', user.emailVerified)
    
    const isValid = await bcrypt.compare(password, user.passwordHash)
    console.log('Password valid:', isValid)
  } catch (e) {
    console.error('Error during login check:', e)
  }
}

checkLogin().finally(() => prisma.$disconnect())
