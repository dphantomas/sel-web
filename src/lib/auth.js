import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { sendEmail } from '@/lib/email'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent select_account",
        },
      },
    }),
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
        assertion: { label: 'WebAuthn Assertion', type: 'text' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email) {
          throw new Error('Por favor, ingresa correo.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { authenticators: true }
        })

        if (!user) {
          throw new Error('El correo ingresado no está registrado.')
        }

        if (!user.emailVerified) {
          throw new Error('Debes verificar tu correo electrónico antes de iniciar sesión. Por favor, revisa tu bandeja de entrada.')
        }

        // WebAuthn Passkey Login
        if (credentials.assertion) {
          if (!user.currentChallenge) {
            throw new Error('Desafío inválido o expirado. Intenta de nuevo.')
          }

          let assertion;
          try {
            assertion = JSON.parse(credentials.assertion)
          } catch (e) {
            throw new Error('Aserción inválida.')
          }

          const authenticator = user.authenticators.find(
            (auth) => auth.credentialID === assertion.id
          )

          if (!authenticator) {
            throw new Error('Dispositivo no reconocido para este usuario.')
          }

          const originHeader = req.headers?.origin || (req.headers?.referer ? new URL(req.headers.referer).origin : null);
          const appUrl = process.env.NEXTAUTH_URL
          const expectedOrigin = appUrl
          const expectedRPID = new URL(appUrl).hostname

          let verification;
          try {
            verification = await verifyAuthenticationResponse({
              response: assertion,
              expectedChallenge: user.currentChallenge,
              expectedOrigin,
              expectedRPID,
              authenticator: {
                credentialID: Buffer.from(authenticator.credentialID, 'base64url'),
                credentialPublicKey: Buffer.from(authenticator.credentialPublicKey, 'base64url'),
                counter: authenticator.counter,
              },
            })
          } catch (error) {
            throw new Error('Fallo al verificar la huella: ' + error.message)
          }

          if (verification.verified) {
            const { authenticationInfo } = verification
            // Avoid prisma update if `userId_credentialID` unique constraint is complex, we can find first.
            // But we didn't add @@unique([userId, credentialID]), wait, I think I did add `@@unique([userId, credentialID])` or `credentialID` is `@id`. Yes, credentialID is `@id`.
            await prisma.authenticator.update({
              where: { credentialID: authenticator.credentialID },
              data: { counter: authenticationInfo.newCounter }
            })

            await prisma.user.update({
              where: { id: user.id },
              data: { currentChallenge: null }
            })

            return {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              role: user.role,
              phone: user.phone
            }
          } else {
            throw new Error('Fallo en la verificación biométrica.')
          }
        }

        // Password Login
        if (!credentials.password) {
          throw new Error('Contraseña o huella requerida.')
        }

        if (!user.passwordHash) {
          throw new Error('El correo no tiene contraseña registrada.')
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
                emailVerified: new Date(), // Usuarios de Google se verifican automáticamente
                firstName: profile?.given_name || user.name || 'Usuario',
                lastName: profile?.family_name || '',
                passwordHash: '', // Vacío para usuarios de Google
                role: 'Guest'
              }
            })

            // Enviar notificación al administrador
            try {
              await sendEmail({
                to: 'registro@sanacionenluz.com',
                subject: `Nuevo usuario registrado (Google): ${dbUser.firstName} ${dbUser.lastName}`,
                html: `
                  <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h3 style="color: #2e7d32;">Nuevo registro automático vía Google</h3>
                    <ul style="line-height: 1.6;">
                      <li><strong>Nombre:</strong> ${dbUser.firstName} ${dbUser.lastName}</li>
                      <li><strong>Email:</strong> ${dbUser.email}</li>
                      <li><strong>Estado:</strong> Cuenta Activa y Verificada (Google OAuth)</li>
                      <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR')}</li>
                    </ul>
                  </div>
                `
              })
            } catch (adminEmailError) {
              console.error('Error enviando notificación al admin (Google OAuth):', adminEmailError)
            }
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
      if (token && token.id) {
        // Consultamos la DB en cada request de sesión para tener los permisos SIEMPRE en tiempo real
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, phone: true }
        })

        session.user.id = token.id
        session.user.role = dbUser ? dbUser.role : token.role
        session.user.phone = dbUser ? dbUser.phone : token.phone
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
  secret: process.env.NEXTAUTH_SECRET,
}
