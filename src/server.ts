import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
// import cookieParser from 'cookie-parser';

import EnvSchema from './Schemas/EnvSchema';
export const ENV = EnvSchema.parse(process.env);

// import { db } from './Services/MySQLService';
// import { ErrorMiddleware } from './Helpers/RequestHandler';
import logger from './Helpers/Logger';

// Rotas
import CompanyRouter from './Routers/CompanyRouter';

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// Health check + ping ao MySQL (todo: fix later)
// app.get('/healthz', async (_, res) => {
//   try {
//     await db.execute('SELECT 1');
//     res.status(200).send({ status: 'ok' });
//   } catch (err) {
//     logger.error('Database unavailable', err);
//     res.status(500).send({ status: 'error', message: 'DB unavailable' });
//   }
// });

const apiV1Router = express.Router();
app.use('/v1', apiV1Router);

// Rotas
apiV1Router.use('/company', CompanyRouter);

// Erros
// app.use(ErrorMiddleware);


const server = app.listen(ENV.PORT, () => {
  logger.info(`API is running on port ${ENV.PORT}`);
});

export default server;
