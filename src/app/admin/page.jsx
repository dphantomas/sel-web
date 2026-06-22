import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import AdminPanel from './AdminPanel'
import { sortCoursesByAdminPriority } from '@/lib/courseSorting'

export const metadata = {
  title: 'Administración LMS | Sanación en Luz',
  description: 'Panel de control para habilitar cursos y notificar usuarios.'
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  // Validar rol de administrador o transmisor
  if (!session || (session.user.role !== 'Admin' && session.user.role !== 'Transmisor')) {
    redirect('/dashboard')
  }

  // Obtener todos los usuarios de la plataforma
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      unlockedCourses: {
        select: {
          courseId: true
        }
      },
      unlockedInstances: {
        select: {
          courseInstanceId: true
        }
      }
    }
  })

  // Obtener todos los cursos con sus instancias y recursos
  const courses = await prisma.course.findMany({
    orderBy: { id: 'asc' },
    include: {
      resources: true,
      instances: {
        orderBy: { startDate: 'desc' },
        include: {
          resources: true
        }
      }
    }
  })

  const sortedCourses = sortCoursesByAdminPriority(courses)

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm font-bold text-[#33275f] hover:text-[#9187BA] transition flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Volver al Panel
          </Link>
          <span className="text-xs bg-[#B681AE]/10 text-[#33275f] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
            Vista Administrador
          </span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <h1 className="text-[#33275f] text-2xl md:text-3xl font-extrabold tracking-wide">
            CONTROL DE ACCESOS Y MEMBRESÍAS
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Habilita accesos a talleres según el historial del participante. Al habilitar un taller, se le enviará automáticamente un mensaje de notificación por WhatsApp si tiene un teléfono registrado.
          </p>
        </div>

        {/* Panel Administrativo (Pestañas) */}
        <AdminPanel initialUsers={users} courses={sortedCourses} />

      </div>
    </div>
  )
}
