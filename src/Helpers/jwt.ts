// import jwt from 'jsonwebtoken';
// import { ENV } from '../server';

// const JWT_SECRET: string = ENV.JWT_SECRET as string;

// interface TokenPayload {
//     sub: string;
//     empresaId: string;
//     cargo: string;
//     permissoes: any;
// }

// export const generateToken = (payload: TokenPayload, expiresIn: string | number = '1h') => {
//     return jwt.sign(payload, JWT_SECRET, {
//         expiresIn,
//     });
// };
