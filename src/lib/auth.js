import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Por favor, ingresa correo y contraseña.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() }
        })

        if (!user || !user.passwordHash) {
          throw new Error('El correo ingresado no está registrado.')
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!isValid) {
          throw new Error('Contraseña incorrecta.')
        }

        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const emailLower = user.email.toLowerCase().trim()
          let dbUser = await prisma.user.findUnique({
            where: { email: emailLower }
          })

          if (!dbUser) {
            // Usuario nuevo, lo creamos
            dbUser = await prisma.user.create({
              data: {
                email: emailLower,
                firstName: profile?.given_name || user.name || 'Usuario',
                lastName: profile?.family_name || '',
                passwordHash: '', // Vacío para usuarios de Google
                role: 'Guest'
              }
            })
          }

          // Asignar datos al objeto user para que pasen al jwt
          user.id = dbUser.id
          user.role = dbUser.role
          user.phone = dbUser.phone
          return true
        } catch (error) {
          console.error("Error en signIn callback con Google:", error)
          return false
        }
      }
      return true // Para CredentialsProvider
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.phone = token.phone
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'secret-lms-sanacion-luz-2026',
}
