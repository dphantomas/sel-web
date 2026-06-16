const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { email: 'admin@sanacionenluz.com' },
    data: { role: 'Admin' }
  });
  console.log('User upgraded to Admin');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
