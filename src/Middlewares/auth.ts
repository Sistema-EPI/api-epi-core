import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../Helpers/Jwt';
import HttpError from '../Helpers/HttpError';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  company?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-token'] as string;
    const authHeader = req.headers['authorization'] as string;
    
    if (!apiKey || !authHeader) {
      res.status(401).json({ 
        error: 'Headers de autenticação obrigatórios',
        message: 'x-api-token e Authorization são obrigatórios'
      });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ 
        error: 'Token inválido',
        message: 'Formato do token deve ser: Bearer <token>'
      });
      return;
    }
    
    // Validar API Key
    const company = await validateApiKey(apiKey);
    if (!company) {
      res.status(403).json({ 
        error: 'API Key inválida',
        message: 'API Key não autorizada para este tenant'
      });
      return;
    }
    
    // Validar JWT
    const decoded = verifyToken(token);
    const user = await getUserById(decoded.userId);
    
    if (!user || !user.statusUser) {
      res.status(401).json({ 
        error: 'Token inválido',
        message: 'Usuário inválido ou inativo'
      });
      return;
    }

    // Verificar se usuário pertence à empresa da API Key
    const authCompany = await prisma.authCompany.findUnique({
      where: {
        idUser_idEmpresa: {
          idUser: user.idUser,
          idEmpresa: company.idEmpresa
        }
      }
    });

    if (!authCompany) {
      res.status(401).json({ 
        error: 'Token inválido',
        message: 'Usuário não autorizado para esta empresa'
      });
      return;
    }
    
    req.user = user;
    req.company = company;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Token inválido',
      message: 'Token expirado ou inválido'
    });
  }
};

const validateApiKey = async (apiKey: string) => {
  const company = await prisma.company.findFirst({
    where: {
      apiKey,
      active: true,
      statusEmpresa: 'ATIVO'
    }
  });
  
  return company;
};

const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      idUser: userId,
      deletedAt: null
    }
  });
  
  return user;
};
