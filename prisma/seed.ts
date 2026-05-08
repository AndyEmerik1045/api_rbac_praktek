import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    "user:create",
    "user:read",
    "user:update",
    "user:delete",
    "admin:read",
  ];

  // 1. Buat semua permissions
  for (const slug of permissions) {
    await prisma.permission.upsert({
      where: { slug },
      update: {},
      create: { slug },
    });
  }

  // 2. Role ADMIN - semua permissions
  await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      permissions: {
        connect: permissions.map((s) => ({ slug: s })),
      },
    },
  });

  // 3. Role USER - hanya read
  await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: {
      name: "USER",
      permissions: {
        connect: [{ slug: "user:read" }],
      },
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());