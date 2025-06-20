import { Router } from "express";
import RequestHandler from "../Helpers/RequestHandler";
import * as CollaboratorController from '../Controllers/CollaboratorController';
import { verifyToken, verifyPermission } from '../Middlewares/auth';

const collaborator = Router();

//v1/collaborator

/**
 * @swagger
 * /v1/collaborator/get/all:
 *   get:
 *     summary: Buscar todos os colaboradores
 *     description: Retorna uma lista paginada de todos os colaboradores
 *     tags: [Collaborator]
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
 *         description: Lista de colaboradores retornada com sucesso
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
 *                         $ref: '#/components/schemas/Collaborator'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
collaborator.get(
    '/get/all',
    verifyToken,
    verifyPermission(['collaborator:read']),
    RequestHandler(CollaboratorController.getAllCollaborators),
);

/**
 * @swagger
 * /v1/collaborator/get/{id}:
 *   get:
 *     summary: Buscar colaborador por ID
 *     description: Retorna um colaborador específico pelo seu ID
 *     tags: [Collaborator]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do colaborador
 *     responses:
 *       200:
 *         description: Colaborador encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Collaborator'
 *       404:
 *         description: Colaborador não encontrado
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
collaborator.get(
    '/get/:id',
    verifyToken,
    verifyPermission(['collaborator:read']),
    RequestHandler(CollaboratorController.getCollaboratorById),
)

/**
 * @swagger
 * /v1/collaborator/create/{companyId}:
 *   post:
 *     summary: Criar novo colaborador
 *     description: Cria um novo colaborador associado a uma empresa
 *     tags: [Collaborator]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa para associar o colaborador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCollaboratorRequest'
 *     responses:
 *       201:
 *         description: Colaborador criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Collaborator'
 *       400:
 *         description: Dados inválidos fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Colaborador com CPF já existe
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
collaborator.post(
    '/create/:companyId',
    verifyToken,
    verifyPermission(['collaborator:create']),
    RequestHandler(CollaboratorController.createCollaborator),
);

/**
 * @swagger
 * /v1/collaborator/update/{id}:
 *   put:
 *     summary: Atualizar colaborador
 *     description: Atualiza os dados de um colaborador existente
 *     tags: [Collaborator]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do colaborador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCollaboratorRequest'
 *     responses:
 *       200:
 *         description: Colaborador atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Collaborator'
 *       400:
 *         description: Dados inválidos fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Colaborador não encontrado
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
collaborator.put(
    '/update/:id',
    verifyToken,
    verifyPermission(['collaborator:update']),
    RequestHandler(CollaboratorController.updateCollaborator),
)

/**
 * @swagger
 * /v1/collaborator/delete/{id}:
 *   delete:
 *     summary: Excluir colaborador
 *     description: Remove um colaborador do sistema
 *     tags: [Collaborator]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do colaborador
 *     responses:
 *       200:
 *         description: Colaborador excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Colaborador não encontrado
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
collaborator.delete(
    '/delete/:id',
    verifyToken,
    verifyPermission(['collaborator:delete']),
    RequestHandler(CollaboratorController.deleteCollaborator),
)

/**
 * @swagger
 * /v1/collaborator/company/{companyId}:
 *   get:
 *     summary: Buscar colaboradores por empresa
 *     description: Retorna uma lista paginada de colaboradores de uma empresa específica
 *     tags: [Collaborator]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtro por status ativo/inativo (opcional)
 *     responses:
 *       200:
 *         description: Lista de colaboradores da empresa retornada com sucesso
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
 *                         $ref: '#/components/schemas/Collaborator'
 *                     company:
 *                       type: object
 *                       properties:
 *                         idEmpresa:
 *                           type: string
 *                         nomeFantasia:
 *                           type: string
 *                         razaoSocial:
 *                           type: string
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
collaborator.get(
    '/company/:companyId',
    verifyToken,
    verifyPermission(['collaborator:read']),
    RequestHandler(CollaboratorController.getCollaboratorsByCompany),
);

export default collaborator;

