import { prisma } from '../src/lib/db.js';

async function main() {
  await prisma.course.updateMany({
    where: { slug: 'inicio-sanacion-en-luz' },
    data: { image: '/assets/taller1-1.jpg' }
  });
  await prisma.course.updateMany({
    where: { slug: 'quietud' },
    data: { image: '/assets/Conexion.jpeg' }
  });
  await prisma.course.updateMany({
    where: { slug: 'iniciacion-siete-templos' },
    data: { image: '/assets/taller2.jpg' }
  });
  await prisma.course.updateMany({
    where: { slug: 'retiro-iniciatico' },
    data: { image: '/assets/taller3.jpg' }
  });
  console.log("Images updated!");
}
main().finally(() => prisma.$disconnect());
