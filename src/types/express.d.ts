import 'express-serve-static-core';

export interface JwtUserPayload {
  id: string;
  role: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtUserPayload;
  }
}