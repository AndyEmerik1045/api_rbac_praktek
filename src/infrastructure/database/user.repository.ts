import { prisma } from './prisma.client';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async create(data: any) {
    return prisma.user.create({ data });
  }
}