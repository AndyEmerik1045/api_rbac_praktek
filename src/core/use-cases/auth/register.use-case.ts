import prisma from "../../../infrastructure/database/prisma";
import { BcryptService } from "../../../infrastructure/security/bcrypt.service";

interface RegisterInput {
  email: string;
  password: string;
  roleId: string;
}

export async function registerUseCase(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) throw new Error("Email sudah terdaftar");

  const hashed = await BcryptService.hash(input.password);

  return prisma.user.create({
    data: {
      email: input.email,
      password: hashed,
      roleId: input.roleId,
    },
  });
}
