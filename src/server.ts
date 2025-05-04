import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
// import cookieParser from 'cookie-parser';

import EnvSchema from './Schemas/EnvSchema';
export const ENV = EnvSchema.parse(process.env);
import logger from './Helpers/Logger';
import { sequelize } from './Config/db';

// Rotas
import CompanyRouter from './Routers/CompanyRouter';
import { ErrorMiddleware } from './Helpers/RequestHandler';


const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

const apiV1Router = express.Router();
app.use('/v1', apiV1Router);

// Rotas
apiV1Router.use('/company', CompanyRouter);

// Erros
app.use(ErrorMiddleware);


sequelize.sync({ alter: true }).then(() => {
  app.listen(ENV.PORT, () => {
    logger.info(`API is running on port ${ENV.PORT}`);
  });
});
