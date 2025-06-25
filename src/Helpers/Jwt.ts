import jwt from 'jsonwebtoken';
import { env } from '../Schemas/EnvSchema';

const JWT_SECRET = env.JWT_SECRET;

if (!JWT_SECRET) throw new Error('JWT_SECRET não definido nas variáveis de ambiente');

export function generateToken(payload: object, expiresIn: string = env.JWT_EXPIRATION): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}
