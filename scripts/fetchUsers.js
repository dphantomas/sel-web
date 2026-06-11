import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import prisma from '../src/lib/db.js';

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, firstName: true }
  });
  console.log(users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
