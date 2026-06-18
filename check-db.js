import { prisma } from './src/lib/db.js'

async function main() {
  const courses = await prisma.course.findMany()
  console.log('Cursos:', courses.map(c => c.title))
}

main().catch(console.error).finally(() => prisma.$disconnect())
