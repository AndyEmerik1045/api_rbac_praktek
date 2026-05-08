import type { Request, Response } from 'express';
import { RegisterUseCase } from '../../core/use-cases/register.usecase';
import { LoginUseCase } from '../../core/use-cases/login.usecase';
export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, roleId } = req.body;
      const data = await new RegisterUseCase().execute(email, password, roleId);
      return res.json(data);
    } catch (e: any) {
      return res.status(400).json({ message: e.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const token = await new LoginUseCase().execute(email, password);
      return res.json({ token });
    } catch (e: any) {
      return res.status(401).json({ message: e.message });
    }
  }
}