import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import UserResourcesList from './UserResourcesList'
import UserCourseHistory from './UserCourseHistory'

export const metadata = {
  title: 'Mi Panel | Sanación en Luz',
  description: 'Panel del estudiante de la plataforma de Sanación en Luz.'
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Obtener información del usuario y sus accesos (tanto a cursos como a instancias)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      unlockedCourses: {
        select: { courseId: true }
      },
      unlockedInstances: {
        include: {
          courseInstance: {
            include: {
              course: true
            }
          }
        },
        orderBy: {
          courseInstance: { startDate: 'desc' }
        }
      }
    }
  })

  if (!user) {
    redirect('/login')
  }

  // Juntar todos los IDs de cursos a los que tiene acceso
  const courseIds = new Set([
    ...user.unlockedCourses.map(uc => uc.courseId),
    ...user.unlockedInstances.map(ui => ui.courseInstance.courseId)
  ])

  // Obtener los recursos de todos esos cursos
  const coursesWithResources = await prisma.course.findMany({
    where: { id: { in: Array.from(courseIds) } },
    include: { resources: true }
  })

  // Aplanar todos los recursos y aplicar lógica de overrides (reemplazos)
  const allResources = coursesWithResources.flatMap(c => 
    c.resources.map(r => ({ ...r, course: { title: c.title } }))
  )
  
  // Encontrar IDs de recursos que han sido reemplazados por uno más nuevo
  const overriddenIds = new Set(allResources.map(r => r.overridesResourceId).filter(Boolean))
  
  // Filtrar los recursos que NO están en la lista de reemplazados
  const finalResources = allResources.filter(r => !overriddenIds.has(r.id))

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
            <span className="text-xs font-bold text-[#9187BA] tracking-widest uppercase">Plataforma LMS</span>
            <h1 className="text-[#33275f] text-2xl md:text-3xl font-bold mt-1">
              Hola, {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Rol: <strong className="text-[#B681AE]">{user.role}</strong>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {(user.role === 'Admin' || user.role === 'Transmisor') && (
              <Link 
                href="/admin" 
                className="bg-[#33275f] hover:bg-[#4c3c86] text-white text-sm font-bold py-3 px-6 rounded-xl transition duration-300 shadow-md"
              >
                Panel de Admin
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>

        {/* Formulario de Mi Perfil */}
        <UserProfileForm user={user} />

        {/* Material de Estudio (Recursos) */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-[#33275f] text-xl font-bold tracking-wide">MATERIAL DE ESTUDIO</h2>
            <span className="bg-[#B681AE]/10 text-[#33275f] text-xs font-bold px-3 py-1 rounded-full">
              {finalResources.length} Archivos
            </span>
          </div>
          <UserResourcesList resources={finalResources} />
        </div>

        {/* Historial de Encuentros (Instancias) */}
        <div>
          <h2 className="text-[#33275f] text-xl font-bold mb-6 tracking-wide">HISTORIAL DE ENCUENTROS</h2>
          <UserCourseHistory instances={user.unlockedInstances} />
        </div>

      </div>
    </div>
  )
}
