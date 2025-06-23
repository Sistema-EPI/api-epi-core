import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken as jwtVerifyToken } from '../Helpers/Jwt';
import HttpError from '../Helpers/HttpError';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  company?: any;
  userRole?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-token'] as string;
    const authHeader = req.headers['authorization'] as string;

    if (!apiKey || !authHeader) {
      res.status(401).json({
        error: 'Headers de autenticação obrigatórios',
        message: 'x-api-token e Authorization são obrigatórios',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        error: 'Token inválido',
        message: 'Formato do token deve ser: Bearer <token>',
      });
      return;
    }

    const company = await validateApiKey(apiKey);
    if (!company) {
      res.status(403).json({
        error: 'API Key inválida',
        message: 'API Key não autorizada para este tenant',
      });
      return;
    }

    const decoded = jwtVerifyToken(token);
    const user = await getUserById(decoded.userId);

    if (!user || !user.statusUser) {
      res.status(401).json({
        error: 'Token inválido',
        message: 'Usuário inválido ou inativo',
      });
      return;
    }

    const authCompany = await prisma.authCompany.findUnique({
      where: {
        idUser_idEmpresa: {
          idUser: user.idUser,
          idEmpresa: company.idEmpresa,
        },
      },
      include: {
        role: true,
      },
    });

    if (!authCompany) {
      res.status(401).json({
        error: 'Token inválido',
        message: 'Usuário não autorizado para esta empresa',
      });
      return;
    }

    req.user = user;
    req.company = company;
    req.userRole = authCompany.role;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Token inválido',
      message: 'Token expirado ou inválido',
    });
  }
};

const validateApiKey = async (apiKey: string) => {
  const company = await prisma.company.findFirst({
    where: {
      apiKey,
      statusEmpresa: true,
    },
  });

  return company;
};

const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      idUser: userId,
      deletedAt: null,
    },
  });

  return user;
};

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-token'] as string;
    const authHeader = req.headers['authorization'] as string;

    if (!apiKey || !authHeader) {
      res.status(401).json({
        error: 'Headers de autenticação obrigatórios',
        message: 'x-api-token e Authorization são obrigatórios',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        error: 'Token inválido',
        message: 'Formato do token deve ser: Bearer <token>',
      });
      return;
    }

    const company = await validateApiKey(apiKey);
    if (!company) {
      res.status(403).json({
        error: 'API Key inválida',
        message: 'API Key não autorizada para este tenant',
      });
      return;
    }

    const decoded = jwtVerifyToken(token);
    const user = await getUserById(decoded.userId);

    if (!user || !user.statusUser) {
      res.status(401).json({
        error: 'Token inválido',
        message: 'Usuário inválido ou inativo',
      });
      return;
    }

    const authCompany = await prisma.authCompany.findUnique({
      where: {
        idUser_idEmpresa: {
          idUser: user.idUser,
          idEmpresa: company.idEmpresa,
        },
      },
      include: {
        role: true,
      },
    });

    if (!authCompany) {
      res.status(401).json({
        error: 'Token inválido',
        message: 'Usuário não autorizado para esta empresa',
      });
      return;
    }

    req.user = user;
    req.company = company;
    req.userRole = authCompany.role;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Token inválido',
      message: 'Token expirado ou inválido',
    });
  }
};

export const verifyPermission = (requiredActions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userRole = req.userRole;

      if (!userRole) {
        res.status(403).json({
          error: 'Acesso negado',
          message: 'Cargo do usuário não encontrado',
        });
        return;
      }

      const permissions = userRole.permissao as any;

      for (const action of requiredActions) {
        const [resource, operation] = action.split(':');

        switch (operation) {
          case 'create':
            if (!permissions.create) {
              res.status(403).json({
                error: 'Acesso negado',
                message: `Usuário não tem permissão para criar ${resource}`,
              });
              return;
            }
            break;
          case 'read':
            if (!permissions.read) {
              res.status(403).json({
                error: 'Acesso negado',
                message: `Usuário não tem permissão para visualizar ${resource}`,
              });
              return;
            }
            break;
          case 'update':
            if (!permissions.update) {
              res.status(403).json({
                error: 'Acesso negado',
                message: `Usuário não tem permissão para atualizar ${resource}`,
              });
              return;
            }
            break;
          case 'delete':
            if (!permissions.delete) {
              res.status(403).json({
                error: 'Acesso negado',
                message: `Usuário não tem permissão para excluir ${resource}`,
              });
              return;
            }
            break;
          default:
            res.status(403).json({
              error: 'Acesso negado',
              message: `Operação ${operation} não reconhecida`,
            });
            return;
        }
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: 'Erro interno',
        message: 'Erro ao verificar permissões',
      });
    }
  };
};
