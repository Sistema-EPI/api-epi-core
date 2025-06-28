import { Router } from 'express';
import RequestHandler from '../../Helpers/RequestHandler';
import * as logController from '../../Controllers/Logs/EpiLogController';
import { verify } from 'crypto';
import { verifyPermission, verifyToken } from '../../Middlewares/auth';

//v1/logs

const log = Router();

/**
 * @swagger
 * /api/logs/epi/{epiId}:
 *   get:
 *     summary: Busca logs de um EPI específico
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: epiId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do EPI
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Limite de registros
 *     responses:
 *       200:
 *         description: Logs recuperados com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
log.get(
  '/epi/:epiId',
  verifyToken,
  verifyPermission(['epi:read']),
  RequestHandler(logController.getEpiLogs),
);

/**
 * @swagger
 * /api/logs/company/{companyId}/epis:
 *   get:
 *     summary: Busca logs de EPIs de uma empresa
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da empresa
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Limite de registros
 *     responses:
 *       200:
 *         description: Logs recuperados com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
log.get(
  '/company/:companyId/epis',
  verifyToken,
  verifyPermission(['company:read']),
  RequestHandler(logController.getCompanyEpiLogs),
);

/**
 * @swagger
 * /api/logs/epi-types:
 *   get:
 *     summary: Retorna tipos de logs de EPI disponíveis
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Tipos de logs recuperados com sucesso
 *       500:
 *         description: Erro interno do servidor
 */
log.get('/epi-types',
  verifyToken,
  verifyPermission(['epi:read']),
  RequestHandler(logController.getEpiLogTypes
));

export default log;
