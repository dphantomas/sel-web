import { prisma } from './src/lib/db.js';

async function main() {
  const allCourses = await prisma.course.findMany();
  console.log(`Total courses in DB: ${allCourses.length}`);
  for (const c of allCourses) {
    console.log(`- ${c.title} (Published: ${c.published})`);
  }
}
main().finally(() => prisma.$disconnect());
