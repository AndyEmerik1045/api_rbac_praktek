import { Request, Response, NextFunction } from "express";
import prisma from "../../infrastructure/database/prisma";

export function checkPermission(requiredSlug: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    const role = await prisma.role.findFirst({
      where: { name: user.role },
      include: { permissions: true },
    });

    const hasPermission = role?.permissions.some(
      (p) => p.slug === requiredSlug
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "No access" });
    }
    next();
  };
}
