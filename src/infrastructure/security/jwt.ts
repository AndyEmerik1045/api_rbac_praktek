import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env';

export interface JwtUserPayload {
  id: string;
  role: string;
}

// ✅ Sign token (type-safe)
export const signToken = (payload: JwtUserPayload) => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// 🔥 Type guard (biar TS ngerti struktur payload)
const isValidPayload = (data: any): data is JwtUserPayload => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'role' in data
  );
};

// ✅ Verify token (aman + type-safe)
export const verifyToken = (token: string): JwtUserPayload => {
  const decoded = jwt.verify(token, ENV.JWT_SECRET);

  if (!isValidPayload(decoded)) {
    throw new Error('Invalid token payload');
  }

  return decoded;
};