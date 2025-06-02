import { Router } from 'express';
import * as EpiController from '../Controllers/EpiController';
import RequestHandler from '../Helpers/RequestHandler';
// import { verifyToken, verifyPermission } from '../Middlewares/Auth'; // todo: add later
// import { createLog } from '../Middlewares/createLog'; // todo: add later

const epi = Router();

/// v1/epi

/**
 * @swagger
 * /v1/epi/get/all:
 *   get:
 *     summary: Listar todos os EPIs
 *     description: Retorna uma lista paginada de todos os EPIs cadastrados, com opção de filtro por empresa
 *     tags: [EPI]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: "1"
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "10"
 *         description: Limite de registros por página
 *       - in: query
 *         name: id_empresa
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa para filtrar EPIs
 *     responses:
 *       200:
 *         description: Lista de EPIs recuperada com sucesso
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
 *                         $ref: '#/components/schemas/Epi'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *       400:
 *         description: Parâmetros inválidos
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
epi.get(
  '/get/all',
  // verifyToken,
  // verifyPermission(['epis:read']),
  RequestHandler(EpiController.getAllEpis),
)

/**
 * @swagger
 * /v1/epi/get/{ca}:
 *   get:
 *     summary: Buscar EPI por CA
 *     description: Retorna os dados de um EPI específico baseado no seu Certificado de Aprovação (CA)
 *     tags: [EPI]
 *     parameters:
 *       - in: path
 *         name: ca
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 5
 *           minLength: 5
 *         description: Certificado de Aprovação do EPI (exatamente 5 caracteres)
 *         example: "12345"
 *     responses:
 *       200:
 *         description: EPI encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Epi'
 *       404:
 *         description: EPI não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: CA inválido (deve ter exatamente 5 caracteres)
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
epi.get(
  '/get/:ca',
  // verifyToken,
  // verifyPermission(['epis:read']),
  RequestHandler(EpiController.getEpiByCa),
)

/**
 * @swagger
 * /v1/epi/create:
 *   post:
 *     summary: Criar novo EPI
 *     description: Cria um novo EPI no sistema
 *     tags: [EPI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEpiRequest'
 *           examples:
 *             capacete:
 *               summary: Exemplo de Capacete de Segurança
 *               value:
 *                 ca: "12345"
 *                 id_empresa: "550e8400-e29b-41d4-a716-446655440000"
 *                 nome_epi: "Capacete de Segurança"
 *                 validade: "2025-12-31"
 *                 vida_util: "2024-12-31"
 *                 quantidade: 10
 *                 quantidade_minima: 5
 *                 data_compra: "2025-01-01"
 *             luva:
 *               summary: Exemplo de Luva de Proteção
 *               value:
 *                 ca: "67890"
 *                 id_empresa: "550e8400-e29b-41d4-a716-446655440000"
 *                 nome_epi: "Luva de Proteção"
 *                 vida_util: "2024-06-30"
 *                 quantidade: 25
 *                 quantidade_minima: 10
 *     responses:
 *       201:
 *         description: EPI criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: CA do EPI criado
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Empresa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: CA já cadastrado
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
epi.post(
  '/create',
  // verifyToken,
  // verifyPermission(['epis:create']),
  RequestHandler(EpiController.createEpi),
);

/**
 * @swagger
 * /v1/epi/update/{ca}:
 *   put:
 *     summary: Atualizar EPI existente
 *     description: Atualiza os dados de um EPI existente baseado no seu CA
 *     tags: [EPI]
 *     parameters:
 *       - in: path
 *         name: ca
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 5
 *           minLength: 5
 *         description: Certificado de Aprovação do EPI (exatamente 5 caracteres)
 *         example: "12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEpiRequest'
 *           examples:
 *             atualizacao_quantidade:
 *               summary: Atualizar apenas quantidade
 *               value:
 *                 quantidade: 15
 *             atualizacao_completa:
 *               summary: Atualização completa
 *               value:
 *                 nome_epi: "Capacete de Segurança - Modelo Premium"
 *                 validade: "2026-12-31"
 *                 vida_util: "2025-12-31"
 *                 quantidade: 20
 *                 quantidade_minima: 8
 *     responses:
 *       200:
 *         description: EPI atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: CA do EPI atualizado
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: EPI ou empresa não encontrada
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
epi.put(
  '/update/:ca',
  // verifyToken,
  // verifyPermission(['epis:update']),
  RequestHandler(EpiController.updateEpi),
)

/**
 * @swagger
 * /v1/epi/delete/{ca}:
 *   delete:
 *     summary: Deletar EPI
 *     description: Remove um EPI do sistema baseado no seu CA
 *     tags: [EPI]
 *     parameters:
 *       - in: path
 *         name: ca
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 5
 *           minLength: 5
 *         description: Certificado de Aprovação do EPI (exatamente 5 caracteres)
 *         example: "12345"
 *     responses:
 *       200:
 *         description: EPI deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     epi:
 *                       $ref: '#/components/schemas/Epi'
 *       404:
 *         description: EPI não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: CA inválido
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
epi.delete(
  '/delete/:ca',
  // verifyToken,
  // verifyPermission(['epis:delete']),
  RequestHandler(EpiController.deleteEpi),
)

export default epi;