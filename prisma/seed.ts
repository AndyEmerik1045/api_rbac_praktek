import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Permissions
  const permissionSlugs = [
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
  ];

  for (const slug of permissionSlugs) {
    await prisma.permission.upsert({
      where: { slug },
      update: {},
      create: { slug },
    });
  }

  // 2. Roles
  const roles = [
    { name: 'ADMIN', perms: permissionSlugs },
    { name: 'USER', perms: ['user:read'] },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: {
        name: r.name,
        permissions: {
          connect: r.perms.map((slug) => ({ slug })),
        },
      },
    });
  }

  console.log('✅ Seeding sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });