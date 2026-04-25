import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findFirst();
  console.log('User:', u);
  
  if (u) {
    const a = await prisma.account.findFirst({
      where: { userId: u.id }
    });
    console.log('Account:', a);
  }
}

main().finally(() => prisma.$disconnect());
