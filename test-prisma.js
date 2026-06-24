import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const resources = await prisma.resource.findMany({ select: { id: true, name: true, type: true, isDownloadable: true }})
  console.log(resources)
}
main()
