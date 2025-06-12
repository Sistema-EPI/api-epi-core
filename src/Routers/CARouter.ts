import { Router } from 'express';
import * as CAController from '../Controllers/CAController';
import RequestHandler from '../Helpers/RequestHandler';

const CARouter = Router();

/**
 * @swagger
 * /v1/consulta-epi/ca/{ca}:
 *   get:
 *     summary: Consultar EPI por CA em API externa
 *     description: Faz uma consulta na API externa para obter informações de um EPI pelo seu CA
 *     tags: [Consulta EPI]
 *     parameters:
 *       - in: path
 *         name: ca
 *         required: true
 *         schema:
 *           type: string
 *         description: Número do CA (Certificado de Aprovação) do EPI
 *     responses:
 *       200:
 *         description: Consulta realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Consulta realizada com sucesso"
 *                 data:
 *                   type: object
 *                   description: Dados retornados pela API externa
 *       400:
 *         description: Parâmetro CA inválido ou erro na consulta
 *       500:
 *         description: Erro interno do servidor
 */

// Rota para consultar CA na API externa
// GET /v1/consulta-epi/ca/:ca
CARouter.get('/ca/:ca', RequestHandler(CAController.consultarCA));

export default CARouter;