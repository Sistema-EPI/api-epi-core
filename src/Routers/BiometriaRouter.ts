import { Router } from 'express';
import { BiometriaController } from '../Controllers/BiometriaController';
import RequestHandler from '../Helpers/RequestHandler';
import { verifyToken, verifyPermission } from '../Middlewares/auth';

const router = Router();

// ==========================================
// ROTAS DE BIOMETRIA
// ==========================================

/**
 * @swagger
 * /api/biometria:
 *   post:
 *     summary: Criar nova biometria para colaborador
 *     tags: [Biometria]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idColaborador
 *             properties:
 *               idColaborador:
 *                 type: string
 *                 format: uuid
 *                 description: ID do colaborador
 *               biometriaPath:
 *                 type: string
 *                 description: Caminho do arquivo de biometria
 *               certificadoPath:
 *                 type: string
 *                 description: Caminho do certificado biométrico
 *     responses:
 *       201:
 *         description: Biometria criada com sucesso
 *       400:
 *         description: Dados inválidos ou colaborador já possui 2 biometrias
 *       404:
 *         description: Colaborador não encontrado
 */
router.post(
  '/',
  verifyToken,
  verifyPermission(['biometria:create']),
  RequestHandler(BiometriaController.createBiometria),
);

/**
 * @swagger
 * /api/biometria/{id}:
 *   put:
 *     summary: Atualizar biometria existente
 *     tags: [Biometria]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da biometria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               biometriaPath:
 *                 type: string
 *                 description: Novo caminho do arquivo de biometria
 *               certificadoPath:
 *                 type: string
 *                 description: Novo caminho do certificado biométrico
 *     responses:
 *       200:
 *         description: Biometria atualizada com sucesso
 *       404:
 *         description: Biometria não encontrada
 */
router.put(
  '/:id',
  verifyToken,
  verifyPermission(['biometria:update']),
  RequestHandler(BiometriaController.updateBiometria),
);

/**
 * @swagger
 * /api/biometria/{id}:
 *   delete:
 *     summary: Deletar biometria
 *     tags: [Biometria]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da biometria
 *     responses:
 *       200:
 *         description: Biometria deletada com sucesso
 *       404:
 *         description: Biometria não encontrada
 */
router.delete(
  '/:id',
  verifyToken,
  verifyPermission(['biometria:delete']),
  RequestHandler(BiometriaController.deleteBiometria),
);

/**
 * @swagger
 * /api/biometria/{id}:
 *   get:
 *     summary: Buscar biometria por ID
 *     tags: [Biometria]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da biometria
 *     responses:
 *       200:
 *         description: Biometria encontrada
 *       404:
 *         description: Biometria não encontrada
 */
router.get(
  '/:id',
  verifyToken,
  verifyPermission(['biometria:read']),
  RequestHandler(BiometriaController.getBiometriaById),
);

/**
 * @swagger
 * /api/biometria/colaborador/{idColaborador}:
 *   get:
 *     summary: Listar biometrias de um colaborador
 *     tags: [Biometria]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idColaborador
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do colaborador
 *     responses:
 *       200:
 *         description: Biometrias encontradas
 *       404:
 *         description: Colaborador não encontrado
 */
router.get(
  '/colaborador/:idColaborador',
  verifyToken,
  verifyPermission(['biometria:read']),
  RequestHandler(BiometriaController.getBiometriasByColaborador),
);

/**
 * @swagger
 * /api/biometria/colaborador/{idColaborador}/has-biometria:
 *   get:
 *     summary: Verificar se colaborador tem biometria cadastrada
 *     description: Funcionalidade principal - verifica se o colaborador possui biometria cadastrada
 *     tags: [Biometria]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idColaborador
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do colaborador
 *     responses:
 *       200:
 *         description: Verificação realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 payload:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Verificação de biometria realizada"
 *                     data:
 *                       type: object
 *                       properties:
 *                         colaborador:
 *                           type: object
 *                           properties:
 *                             idColaborador:
 *                               type: string
 *                               format: uuid
 *                             nomeColaborador:
 *                               type: string
 *                             cpf:
 *                               type: string
 *                         hasBiometria:
 *                           type: boolean
 *                           description: Se possui biometria cadastrada
 *                         totalBiometrias:
 *                           type: number
 *                           description: Quantidade de biometrias cadastradas
 *                         maxBiometrias:
 *                           type: number
 *                           description: Máximo de biometrias permitidas (2)
 *                         canAddMore:
 *                           type: boolean
 *                           description: Se pode adicionar mais biometrias
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *       404:
 *         description: Colaborador não encontrado
 */
router.get(
  '/colaborador/:idColaborador/has-biometria',
  verifyToken,
  verifyPermission(['collaborator:read']),
  RequestHandler(BiometriaController.hasBiometria),
);

/**
 * @swagger
 * /api/biometria/empresa:
 *   get:
 *     summary: Listar todas as biometrias da empresa
 *     tags: [Biometria]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Biometrias da empresa encontradas
 */
router.get(
  '/empresa',
  verifyToken,
  verifyPermission(['biometria:read']),
  RequestHandler(BiometriaController.getAllBiometriasByEmpresa),
);

// ==========================================
// ROTAS COMENTADAS PARA IMPLEMENTAÇÃO FUTURA
// ==========================================

/**
 * @swagger
 * /api/biometria/verify:
 *   post:
 *     summary: Verificar/comparar dados biométricos
 *     description: Compara dados biométricos fornecidos com as biometrias cadastradas do colaborador
 *     tags: [Biometria]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idColaborador
 *               - biometriaData
 *             properties:
 *               idColaborador:
 *                 type: string
 *                 format: uuid
 *                 description: ID do colaborador
 *               biometriaData:
 *                 type: string
 *                 description: Dados biométricos para comparação
 *     responses:
 *       200:
 *         description: Verificação realizada
 *       404:
 *         description: Colaborador não possui biometrias cadastradas
 */
// router.post('/verify', RequestHandler(BiometriaController.verifyBiometria));

/**
 * @swagger
 * /api/biometria/match-process:
 *   post:
 *     summary: Match biométrico para confirmação de entrega de processo
 *     description: Realiza verificação biométrica para confirmar entrega de EPI
 *     tags: [Biometria]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idProcesso
 *               - idColaborador
 *               - biometriaData
 *             properties:
 *               idProcesso:
 *                 type: string
 *                 format: uuid
 *                 description: ID do processo de entrega
 *               idColaborador:
 *                 type: string
 *                 format: uuid
 *                 description: ID do colaborador
 *               biometriaData:
 *                 type: string
 *                 description: Dados biométricos para verificação
 *     responses:
 *       200:
 *         description: Match realizado e entrega confirmada
 *       401:
 *         description: Biometria não confere
 *       404:
 *         description: Processo ou colaborador não encontrado
 */
// router.post('/match-process', RequestHandler(BiometriaController.matchBiometriaForProcess));

export default router;
