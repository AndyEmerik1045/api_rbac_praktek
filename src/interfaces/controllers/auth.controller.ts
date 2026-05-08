import { Request, Response } from "express";
import { registerUseCase } from "../../core/use-cases/auth/register.use-case";
import { loginUseCase } from "../../core/use-cases/auth/login.use-case";

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const user = await registerUseCase(req.body);
      res.status(201).json(user);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const result = await loginUseCase(req.body);
      res.json(result);
    } catch (e: any) {
      res.status(401).json({ message: e.message });
    }
  },
};
