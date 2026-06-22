import { prisma } from '../src/lib/db.js';

async function main() {
  console.log('Sembrando base de datos de prueba...');

  // Crear 3 cursos de prueba basados en los talleres originales
  const courses = [
    {
      title: 'Inicio a la Sanación en Luz',
      slug: 'inicio-sanacion-en-luz',
      shortDescription: 'Taller introductorio al proceso de Sanación en Luz.',
      type: 'Taller',
      modality: 'Virtual',
      published: true,
      image: '/assets/taller1-1.jpg'
    },
    {
      title: 'Quietud',
      slug: 'quietud',
      shortDescription: 'La Quietud es un estado de consciencia sagrado.',
      type: 'Taller',
      modality: 'Presencial',
      published: true,
      image: '/assets/Conexion.jpeg'
    },
    {
      title: 'Iniciación de los Siete Templos',
      slug: 'iniciacion-siete-templos',
      shortDescription: 'Un gran paso en el Camino de la Sanación en Luz.',
      type: 'Retiro',
      modality: 'Presencial',
      published: true,
      image: '/assets/taller2.jpg'
    },
    {
      title: 'Retiro Iniciático de Sanación en Luz (Borrador)',
      slug: 'retiro-iniciatico',
      shortDescription: 'Este retiro está en preparación y no debería ser visible.',
      type: 'Retiro',
      modality: 'Presencial',
      published: false, // NO publicado para probar el filtro
      image: '/assets/taller3.jpg'
    }
  ];

  for (const courseData of courses) {
    const exists = await prisma.course.findUnique({ where: { slug: courseData.slug } });
    if (!exists) {
      await prisma.course.create({ data: courseData });
      console.log(`Creado: ${courseData.title}`);
    } else {
      console.log(`Ya existe: ${courseData.title}`);
    }
  }

  console.log('¡Siembra completada con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
