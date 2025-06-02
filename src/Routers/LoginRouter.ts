import { Router } from 'express';
import * as LoginController from '../Controllers/LoginController'
import RequestHandler from '../Helpers/RequestHandler';
// import { verifyToken, verifyPermission } from '../Middlewares/Auth'; // todo: add later
// import { createLog } from '../Middlewares/createLog'; // todo: add later

//v1/login

const login = Router();

/**
 * @swagger
 * /v1/login/attempt:
 *   post:
 *     summary: Realizar login
 *     description: Autentica um usuário com email e senha, retornando token JWT e lista de empresas associadas
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Dados de login inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "Email ou senha incorretos"
 *       403:
 *         description: Usuário inativo
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "Usuário inativo"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
login.post(
  '/attempt',
  // verifyToken,
  // verifyPermission(['user:write']),
  RequestHandler(LoginController.login),
);

/**
 * @swagger
 * /v1/login/select/company/{id_usuario}/{id_empresa}:
 *   post:
 *     summary: Selecionar empresa para contexto de trabalho
 *     description: Define a empresa específica para o contexto de trabalho do usuário logado
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do usuário
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: path
 *         name: id_empresa
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da empresa
 *         example: "550e8400-e29b-41d4-a716-446655440001"
 *     responses:
 *       200:
 *         description: Empresa selecionada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                           description: Novo token JWT com contexto da empresa
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         empresa:
 *                           $ref: '#/components/schemas/Company'
 *                         cargo:
 *                           type: string
 *                           enum: ['admin', 'gestor', 'técnico', 'viewer']
 *                           description: Cargo do usuário na empresa selecionada
 *                           example: "gestor"
 *       400:
 *         description: IDs inválidos fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário, empresa ou associação não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "Usuário não está associado a esta empresa"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
login.post(
  '/select/company/:id_usuario/:id_empresa',
  // verifyToken,
  // verifyPermission(['user:write']),
  RequestHandler(LoginController.selectCompany),
);

export default login;