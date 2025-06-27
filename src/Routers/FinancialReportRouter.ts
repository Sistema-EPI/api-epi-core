import { Router } from 'express';
import * as FinancialReportController from '../Controllers/FinancialReportController';
import { verifyToken, verifyPermission } from '../Middlewares/auth';
import RequestHandler from '../Helpers/RequestHandler';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AnnualEpiCost:
 *       type: object
 *       properties:
 *         epiId:
 *           type: string
 *           format: uuid
 *           description: ID do EPI
 *         nomeEpi:
 *           type: string
 *           description: Nome do EPI
 *         ca:
 *           type: string
 *           description: Certificado de Aprovação
 *         ano:
 *           type: integer
 *           description: Ano
 *         totalGasto:
 *           type: number
 *           format: float
 *           description: Total gasto em reais
 *         quantidadeEntregue:
 *           type: integer
 *           description: Quantidade total entregue
 *
 *     MonthlyFinancialData:
 *       type: object
 *       properties:
 *         totalGasto:
 *           type: number
 *           format: float
 *           description: Total gasto no mês
 *         quantidadeEntregue:
 *           type: integer
 *           description: Quantidade entregue no mês
 *         episEntregues:
 *           type: integer
 *           description: Número de EPIs únicos entregues
 */

/**
 * @swagger
 * /v1/financial-reports/{companyId}/annual-costs:
 *   get:
 *     summary: Custos anuais por EPI
 *     description: Retorna o total gasto por EPI por ano para análise financeira
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *         description: Ano específico (opcional, se não informado retorna todos os anos)
 *     responses:
 *       200:
 *         description: Custos anuais recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Custos anuais por EPI recuperados com sucesso"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AnnualEpiCost'
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Empresa não encontrada
 */
router.get(
  '/:companyId/annual-costs',
  verifyToken,
  verifyPermission(['dashboard:read']),
  RequestHandler(FinancialReportController.getAnnualCostsByEpi),
);

/**
 * @swagger
 * /v1/financial-reports/{companyId}/annual-summary:
 *   get:
 *     summary: Resumo financeiro anual
 *     description: Retorna resumo completo dos gastos agrupados por ano e EPI
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Resumo financeiro anual recuperado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Resumo financeiro anual recuperado com sucesso"
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     description: Dados agrupados por ano
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Empresa não encontrada
 */
router.get(
  '/:companyId/annual-summary',
  verifyToken,
  verifyPermission(['dashboard:read']),
  RequestHandler(FinancialReportController.getAnnualFinancialSummary),
);

/**
 * @swagger
 * /v1/financial-reports/{companyId}/monthly-data:
 *   get:
 *     summary: Dados financeiros mensais
 *     description: Retorna dados financeiros agrupados por mês para um ano específico
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *         description: Ano (padrão é o ano atual)
 *     responses:
 *       200:
 *         description: Dados financeiros mensais recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Dados financeiros mensais de 2025 recuperados com sucesso"
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     $ref: '#/components/schemas/MonthlyFinancialData'
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Empresa não encontrada
 */
router.get(
  '/:companyId/monthly-data',
  verifyToken,
  verifyPermission(['dashboard:read']),
  RequestHandler(FinancialReportController.getMonthlyFinancialData),
);

/**
 * @swagger
 * /v1/financial-reports/{companyId}/top-expensive:
 *   get:
 *     summary: Top EPIs mais caros
 *     description: Retorna os EPIs que mais custaram em um ano específico
 *     tags: [Financial Reports]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2030
 *         description: Ano (padrão é o ano atual)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 5
 *         description: Número de EPIs a retornar
 *     responses:
 *       200:
 *         description: Top EPIs mais caros recuperados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Top 5 EPIs mais caros de 2025 recuperados com sucesso"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AnnualEpiCost'
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Empresa não encontrada
 */
router.get(
  '/:companyId/top-expensive',
  verifyToken,
  verifyPermission(['dashboard:read']),
  RequestHandler(FinancialReportController.getTopExpensiveEpis),
);

export default router;
