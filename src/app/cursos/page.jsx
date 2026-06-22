import { prisma } from '@/lib/db'
import CoursesGrid from '@/components/CoursesGrid'
import { sortCoursesByAdminPriority } from '@/lib/courseSorting'

export const metadata = {
  title: 'Cursos | Sanación en Luz',
  description: 'Catálogo de Cursos dinámico de Sanación en Luz',
}

export default async function CursosPage() {
  // Solo pedimos a la DB los cursos que estén marcados como 'published'
  const courses = await prisma.course.findMany({
    where: {
      published: true
    },
    include: {
      instances: {
        orderBy: { startDate: 'desc' }
      }
    }
  })

  const sortedCourses = sortCoursesByAdminPriority(courses)

  return <CoursesGrid initialCourses={sortedCourses} lang="es" />
}
