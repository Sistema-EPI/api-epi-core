import { Router } from 'express';
import * as LoginController from '../Controllers/LoginController';
import RequestHandler from '../Helpers/RequestHandler';
import { rateLimitMiddleware } from '../Middlewares/rateLimit';
import { authMiddleware } from '../Middlewares/auth';

//v1/auth

const auth = Router();

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: Realizar login com API Key
 *     description: Autentica um usuário com email, senha e API Key, retornando token JWT
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: x-api-token
 *         required: true
 *         schema:
 *           type: string
 *         description: API Key da empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 *       403:
 *         description: API Key inválida
 */
auth.post('/login', rateLimitMiddleware, RequestHandler(LoginController.login));

/**
 * @swagger
 * /v1/auth/refresh:
 *   post:
 *     summary: Renovar token JWT
 *     description: Renova o token JWT usando o token atual e API Key
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token
 *       - in: header
 *         name: x-api-token
 *         required: true
 *         schema:
 *           type: string
 *         description: API Key da empresa
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *       401:
 *         description: Token expirado ou inválido
 */
auth.post('/refresh', RequestHandler(LoginController.refresh));

export default auth;
