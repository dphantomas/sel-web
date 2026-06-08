export const metadata = {
  title: 'Sanación en Luz | Nothing you have done so far defines who you Are',
  description: 'Sanación en Luz is a process designed for evolution into the New Human and the return to your original Purity. Spiritual guidance and accompaniment.',
  keywords: 'sanacion en luz,healing in light,ascension,light,divinity,evolution,personal growth,sananda,monica garcia,dario geier,new human,new earth,fifth dimension,initiation,retreat',
  authors: [{ name: 'Darío Gabriel Geier & Mónica Nidia García' }],
  icons: {
    icon: '/assets/cropped-fav-150x150.png',
    apple: '/assets/cropped-fav-300x300.png',
  },
  openGraph: {
    title: 'Sanación en Luz',
    description: 'Nothing you have done so far defines who you Are',
    images: ['/assets/mail.png'],
  },
  twitter: { card: 'summary_large_image' },
  alternates: {
    languages: {
      'es': '/',
      'en': '/en/home/',
    },
  },
}

// In Next.js App Router, only the root layout can have <html>/<body>.
// This layout only provides metadata and passes children through.
export default function EnLayout({ children }) {
  return children
}

