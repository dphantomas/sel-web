import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { verifyRegistrationResponse } from '@simplewebauthn/server'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || !user.currentChallenge) {
      return NextResponse.json({ error: 'Usuario no encontrado o desafío inválido' }, { status: 404 })
    }

    const body = await request.json()
    const expectedChallenge = user.currentChallenge

    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const expectedOrigin = `${protocol}://${host}`
    const expectedRPID = host.split(':')[0]

    let verification
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin,
        expectedRPID,
      })
    } catch (error) {
      console.error('Error verificando registro WebAuthn:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const { verified, registrationInfo } = verification

    if (verified && registrationInfo) {
      const credentialObj = registrationInfo.credential || registrationInfo
      const credentialPublicKey = credentialObj.publicKey || credentialObj.credentialPublicKey
      const credentialID = credentialObj.id || credentialObj.credentialID
      const counter = credentialObj.counter !== undefined ? credentialObj.counter : registrationInfo.counter
      const { credentialDeviceType, credentialBackedUp } = registrationInfo

      try {
        // Guardar el nuevo autenticador (o actualizar si ya existía en la BD pero no en el localStorage)
        const credentialIdString = typeof credentialID === 'string' ? credentialID : Buffer.from(credentialID).toString('base64url')
        
        await prisma.authenticator.upsert({
          where: { credentialID: credentialIdString },
          update: {
            counter,
            transports: body.response.transports ? body.response.transports.join(',') : '',
          },
          create: {
            credentialID: credentialIdString,
            userId: user.id,
            credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64url'),
            counter,
            credentialDeviceType,
            credentialBackedUp,
            transports: body.response.transports ? body.response.transports.join(',') : '',
          }
        })

        // Limpiar el challenge
        await prisma.user.update({
          where: { id: user.id },
          data: { currentChallenge: null }
        })

        return NextResponse.json({ verified: true })
      } catch (dbError) {
        console.error('Error de base de datos:', dbError)
        return NextResponse.json({ error: 'DB Error: ' + dbError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'No se pudo verificar' }, { status: 400 })
  } catch (error) {
    console.error('Error general en verify-registration:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
