import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { prisma } from '../src/lib/db.js'

async function main() {
  const resources = await prisma.resource.findMany({
    where: {
      overridesResourceId: { not: null }
    },
    include: {
      overridesResource: true
    }
  })

  let fixed = 0
  for (const resource of resources) {
    if (resource.overridesResource) {
      if (resource.courseId !== resource.overridesResource.courseId) {
        console.log(`Fixing resource ${resource.id} (${resource.name}) - overriding across courses!`)
        await prisma.resource.update({
          where: { id: resource.id },
          data: { overridesResourceId: null }
        })
        fixed++
      }
    }
  }

  console.log(`Fixed ${fixed} cross-course overrides.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
