import prisma from "../../../infrastructure/database/prisma";
import { BcryptService } from "../../../infrastructure/security/bcrypt.service";
import { JwtService } from "../../../infrastructure/security/jwt.service";

interface LoginInput {
  email: string;
  password: string;
}

export async function loginUseCase(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { role: true },
  });
  if (!user) throw new Error("Email atau password salah");

  const valid = await BcryptService.compare(input.password, user.password);
  if (!valid) throw new Error("Email atau password salah");

  const token = JwtService.sign({
    id: user.id,
    role: user.role.name,
  });

  return { token };
}
