import { Request, Response, NextFunction } from "express";
import { JwtService } from "../../infrastructure/security/jwt.service";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak valid" });
  }

  try {
    const token = header.split(" ")[1];
    const payload = JwtService.verify(token);
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Token expired atau tidak valid" });
  }
}
