import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    include: {
      unlockedCourses: true,
      unlockedInstances: {
        include: { courseInstance: true }
      }
    }
  })

  for (const user of users) {
    const courseIds = new Set([
      ...user.unlockedCourses.map(uc => uc.courseId),
      ...user.unlockedInstances.map(ui => ui.courseInstance.courseId)
    ])

    const coursesWithResources = await prisma.course.findMany({
      where: { id: { in: Array.from(courseIds) } },
      include: { resources: true }
    })

    const allResources = coursesWithResources.flatMap(c => 
      c.resources.map(r => ({ ...r, course: { title: c.title } }))
    )
    
    const overriddenIds = new Set(allResources.map(r => r.overridesResourceId).filter(Boolean))
    const finalResources = allResources.filter(r => !overriddenIds.has(r.id))

    if (courseIds.size >= 1) {
      console.log(`User ${user.email} has ${courseIds.size} courses:`, Array.from(courseIds))
      console.log(`  All Resources:`, allResources.map(r => `${r.name} (${r.course.title}) [overrides: ${r.overridesResourceId}]`))
      console.log(`  Overridden IDs:`, Array.from(overriddenIds))
      console.log(`  Final Resources:`, finalResources.map(r => `${r.name} (${r.course.title})`))
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
