import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import UserProfileForm from '../UserProfileForm'
import PasskeyManager from '@/components/PasskeyManager'

export const metadata = {
  title: 'Mis Datos | Sanación en Luz',
  description: 'Datos personales de la plataforma de Sanación en Luz.'
}

export default async function DashboardPerfilPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      unlockedCourses: {
        include: { course: true }
      },
      unlockedInstances: {
        include: { courseInstance: { include: { course: true } } }
      },
      authenticators: {
        select: {
          credentialID: true,
          credentialDeviceType: true,
          credentialBackedUp: true,
          transports: true,
          deviceName: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!user) {
    redirect('/login')
  }


  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed pt-28 pb-16 px-4 md:px-6"
      style={{ backgroundImage: "url('/assets/fondo-quienes.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header del Panel */}
        <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/40 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-[#33275f] text-2xl md:text-3xl font-bold mt-1">
              Hola, {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Rol: <strong className="text-[#B681AE]">{user.role}</strong>
            </p>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Formulario de Perfil (Ocupa más espacio) */}
          <div className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <UserProfileForm 
              user={user} 
              hasInitiatoryRetreat={
                user.unlockedCourses.some(uc => uc.course.title.includes('Retiro Iniciático')) ||
                user.unlockedInstances.some(ui => ui.courseInstance.course.title.includes('Retiro Iniciático'))
              }
            />
          </div>

          {/* Columna Derecha: Seguridad y Métodos de Ingreso */}
          <div className="lg:col-span-1 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
            <PasskeyManager initialAuthenticators={user.authenticators} />
          </div>

        </div>

      </div>
    </div>
  )
}
