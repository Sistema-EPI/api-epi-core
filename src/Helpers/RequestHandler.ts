import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import HttpError from './HttpError';
import { randomUUID } from 'crypto';
import { UniqueConstraintError, ValidationError as SequelizeValidationError } from 'sequelize';
import logger from './Logger';

export default function RequestHandler(
  controller: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export function ErrorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {

  if (error instanceof ZodError) {
    res.status(400).json({ error: error.errors });
    return;
  }

  if (error instanceof UniqueConstraintError) {
    res.status(409).json({
      message: 'Duplicated entry',
      errors: error.errors.map(e => e.message),
    });
    return;
  }

  if (error instanceof SequelizeValidationError) {
    res.status(400).json({
      message: 'Validation error',
      errors: error.errors.map(e => e.message),
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  const errorId = randomUUID();
  logger.error(`Error ${errorId}:`, error);
  res.status(500).json({
    message: `Internal server error. Ref: ${errorId}`
  });
}
