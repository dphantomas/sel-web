import { prisma } from '@/lib/db'
import Workshops from '@/components/Workshops'
import { sortCoursesByAdminPriority } from '@/lib/courseSorting'

export const metadata = {
  title: 'Talleres | Sanación en Luz',
  description: 'Proceso de Sanación en Luz — talleres y encuentros para la evolución hacia el Nuevo Humano.',
}

export default async function TalleresPage() {
  const talleres = await prisma.course.findMany({
    where: {
      published: true
    },
    include: {
      instances: {
        orderBy: { startDate: 'desc' }
      }
    }
  })

  const sortedTalleres = sortCoursesByAdminPriority(talleres)

  return <Workshops initialCourses={sortedTalleres} />
}
