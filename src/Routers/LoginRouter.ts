import { Router } from 'express';
import * as LoginController from '../Controllers/LoginController';
import RequestHandler from '../Helpers/RequestHandler';
import { rateLimitMiddleware } from '../Middlewares/rateLimit';

const router = Router();

// POST /v1/auth/login
router.post('/login', rateLimitMiddleware, RequestHandler(LoginController.login));

// POST /v1/auth/refresh
router.post('/refresh', RequestHandler(LoginController.refresh));

export default router;
