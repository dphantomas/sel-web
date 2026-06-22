import { prisma } from './src/lib/db.js';

async function main() {
  const fakeSlugs = [
    'inicio-sanacion-en-luz',
    'quietud',
    'iniciacion-siete-templos',
    'retiro-iniciatico'
  ];
  await prisma.course.deleteMany({
    where: {
      slug: {
        in: fakeSlugs
      }
    }
  });
  console.log("Cursos falsos borrados.");
}
main().finally(() => prisma.$disconnect());
