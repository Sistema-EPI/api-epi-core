import { Request } from 'express';

// Interface para request autenticado
export interface AuthRequest extends Request {
  user?: {
    idUser: string;
    email: string;
    name?: string;
  };
  company?: {
    idEmpresa: string;
    nomeFantasia: string;
  };
}
