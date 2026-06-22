import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import LessonView from './LessonView'

export const metadata = {
  title: 'Visualizador de Taller | Sanación en Luz'
}

export default async function CoursePage({ params, searchParams }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  // Await params for Next.js App Router compatibility
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const { courseSlug } = resolvedParams
  const activeLessonSlug = resolvedSearchParams.lesson

  // Obtener curso, sus módulos y lecciones
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  })

  if (!course) {
    redirect('/dashboard')
  }

  // Validar si el usuario tiene acceso a este taller
  const hasAccess = await prisma.userCourseAccess.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: course.id
      }
    }
  })

  // Los administradores y transmisores siempre tienen acceso a visualizar los cursos
  const isElevatedRole = session.user.role === 'Admin' || session.user.role === 'Transmisor'

  if (!hasAccess && !isElevatedRole) {
    redirect('/dashboard')
  }

  // Obtener progreso de lecciones del usuario para este curso
  const userProgress = await prisma.progress.findMany({
    where: {
      userId: session.user.id,
      lesson: {
        module: {
          courseId: course.id
        }
      }
    },
    select: {
      lessonId: true,
      completed: true
    }
  })

  const completedLessonMap = {}
  userProgress.forEach((p) => {
    completedLessonMap[p.lessonId] = p.completed
  })

  // Obtener todas las lecciones del curso de forma plana
  const allLessons = course.modules.flatMap((m) => m.lessons)

  // Encontrar la lección activa
  let activeLesson = null
  if (activeLessonSlug) {
    activeLesson = allLessons.find((l) => l.slug === activeLessonSlug)
  }
  // Si no hay lección activa o no se encontró, usar la primera del curso
  if (!activeLesson && allLessons.length > 0) {
    activeLesson = allLessons[0]
  }

  // Determinar siguiente lección
  let nextLesson = null
  if (activeLesson) {
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id)
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      nextLesson = allLessons[currentIndex + 1]
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm font-bold text-[#33275f] hover:text-[#9187BA] transition flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Volver al Panel
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Columna Izquierda: Temario (Sidebar) */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit sticky top-28">
            <span className="text-[10px] font-bold text-[#B681AE] uppercase tracking-wider block mb-1">
              Curso / Taller
            </span>
            <h2 className="text-[#33275f] text-lg font-bold mb-6 line-clamp-2 border-b border-gray-100 pb-4">
              {course.title}
            </h2>

            {/* Listado de Módulos y Clases */}
            <div className="space-y-6">
              {course.modules.map((module) => (
                <div key={module.id}>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    {module.title}
                  </h3>
                  <ul className="space-y-2">
                    {module.lessons.map((lesson) => {
                      const isActive = activeLesson && activeLesson.id === lesson.id
                      const isCompleted = !!completedLessonMap[lesson.id]
                      
                      return (
                        <li key={lesson.id}>
                          <Link
                            href={`/cursos/${course.slug}?lesson=${lesson.slug}`}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                              isActive
                                ? 'bg-[#9187BA]/10 text-[#33275f] font-bold border-l-4 border-[#33275f] pl-2'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {/* Checkmark Icon */}
                            <span className={`w-5 h-5 flex items-center justify-center rounded-full border text-xs shrink-0 ${
                              isCompleted 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300 bg-white'
                            }`}>
                              {isCompleted && '✓'}
                            </span>
                            <span className="truncate">{lesson.title}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Reproductor y Contenido */}
          <div className="lg:col-span-3">
            {activeLesson ? (
              <LessonView 
                lesson={activeLesson} 
                initialCompleted={!!completedLessonMap[activeLesson.id]} 
                nextLesson={nextLesson}
                courseSlug={course.slug}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <h3 className="text-gray-700 text-lg font-bold mb-2">No hay lecciones en este taller</h3>
                <p className="text-gray-500 text-sm">Próximamente se cargará el material correspondiente.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
