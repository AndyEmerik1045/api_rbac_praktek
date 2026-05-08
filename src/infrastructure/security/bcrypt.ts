import bcrypt from 'bcryptjs';

export const hashPassword = (password: string) =>
  bcrypt.hash(password, 10);

export const comparePassword = (p: string, h: string) =>
  bcrypt.compare(p, h);