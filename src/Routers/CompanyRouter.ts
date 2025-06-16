import { Router } from 'express';
import * as CompanyController from '../Controllers/CompanyController';
import * as LoginController from '../Controllers/LoginController';
import RequestHandler from '../Helpers/RequestHandler';
import { authMiddleware, verifyToken, verifyPermission } from '../Middlewares/auth';
// import { createLog } from '../Middlewares/createLog'; // todo: add later

const company = Router();

/// v1/company

/**
 * @swagger
 * /v1/company/get/all:
 *   get:
 *     summary: Listar todas as empresas
 *     description: Retorna uma lista paginada de todas as empresas cadastradas
 *     tags: [Company]
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
 *     responses:
 *       200:
 *         description: Lista de empresas recuperada com sucesso
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
 *                         $ref: '#/components/schemas/Company'
 */
company.get(
  '/get/all',
  verifyToken,
  verifyPermission(['company:read']),
  RequestHandler(CompanyController.getAllCompanies),
)

/**
 * @swagger
 * /v1/company/get/{id}:
 *   get:
 *     summary: Buscar empresa por ID
 *     description: Retorna os dados de uma empresa específica
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Empresa encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Company'
 *       404:
 *         description: Empresa não encontrada
 */
company.get(
  '/get/:id',
  verifyToken,
  verifyPermission(['company:read']),
  RequestHandler(CompanyController.getCompanyById),
)

/**
 * @swagger
 * /v1/company/create:
 *   post:
 *     summary: Criar nova empresa
 *     description: Cria uma nova empresa no sistema
 *     tags: [Company]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome_fantasia, razao_social, cnpj, cep, email, status_empresa]
 *             properties:
 *               nome_fantasia:
 *                 type: string
 *                 description: Nome fantasia da empresa
 *               razao_social:
 *                 type: string
 *                 description: Razão social da empresa
 *               cnpj:
 *                 type: string
 *                 pattern: '^[0-9]{14}$'
 *                 description: CNPJ da empresa (14 dígitos)
 *               cep:
 *                 type: string
 *                 pattern: '^[0-9]{8}$'
 *                 description: CEP da empresa (8 dígitos)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email da empresa
 *               status_empresa:
 *                 type: string
 *                 enum: [ATIVO, INATIVO]
 *                 description: Status da empresa
 *               uf:
 *                 type: string
 *                 maxLength: 2
 *                 description: UF da empresa (opcional)
 *               logradouro:
 *                 type: string
 *                 description: Endereço da empresa (opcional)
 *               telefone:
 *                 type: string
 *                 description: Telefone da empresa (opcional)
 *     responses:
 *       201:
 *         description: Empresa criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
company.post(
  '/create',
  verifyToken,
  verifyPermission(['company:create']),
  RequestHandler(CompanyController.createCompany),
);

/**
 * @swagger
 * /v1/company/update/{id}:
 *   put:
 *     summary: Atualizar empresa
 *     description: Atualiza os dados de uma empresa existente
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Empresa atualizada com sucesso
 *       404:
 *         description: Empresa não encontrada
 */
company.put(
  '/update/:id',
  verifyToken,
  verifyPermission(['company:update']),
  RequestHandler(CompanyController.updateCompany),
)

/**
 * @swagger
 * /v1/company/delete/{id}:
 *   delete:
 *     summary: Deletar empresa
 *     description: Remove uma empresa do sistema
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Empresa deletada com sucesso
 *       404:
 *         description: Empresa não encontrada
 */
company.delete(
  '/delete/:id',
  verifyToken,
  verifyPermission(['company:delete']),
  RequestHandler(CompanyController.deleteCompany),
)

/**
 * @swagger
 * /v1/company/status/{id}:
 *   put:
 *     summary: Alterar status da empresa
 *     description: Ativa ou desativa uma empresa específica
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status_empresa]
 *             properties:
 *               status_empresa:
 *                 type: boolean
 *                 description: Novo status da empresa (true = ativo, false = inativo)
 *     responses:
 *       200:
 *         description: Status da empresa alterado com sucesso
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
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         nomeFantasia:
 *                           type: string
 *                         cnpj:
 *                           type: string
 *                         statusEmpresa:
 *                           type: boolean
 *                         statusAnterior:
 *                           type: boolean
 *       400:
 *         description: Status já é o mesmo ou dados inválidos
 *       404:
 *         description: Empresa não encontrada
 */
company.put(
  '/status/:id',
  verifyToken,
  verifyPermission(['company:update']),
  RequestHandler(CompanyController.updateCompanyStatus),
)

/**
 * @swagger
 * /v1/company/info:
 *   get:
 *     summary: Obter informações da empresa logada
 *     description: Retorna informações da empresa associada ao token JWT e API Key
 *     tags: [Company]
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
 *         description: Informações da empresa recuperadas com sucesso
 *       401:
 *         description: Token inválido ou expirado
 *       403:
 *         description: API Key inválida
 */
company.get(
  '/info',
  authMiddleware,
  RequestHandler(LoginController.getCompanyInfo),
);

export default company;
