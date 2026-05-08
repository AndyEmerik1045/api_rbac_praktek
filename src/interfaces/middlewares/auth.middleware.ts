import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../infrastructure/security/jwt';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Invalid or missing Authorization header',
    });
  }

  const token = authHeader.split(' ')[1];

  // ✅ FIX untuk TypeScript
  if (!token) {
    return res.status(401).json({
      message: 'Invalid token format',
    });
  }

  try {
    const decoded = verifyToken(token);

    req.user = decoded;

    return next();
  } catch (error) {
    return res.status(403).json({
      message: 'Invalid or expired token',
    });
  }
};