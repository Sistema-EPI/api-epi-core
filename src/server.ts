import dotenv from 'dotenv';
// Carrega .env apenas se o arquivo existir (desenvolvimento)
try {
  dotenv.config();
} catch (error) {
  // Em produção as variáveis vêm do sistema de deploy
  console.log('📄 Usando variáveis de ambiente do sistema');
}

import express from 'express';

console.log('📄 Carregando variáveis de ambiente...');
console.log('🔍 Variáveis disponíveis:', {
  NODE_ENV: process.env.NODE_ENV,
  ENV: process.env.ENV,
  DATABASE_URL: process.env.DATABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA',
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN ? 'DEFINIDA' : 'NÃO DEFINIDA',
  JWT_SECRET: process.env.JWT_SECRET ? 'DEFINIDA' : 'NÃO DEFINIDA',
});

import EnvSchema from './Schemas/EnvSchema';
console.log('✅ Schema carregado, validando variáveis...');
export const ENV = EnvSchema.parse(process.env);
console.log('✅ Variáveis validadas com sucesso!');

import logger from './Helpers/Logger';
console.log('✅ Logger carregado');
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { setupSwagger } from './Config/swagger';
console.log('✅ Imports carregados, inicializando Prisma...');
export const prisma = new PrismaClient();
console.log('✅ Prisma inicializado!');

// Rotas
import CompanyRouter from './Routers/CompanyRouter';
import CollaboratorRouter from './Routers/CollaboratorRouter';
import EpiRouter from './Routers/EpiRouter';
import AuthRouter from './Routers/AuthRouter';
import UserRouter from './Routers/UserRouter';
import BiometriaRouter from './Routers/BiometriaRouter';
import CARouter from './Routers/CARouter';
import ProcessRouter from './Routers/ProcessRouter';

// Middlewares
import { ErrorMiddleware } from './Helpers/RequestHandler';

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));

const ALLOWED_ORIGINS = ENV.CORS_ORIGIN.split(',').map(origin => origin.trim());

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

// Rotas
apiV1Router.use('/auth', AuthRouter);
apiV1Router.use('/company', CompanyRouter);
apiV1Router.use('/collaborator', CollaboratorRouter);
apiV1Router.use('/epi', EpiRouter);
apiV1Router.use('/biometria', BiometriaRouter);
apiV1Router.use('/user', UserRouter);
apiV1Router.use('/consulta-epi', CARouter);
apiV1Router.use('/process', ProcessRouter);

// Configurar Swagger
setupSwagger(app);

// Erros
app.use(ErrorMiddleware);

async function startServer() {
  try {
    console.log('🔌 Tentando conectar ao banco de dados...');
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados com sucesso!');
    logger.info('Conectado ao banco de dados com sucesso.');

    console.log(`🚀 Iniciando servidor na porta ${ENV.PORT}...`);
    app.listen(ENV.PORT, () => {
      console.log(`✅ API rodando na porta ${ENV.PORT}`);
      logger.info(`API is running on port ${ENV.PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    logger.error('Erro ao conectar com o banco de dados:', error);
    process.exit(1);
  }
}

console.log('🚀 Iniciando startServer()...');
startServer();
