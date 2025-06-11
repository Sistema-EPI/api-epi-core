import { Router } from 'express';
import * as LoginController from '../Controllers/LoginController'
import RequestHandler from '../Helpers/RequestHandler';
import { rateLimitMiddleware } from '../Middlewares/rateLimit';

const auth = Router();

auth.post(
  '/login',
  rateLimitMiddleware,
  RequestHandler(LoginController.login),
);

auth.post(
  '/refresh',
  RequestHandler(LoginController.refresh),
);

export default auth;
