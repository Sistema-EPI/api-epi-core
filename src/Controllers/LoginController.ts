import { Request, Response, NextFunction } from 'express';
import { LoginSchema } from '../Schemas/LoginSchema';
import { AuthService } from '../Services/authService';
import { CompanyService } from '../Services/companyService';
import HttpError from '../Helpers/HttpError';
import logger from '../Helpers/Logger';

const authService = new AuthService();
const companyService = new CompanyService();

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const apiKey = req.headers['x-api-token'] as string;

    if (!email || !password || !apiKey) {
      res.status(400).json({
        error: 'Email, senha e API Key são obrigatórios',
      });
      return;
    }

    const result = await authService.authenticate(email, password, apiKey);

    logger.info('Login successful', {
      userId: result.user.id,
      companyId: result.company.id,
      email: result.user.email,
      ip: req.ip,
    });

    res.json(result);
  } catch (error: any) {
    logger.error('Login failed', {
      email: req.body.email,
      error: error.message,
      ip: req.ip,
    });

    const statusCode = error.message.includes('API Key') ? 403 : 401;
    res.status(statusCode).json({
      error: error.message.includes('API Key') ? 'API Key invalid' : 'Invalid credentials',
      message: error.message,
    });
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const apiKey = req.headers['x-api-token'] as string;

    if (!token || !apiKey) {
      res.status(401).json({
        error: 'Headers de autenticação obrigatórios',
      });
      return;
    }

    const result = await authService.refreshToken(token, apiKey);

    logger.info('Token refreshed', {
      userId: result.user.id,
      ip: req.ip,
    });

    res.json(result);
  } catch (error: any) {
    logger.error('Token refresh failed', {
      error: error.message,
      ip: req.ip,
    });

    res.status(401).json({
      error: 'Token expired',
      message: error.message,
    });
  }
}

export async function getCompanyInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const companyId = (req as any).company?.idEmpresa;

    if (!companyId) {
      res.status(401).json({
        error: 'Empresa não identificada',
      });
      return;
    }

    const companyInfo = await companyService.getCompanyInfo(companyId);

    res.json(companyInfo);
  } catch (error: any) {
    logger.error('Get company info failed', {
      error: error.message,
      ip: req.ip,
    });

    res.status(404).json({
      error: 'Empresa não encontrada',
      message: error.message,
    });
  }
}
