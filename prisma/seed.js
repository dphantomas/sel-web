import { prisma } from '../src/lib/db.js'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Comenzando seeding...')

  // 1. Crear usuario Administrador por defecto
  const adminEmail = 'admin@sanacionenluz.com'
  const adminPassword = 'adminpassword123'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'Sanación en Luz',
      email: adminEmail,
      phone: '+5491123456789',
      passwordHash,
      role: 'Admin'
    }
  })

  console.log(`Usuario Admin creado/verificado: ${adminUser.email} (pass: ${adminPassword})`)

  // 2. Cursos a sembrar
  const coursesData = [
    {
      title: 'Inicio a la Sanación en Luz',
      slug: 'inicio-a-la-sanacion',
      description: 'Encuentros iniciales para comprender el proceso de Sanación en Luz y la reconexión con la vibración de la Esencia.',
      type: 'Inicio',
      published: true,
      image: '/assets/taller1-1.jpg',
      modules: [
        {
          title: 'Módulo 1: Introducción a la Sanación en Luz',
          order: 1,
          lessons: [
            {
              title: 'Bienvenidos al Proceso',
              slug: 'bienvenidos-proceso',
              content: '<h3>Introducción</h3><p>Bienvenidos a este camino de reconexión. En esta primera lección comprenderás los principios básicos de Sanación en Luz, la vibración pura y la preparación de tus cuerpos para el Nuevo Humano.</p>',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // URL de prueba
              order: 1
            },
            {
              title: 'La Esencia y el Retorno a la Pureza',
              slug: 'retorno-pureza',
              content: '<h3>Retornando al Origen</h3><p>Nada de lo que has hecho hasta ahora define quién eres en verdad. En esta clase profundizaremos sobre la vibración primordial y el despeje de memorias kármicas.</p>',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              order: 2
            }
          ]
        }
      ]
    },
    {
      title: 'Taller de Iniciación con las Rocas del Origen',
      slug: 'rocas-del-origen',
      description: 'Conexión sagrada con las moléculas de la creación y la activación de memorias atómicas primordiales.',
      type: 'Rocas',
      published: true,
      image: '/assets/taller9.jpg',
      modules: [
        {
          title: 'Módulo 1: Las Rocas del Origen',
          order: 1,
          lessons: [
            {
              title: 'Activación del Átomo Simiente',
              slug: 'atomo-simiente',
              content: '<p>Guía teórica y meditación para conectar con la resonancia de las Rocas del Origen en Gaia.</p>',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              order: 1
            }
          ]
        }
      ]
    },
    {
      title: 'Iniciación de los Siete Templos',
      slug: 'siete-templos',
      description: 'Proceso iniciático a través de los siete templos etéricos del Sol Central para anclar la Consciencia Unificada.',
      type: 'SieteTemplos',
      published: true,
      image: '/assets/taller2.jpg',
      modules: [
        {
          title: 'Templo 1: El Perdón',
          order: 1,
          lessons: [
            {
              title: 'La Energía del Templo del Perdón',
              slug: 'templo-perdon',
              content: '<p>Meditación e instrucción del Templo del Perdón del Sol Central.</p>',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              order: 1
            }
          ]
        }
      ]
    }
  ]

  for (const courseData of coursesData) {
    const { modules, ...courseFields } = courseData

    const course = await prisma.course.upsert({
      where: { slug: courseFields.slug },
      update: {
        title: courseFields.title,
        description: courseFields.description,
        type: courseFields.type,
        published: courseFields.published,
        image: courseFields.image
      },
      create: courseFields
    })

    console.log(`Curso creado/actualizado: ${course.title}`)

    for (const modData of modules) {
      const { lessons, ...modFields } = modData

      // Buscar si el módulo existe para este curso
      let dbModule = await prisma.module.findFirst({
        where: {
          title: modFields.title,
          courseId: course.id
        }
      })

      if (!dbModule) {
        dbModule = await prisma.module.create({
          data: {
            title: modFields.title,
            order: modFields.order,
            courseId: course.id
          }
        })
      }

      for (const lessonData of lessons) {
        await prisma.lesson.upsert({
          where: { slug: lessonData.slug },
          update: {
            title: lessonData.title,
            content: lessonData.content,
            videoUrl: lessonData.videoUrl,
            order: lessonData.order,
            moduleId: dbModule.id
          },
          create: {
            ...lessonData,
            moduleId: dbModule.id
          }
        })
      }
    }
  }

  console.log('Seeding completado con éxito.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
