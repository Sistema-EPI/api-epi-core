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
 * /v1/epi/get/{id}:
 *   get:
 *     summary: Obter EPI por ID
 *     description: Retorna os dados de um EPI específico baseado no seu ID único
 *     tags: [EPI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do EPI
 *         example: "550e8400-e29b-41d4-a716-446655440000"
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
 *         description: ID inválido (deve ser um UUID válido)
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
  '/get/:id',
  // verifyToken,
  // verifyPermission(['epis:read']),
  RequestHandler(EpiController.getEpiById),
)

/**
 * @swagger
 * /v1/epi/get/empresa/{id_empresa}:
 *   get:
 *     summary: Listar EPIs de uma empresa específica
 *     description: Retorna uma lista paginada de todos os EPIs de uma empresa específica
 *     tags: [EPI]
 *     parameters:
 *       - in: path
 *         name: id_empresa
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único da empresa
 *         example: "550e8400-e29b-41d4-a716-446655440000"
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
 *     responses:
 *       200:
 *         description: Lista de EPIs da empresa recuperada com sucesso
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
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total de registros
 *                         page:
 *                           type: integer
 *                           description: Página atual
 *                         limit:
 *                           type: integer
 *                           description: Limite de registros por página
 *                         totalPages:
 *                           type: integer
 *                           description: Total de páginas
 *                         hasNext:
 *                           type: boolean
 *                           description: Indica se há próxima página
 *                         hasPrev:
 *                           type: boolean
 *                           description: Indica se há página anterior
 *       404:
 *         description: Empresa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: ID da empresa inválido (deve ser um UUID válido)
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
  '/get/empresa/:id_empresa',
  // verifyToken,
  // verifyPermission(['epis:read']),
  RequestHandler(EpiController.getEpisByEmpresa),
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
 *             type: object
 *             required:
 *               - ca
 *               - id_empresa
 *               - nome_epi
 *               - quantidade
 *               - quantidade_minima
 *             properties:
 *               ca:
 *                 type: string
 *                 maxLength: 20
 *                 description: Certificado de Aprovação do EPI
 *               id_empresa:
 *                 type: string
 *                 format: uuid
 *                 description: ID da empresa
 *               nome_epi:
 *                 type: string
 *                 description: Nome do EPI
 *               validade:
 *                 type: string
 *                 format: date
 *                 description: Data de validade do EPI
 *               descricao:
 *                 type: string
 *                 description: Descrição do EPI
 *               quantidade:
 *                 type: integer
 *                 minimum: 0
 *                 description: Quantidade em estoque
 *               quantidade_minima:
 *                 type: integer
 *                 minimum: 0
 *                 description: Quantidade mínima em estoque
 *               data_compra:
 *                 type: string
 *                 format: date
 *                 description: Data da compra
 *               vida_util:
 *                 type: string
 *                 format: date
 *                 description: Data limite de vida útil
 *           examples:
 *             capacete:
 *               summary: Exemplo de Capacete de Segurança
 *               value:
 *                 ca: "12345"
 *                 id_empresa: "550e8400-e29b-41d4-a716-446655440000"
 *                 nome_epi: "Capacete de Segurança"
 *                 descricao: "Capacete de segurança classe A"
 *                 validade: "2025-12-31"
 *                 vida_util: "2024-12-31"
 *                 quantidade: 10
 *                 quantidade_minima: 5
 *                 data_compra: "2025-01-01"
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
 *                     data:
 *                       $ref: '#/components/schemas/Epi'
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
 *         description: CA já cadastrado para esta empresa
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
 * /v1/epi/update/{id}:
 *   put:
 *     summary: Atualizar EPI existente
 *     description: Atualiza os dados de um EPI existente baseado no seu ID
 *     tags: [EPI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do EPI
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ca:
 *                 type: string
 *                 maxLength: 20
 *                 description: Certificado de Aprovação do EPI
 *               id_empresa:
 *                 type: string
 *                 format: uuid
 *                 description: ID da empresa
 *               nome_epi:
 *                 type: string
 *                 description: Nome do EPI
 *               validade:
 *                 type: string
 *                 format: date
 *                 description: Data de validade do EPI
 *               descricao:
 *                 type: string
 *                 description: Descrição do EPI
 *               quantidade:
 *                 type: integer
 *                 minimum: 0
 *                 description: Quantidade em estoque
 *               quantidade_minima:
 *                 type: integer
 *                 minimum: 0
 *                 description: Quantidade mínima em estoque
 *               data_compra:
 *                 type: string
 *                 format: date
 *                 description: Data da compra
 *               vida_util:
 *                 type: string
 *                 format: date
 *                 description: Data limite de vida útil
 *           examples:
 *             atualizacao_quantidade:
 *               summary: Atualizar apenas quantidade
 *               value:
 *                 quantidade: 15
 *             atualizacao_completa:
 *               summary: Atualização completa
 *               value:
 *                 nome_epi: "Capacete de Segurança - Modelo Premium"
 *                 descricao: "Capacete premium com certificação A+"
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
 *                     data:
 *                       $ref: '#/components/schemas/Epi'
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
 *       409:
 *         description: CA já cadastrado para esta empresa
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
  '/update/:id',
  // verifyToken,
  // verifyPermission(['epis:update']),
  RequestHandler(EpiController.updateEpi),
)

/**
 * @swagger
 * /v1/epi/delete/{id}:
 *   delete:
 *     summary: Deletar EPI
 *     description: Remove um EPI do sistema baseado no seu ID
 *     tags: [EPI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do EPI
 *         example: "550e8400-e29b-41d4-a716-446655440000"
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
 *                     data:
 *                       $ref: '#/components/schemas/Epi'
 *       404:
 *         description: EPI não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: ID inválido
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
  '/delete/:id',
  // verifyToken,
  // verifyPermission(['epis:delete']),
  RequestHandler(EpiController.deleteEpi),
)

export default epi;
