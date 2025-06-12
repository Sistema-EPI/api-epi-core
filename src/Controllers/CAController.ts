import { Request, Response, NextFunction } from 'express';
import { CAParamSchema } from '../Schemas/CASchema';
import caService from '../Services/caService';
import logger from '../Helpers/Logger';
import HttpResponse from '../Helpers/HttpResponse';
import HttpError from '../Helpers/HttpError';

export async function consultarCA(req: Request, res: Response, next: NextFunction) {
  try {

    const { ca } = CAParamSchema.parse(req.params);
    
    logger.info(`Iniciando consulta para CA: ${ca}`);


    const resultado = await caService.consultarCA(ca);


    const response = HttpResponse.Ok({
      message: 'Consulta realizada com sucesso',
      data: resultado
    });
    
    return res.status(response.statusCode).json(response.payload);
    
  } catch (error) {
    logger.error('Erro no controller de consulta CA:', error);
    
    if (error instanceof Error) {
      return next(new HttpError(error.message, 400));
    }
    
    return next(new HttpError('Erro interno do servidor', 500));
  }
}