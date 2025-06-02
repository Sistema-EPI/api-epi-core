import jwt, { SignOptions } from 'jsonwebtoken';
import { ENV } from '../server';

const JWT_SECRET = ENV.JWT_SECRET;

if (!JWT_SECRET) throw new Error('JWT_SECRET não definido nas variáveis de ambiente');

export function generateToken(payload: object, expiresIn = '1h' as const): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}
