import { Request, Response, NextFunction } from 'express';
import { LogService } from '../../Services/Logs/logService';
import HttpResponse from '../../Helpers/HttpResponse';
import HttpError from '../../Helpers/HttpError';
import { EPI_LOG_TYPES } from '../../types/logTypes';
import { EpiLogService } from '../../Services/Logs/epiLogService';

/**
 * Busca logs de um EPI específico
 */
export async function getEpiLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { epiId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!epiId) {
      throw new HttpError('ID do EPI é obrigatório', 400);
    }

    const logs = await EpiLogService.getEpiLogs(epiId, limit);

    const response = HttpResponse.Ok({
      message: 'Logs do EPI recuperados com sucesso',
      data: logs,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getEpiLogs:', err);
    next(err);
  }
}

/**
 * Busca logs de EPIs de uma empresa
 */
export async function getCompanyEpiLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;

    if (!companyId) {
      throw new HttpError('ID da empresa é obrigatório', 400);
    }

    const logs = await EpiLogService.getCompanyEpiLogs(companyId, limit);

    const response = HttpResponse.Ok({
      message: 'Logs de EPIs da empresa recuperados com sucesso',
      data: logs,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getCompanyEpiLogs:', err);
    next(err);
  }
}

/**
 * Retorna tipos de logs de EPI disponíveis
 */
export async function getEpiLogTypes(req: Request, res: Response, next: NextFunction) {
  try {
    const logTypes = Object.values(EPI_LOG_TYPES);

    const response = HttpResponse.Ok({
      message: 'Tipos de logs de EPI recuperados com sucesso',
      data: logTypes,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getEpiLogTypes:', err);
    next(err);
  }
}
