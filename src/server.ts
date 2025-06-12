import dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import EnvSchema from './Schemas/EnvSchema';
export const ENV = EnvSchema.parse(process.env);
import logger from './Helpers/Logger';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { setupSwagger } from './Config/swagger';
export const prisma = new PrismaClient();

// Rotas
import CompanyRouter from './Routers/CompanyRouter';
import CollaboratorRouter from './Routers/CollaboratorRouter';
import EpiRouter from './Routers/EpiRouter';
import AuthRouter from './Routers/AuthRouter';
import UserRouter from './Routers/UserRouter';
import CARouter from './Routers/CARouter';

// Middlewares
import { ErrorMiddleware } from './Helpers/RequestHandler';

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));

const ALLOWED_ORIGINS = ENV.CORS_ORIGIN.split(',').map((origin) => origin.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
        return callback(new Error('Not allowed by cors'), false);
      }

      return callback(null, true);
    },
    credentials: true,
    allowedHeaders: ['x-api-token', 'Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }),
);

app.use(cookieParser());

const apiV1Router = express.Router();
app.use('/v1', apiV1Router);

// Rotas
apiV1Router.use('/auth', AuthRouter);
apiV1Router.use('/company', CompanyRouter);
apiV1Router.use('/collaborator', CollaboratorRouter);
apiV1Router.use('/epi', EpiRouter);
apiV1Router.use('/user', UserRouter);
apiV1Router.use('/consulta-epi', CARouter);

// Configurar Swagger
setupSwagger(app);

// Erros
app.use(ErrorMiddleware);

async function startServer() {
  try {
    await prisma.$connect();
    logger.info('Conectado ao banco de dados com sucesso.');

    app.listen(ENV.PORT, () => {
      logger.info(`API is running on port ${ENV.PORT}`);
    });
  } catch (error) {
    logger.error('Erro ao conectar com o banco de dados:', error);
    process.exit(1);
  }
}

startServer();