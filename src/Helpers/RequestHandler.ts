import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import HttpError from './HttpError';
import { randomUUID } from 'crypto';
import logger from './Logger';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError
} from '@prisma/client/runtime/library';



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

  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({
        message: 'Duplicated entry',
        errors: error.meta?.target ? [`Unique constraint failed on: ${error.meta.target}`] : ['Duplicate entry detected'],
      });
      return;
    }
    res.status(400).json({
      message: 'Database error',
      errors: [error.message],
    });
    return;
  }

  if (error instanceof PrismaClientValidationError) {
    res.status(400).json({
      message: 'Validation error',
      errors: [error.message],
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
