import { env } from './Schemas/EnvSchema';
import express from 'express';
import logger from './Helpers/Logger';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { setupSwagger } from './Config/swagger';

export const prisma = new PrismaClient();

import CompanyRouter from './Routers/CompanyRouter';
import CollaboratorRouter from './Routers/CollaboratorRouter';
import EpiRouter from './Routers/EpiRouter';
import AuthRouter from './Routers/AuthRouter';
import UserRouter from './Routers/UserRouter';
import BiometriaRouter from './Routers/BiometriaRouter';
import CARouter from './Routers/CARouter';
import ProcessRouter from './Routers/ProcessRouter';
import DashboardRouter from './Routers/DashboardRouter';
import FinancialReportRouter from './Routers/FinancialReportRouter';

import { ErrorMiddleware } from './Helpers/RequestHandler';

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));

const ALLOWED_ORIGINS = env.CORS_ORIGIN.split(',').map((origin: string) => origin.trim());

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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

app.use(cookieParser());

const apiV1Router = express.Router();
app.use('/v1', apiV1Router);

apiV1Router.use('/auth', AuthRouter);
apiV1Router.use('/company', CompanyRouter);
apiV1Router.use('/collaborator', CollaboratorRouter);
apiV1Router.use('/epi', EpiRouter);
apiV1Router.use('/biometria', BiometriaRouter);
apiV1Router.use('/user', UserRouter);
apiV1Router.use('/consulta-epi', CARouter);
apiV1Router.use('/process', ProcessRouter);
apiV1Router.use('/dashboard', DashboardRouter);
apiV1Router.use('/financial-reports', FinancialReportRouter);

setupSwagger(app);

app.use(ErrorMiddleware);

async function startServer() {
  try {
    logger.info('Conectando ao banco de dados...');
    await prisma.$connect();
    logger.info('Conectado ao banco de dados com sucesso.');

    logger.info(`Iniciando servidor na porta ${env.PORT}...`);
    app.listen(env.PORT, () => {
      logger.info(`API is running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error('Erro ao conectar com o banco de dados:', error);
    throw error;
  }
}

startServer().catch(error => {
  logger.error('Falha ao iniciar servidor:', error);
  process.exit(1);
});
