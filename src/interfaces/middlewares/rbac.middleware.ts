import type { Request, Response, NextFunction } from 'express';

export const rbac = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (user.role !== requiredRole) {
      return res.status(403).json({ message: 'No access' });
    }

    next();
  };
};