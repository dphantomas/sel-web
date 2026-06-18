import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const prisma = createPrismaClient()

async function main() {
  console.log('Migrando accesos de cursos a instancias...')
  
  const accesses = await prisma.userCourseAccess.findMany()
  console.log(`Encontrados ${accesses.length} accesos a cursos.`)

  for (const access of accesses) {
    const instances = await prisma.courseInstance.findMany({
      where: { courseId: access.courseId },
      orderBy: { startDate: 'asc' }
    })

    if (instances.length > 0) {
      const instance = instances[0]
      try {
        await prisma.userInstanceAccess.upsert({
          where: {
            userId_courseInstanceId: {
              userId: access.userId,
              courseInstanceId: instance.id
            }
          },
          update: {},
          create: {
            userId: access.userId,
            courseInstanceId: instance.id,
            grantedAt: access.grantedAt
          }
        })
        console.log(`✅ Migrado usuario ${access.userId} a la instancia ${instance.id}`)
      } catch (e) {
        console.error(`❌ Error migrando usuario ${access.userId} a instancia ${instance.id}:`, e)
      }
    } else {
      console.warn(`⚠️ El curso ${access.courseId} no tiene instancias. No se migró el acceso del usuario ${access.userId}.`)
    }
  }

  console.log('Migración completada.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
