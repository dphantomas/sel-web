import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import AuthProvider from '@/components/AuthProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata = {
  title: 'Sanación en Luz | Nada de lo que has hecho hasta ahora define quién Eres',
  description: 'Sanación en Luz es un proceso diseñado para la evolución hacia el Nuevo Humano y el retorno hacia tu Pureza original. Guía y acompañamiento espiritual.',
  keywords: 'sanacion en luz,sanacion,ascension,luz,divinidad,evolucion,crecimiento personal,sananda,monica garcia,dario geier,dario gabriel geier,iluminacion,nuevo humano,nueva tierra,tierra en luz,nuevo tiempo,era de la luz,nueva era,quinta dimension,iniciacion,retiro',
  authors: [{ name: 'Darío Gabriel Geier & Mónica Nidia García' }],
  icons: {
    icon: '/assets/cropped-fav-150x150.png',
    apple: '/assets/cropped-fav-300x300.png',
  },
  openGraph: {
    title: 'Sanación en Luz',
    description: 'Nada de lo que has hecho hasta ahora define quién Eres',
    images: ['/assets/mail.png'],
  },
  twitter: {
    card: 'summary_large_image',
  },
  manifest: '/manifest.json',
  alternates: {
    languages: {
      'es': '/',
      'en': '/en/home/',
    },
  },
}

export const viewport = {
  themeColor: '#33275f',
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="relative min-h-screen overflow-x-hidden bg-white">
        <AuthProvider session={session}>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <WhatsAppFloat />
        </AuthProvider>
      </body>
    </html>
  )
}

