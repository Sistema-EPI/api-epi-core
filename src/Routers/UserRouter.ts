import { Router } from 'express';
import RequestHandler from '../Helpers/RequestHandler';
import * as UserController from '../Controllers/UserController';
import { verifyToken, verifyPermission } from '../Middlewares/auth';
// import { createLog } from '../Middlewares/createLog'; // todo: add later

//v1/user

const user = Router();

/**
 * @swagger
 * /v1/user/get/all:
 *   get:
 *     summary: Buscar todos os usuários
 *     description: Retorna uma lista paginada de todos os usuários do sistema
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: Número da página (opcional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Limite de registros por página (opcional)
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
user.get(
  '/get/all',
  verifyToken,
  verifyPermission(['user:read']),
  RequestHandler(UserController.getAllUsers),
);

/**
 * @swagger
 * /v1/user/create/{id}:
 *   post:
 *     summary: Criar novo usuário
 *     description: Cria um novo usuário associado a uma empresa
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa para associar o usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Usuário com email já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
user.post(
  '/create/:id',
  verifyToken,
  verifyPermission(['user:create']),
  RequestHandler(UserController.createUser),
);

/**
 * @swagger
 * /v1/user/get/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     description: Retorna um usuário específico pelo seu ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
user.get(
  '/get/:id',
  verifyToken,
  verifyPermission(['user:read']),
  RequestHandler(UserController.getUserById),
);

/**
 * @swagger
 * /v1/user/{userId}/connect/{companyId}:
 *   post:
 *     summary: Conectar usuário a empresa
 *     description: Vincula um usuário a uma empresa com um cargo específico
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do usuário
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConnectUserToCompanyRequest'
 *     responses:
 *       200:
 *         description: Usuário conectado à empresa com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthCompany'
 *       400:
 *         description: Dados inválidos fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário ou empresa não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
user.post(
  '/:userId/connect/:companyId',
  verifyToken,
  verifyPermission(['user:update']),
  RequestHandler(UserController.connectUserToCompany),
);

/**
 * @swagger
 * /v1/user/{userId}/update/password:
 *   put:
 *     summary: Alterar senha do usuário
 *     description: Permite que um usuário altere sua senha fornecendo a senha atual
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Dados inválidos ou senha atual incorreta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
user.put(
  '/:userId/update/password',
  verifyToken,
  verifyPermission(['user:update']),
  RequestHandler(UserController.updateUserPassword),
);

/**
 * @swagger
 * /v1/user/{userId}/update/status:
 *   put:
 *     summary: Atualizar status do usuário
 *     description: Atualiza o status ativo/inativo e opcionalmente o email do usuário
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserStatusRequest'
 *     responses:
 *       200:
 *         description: Status do usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
user.put(
  '/:userId/update/status',
  verifyToken,
  verifyPermission(['user:update']),
  RequestHandler(UserController.updateUserStatus),
);

/**
 * @swagger
 * /v1/user/{userId}/update:
 *   put:
 *     summary: Atualizar dados do usuário
 *     description: Atualiza nome, email e/ou senha do usuário
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos ou email já em uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
user.put(
  '/:userId/update',
  verifyToken,
  verifyPermission(['user:update']),
  RequestHandler(UserController.updateUser),
);

/**
 * @swagger
 * /v1/user/{userId}/delete:
 *   delete:
 *     summary: Excluir usuário
 *     description: Remove um usuário do sistema (soft delete)
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do usuário
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
user.delete(
  '/:userId/delete',
  verifyToken,
  verifyPermission(['user:delete']),
  RequestHandler(UserController.deleteUser),
);

/**
 * @swagger
 * /v1/user/company/{companyId}:
 *   get:
 *     summary: Buscar usuários por empresa
 *     description: Retorna uma lista de usuários vinculados a uma empresa específica
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da empresa
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: Número da página (opcional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Limite de registros por página (opcional)
 *     responses:
 *       200:
 *         description: Lista de usuários da empresa retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       404:
 *         description: Empresa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
user.get(
  '/company/:companyId',
  verifyToken,
  verifyPermission(['user:read']),
  RequestHandler(UserController.getUsersByCompany),
);

/**
 * @swagger
 * /v1/user/admin/create:
 *   post:
 *     summary: Criar usuário administrador
 *     description: Cria um novo usuário com privilégios de administrador do sistema
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdminUserRequest'
 *     responses:
 *       201:
 *         description: Usuário administrador criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Usuário com email já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
user.post(
  '/admin/create',
  verifyToken,
  verifyPermission(['admin:create']),
  RequestHandler(UserController.createAdminUser),
);

export default user;
