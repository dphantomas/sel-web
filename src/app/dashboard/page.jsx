import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import UserProfileForm from './UserProfileForm'

export const metadata = {
  title: 'Mi Panel | Sanación en Luz',
  description: 'Panel del estudiante de la plataforma de Sanación en Luz.'
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Obtener información del usuario, accesos y su progreso
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      unlockedCourses: {
        select: {
          courseId: true
        }
      },
      progress: {
        where: { completed: true }
      }
    }
  })

  if (!user) {
    redirect('/login')
  }

  const unlockedCourseIds = new Set(user.unlockedCourses.map((uc) => uc.courseId))
  const completedLessonIds = new Set(user.progress.map((p) => p.lessonId))

  // Obtener solo los cursos a los que el usuario tiene acceso
  const unlockedCourseIdsArr = Array.from(unlockedCourseIds)
  const myCourses = await prisma.course.findMany({
    where: {
      id: { in: unlockedCourseIdsArr }
    },
    include: {
      modules: {
        include: {
          lessons: {
            select: {
              id: true
            }
          }
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  })

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

        {/* Cursos / Talleres */}
        <h2 className="text-[#33275f] text-xl font-bold mb-6 tracking-wide">MIS TALLERES Y ENCUENTROS</h2>

        {myCourses.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <p className="text-gray-600">Aún no tienes talleres o encuentros habilitados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course) => {
              // Calcular progreso del curso
              const allLessons = course.modules.flatMap((m) => m.lessons)
              const totalLessons = allLessons.length
              const completedInCourse = allLessons.filter((l) => completedLessonIds.has(l.id)).length
              const progressPercent = totalLessons > 0 ? Math.round((completedInCourse / totalLessons) * 100) : 0

              return (
                <div 
                  key={course.id} 
                  className="bg-white/80 backdrop-blur-md rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/40 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Imagen de Taller */}
                    <div className="h-48 w-full overflow-hidden relative bg-gray-100">
                      <img 
                        src={course.image || '/assets/taller1-1.jpg'} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Contenido */}
                    <div className="p-6">
                      <span className="text-[10px] font-bold text-[#B681AE] tracking-widest uppercase">
                        Taller: {course.type}
                      </span>
                      <h3 className="text-[#33275f] text-lg font-bold mt-1 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                        {course.description || 'Sin descripción disponible.'}
                      </p>
                    </div>
                  </div>

                  {/* Pie de tarjeta con acciones y progreso */}
                  <div className="p-6 pt-0 mt-auto">
                    <div>
                      {totalLessons > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progreso</span>
                            <span>{completedInCourse}/{totalLessons} clases ({progressPercent}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#9187BA] h-1.5 rounded-full transition-all duration-500" 
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <Link
                        href={`/cursos/${course.slug}`}
                        className="block text-center bg-[#9187BA] hover:bg-[#B681AE] text-white text-sm font-bold py-3 px-4 rounded-xl transition duration-300"
                      >
                        {completedInCourse > 0 ? 'Continuar Taller' : 'Comenzar Taller'}
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
