import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export const JwtService = {
  sign(payload: object): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  },

  verify(token: string): jwt.JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
  },
};
