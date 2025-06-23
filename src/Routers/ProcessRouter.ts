import { Router } from 'express';
import { ProcessController } from '../Controllers/ProcessController';
import { verifyToken, verifyPermission } from '../Middlewares/auth';
import RequestHandler from '../Helpers/RequestHandler';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ProcessEpi:
 *       type: object
 *       required:
 *         - idEpi
 *         - quantidade
 *       properties:
 *         idEpi:
 *           type: string
 *           format: uuid
 *           description: ID do EPI
 *         quantidade:
 *           type: integer
 *           minimum: 1
 *           description: Quantidade do EPI
 *           default: 1
 *
 *     CreateProcess:
 *       type: object
 *       required:
 *         - idColaborador
 *         - dataAgendada
 *         - epis
 *       properties:
 *         idColaborador:
 *           type: string
 *           format: uuid
 *           description: ID do colaborador
 *         dataAgendada:
 *           type: string
 *           format: date
 *           description: Data agendada para entrega
 *         epis:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProcessEpi'
 *           description: Lista de EPIs do processo
 *         observacoes:
 *           type: string
 *           description: Observações do processo
 *
 *     UpdateProcess:
 *       type: object
 *       properties:
 *         idColaborador:
 *           type: string
 *           format: uuid
 *           description: ID do colaborador
 *         dataAgendada:
 *           type: string
 *           format: date
 *           description: Data agendada para entrega
 *         epis:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProcessEpi'
 *           description: Lista de EPIs do processo
 *         observacoes:
 *           type: string
 *           description: Observações do processo
 *         statusEntrega:
 *           type: boolean
 *           description: Status da entrega
 *         dataEntrega:
 *           type: string
 *           format: date-time
 *           description: Data da entrega
 *         dataDevolucao:
 *           type: string
 *           format: date-time
 *           description: Data da devolução
 *         pdfUrl:
 *           type: string
 *           format: uri
 *           description: URL do PDF gerado
 *
 *     Process:
 *       type: object
 *       properties:
 *         idProcesso:
 *           type: string
 *           format: uuid
 *           description: ID único do processo
 *         idEmpresa:
 *           type: string
 *           format: uuid
 *           description: ID da empresa
 *         idColaborador:
 *           type: string
 *           format: uuid
 *           description: ID do colaborador
 *         dataAgendada:
 *           type: string
 *           format: date
 *           description: Data agendada para entrega
 *         dataEntrega:
 *           type: string
 *           format: date-time
 *           description: Data da entrega
 *         statusEntrega:
 *           type: boolean
 *           description: Status da entrega
 *         pdfUrl:
 *           type: string
 *           format: uri
 *           description: URL do PDF gerado
 *         dataDevolucao:
 *           type: string
 *           format: date-time
 *           description: Data da devolução
 *         observacoes:
 *           type: string
 *           description: Observações do processo
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *         empresa:
 *           type: object
 *           description: Dados da empresa
 *         colaborador:
 *           type: object
 *           description: Dados do colaborador
 *         processEpis:
 *           type: array
 *           description: EPIs do processo
 *
 *     ConfirmDelivery:
 *       type: object
 *       properties:
 *         dataEntrega:
 *           type: string
 *           format: date-time
 *           description: Data da entrega (opcional, padrão agora)
 *         pdfUrl:
 *           type: string
 *           format: uri
 *           description: URL do PDF gerado
 *
 *     RegisterReturn:
 *       type: object
 *       required:
 *         - dataDevolucao
 *       properties:
 *         dataDevolucao:
 *           type: string
 *           format: date-time
 *           description: Data da devolução
 *         observacoes:
 *           type: string
 *           description: Observações da devolução
 */

/**
 * @swagger
 * /v1/process/create:
 *   post:
 *     summary: Criar novo processo
 *     description: Cria um novo processo de entrega de EPIs para um colaborador
 *     tags: [Process]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProcess'
 *     responses:
 *       201:
 *         description: Processo criado com sucesso
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
 *                   example: "Processo criado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Process'
 *       400:
 *         description: Dados inválidos ou estoque insuficiente
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Colaborador ou EPI não encontrado
 */
router.post(
  '/create',
  verifyToken,
  verifyPermission(['process:create']),
  RequestHandler(ProcessController.createProcess),
);

/**
 * @swagger
 * /v1/process/{id}:
 *   get:
 *     summary: Buscar processo por ID
 *     description: Retorna um processo específico com todos os seus dados
 *     tags: [Process]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do processo
 *     responses:
 *       200:
 *         description: Processo encontrado
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
 *                   example: "Processo encontrado"
 *                 data:
 *                   $ref: '#/components/schemas/Process'
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Processo não encontrado
 */
router.get(
  '/:id',
  verifyToken,
  verifyPermission(['process:read']),
  ProcessController.getProcessById,
);

/**
 * @swagger
 * /v1/process/{id}:
 *   put:
 *     summary: Atualizar processo
 *     description: Atualiza dados de um processo existente
 *     tags: [Process]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do processo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProcess'
 *     responses:
 *       200:
 *         description: Processo atualizado com sucesso
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
 *                   example: "Processo atualizado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Process'
 *       400:
 *         description: Dados inválidos ou estoque insuficiente
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Processo não encontrado
 */
router.put(
  '/:id',
  verifyToken,
  verifyPermission(['process:update']),
  ProcessController.updateProcess,
);

/**
 * @swagger
 * /v1/process/{id}:
 *   delete:
 *     summary: Deletar processo
 *     description: Remove um processo e devolve o estoque dos EPIs
 *     tags: [Process]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do processo
 *     responses:
 *       200:
 *         description: Processo deletado com sucesso
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
 *                   example: "Processo deletado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Processo deletado com sucesso"
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Processo não encontrado
 */
router.delete(
  '/:id',
  verifyToken,
  verifyPermission(['process:delete']),
  ProcessController.deleteProcess,
);

/**
 * @swagger
 * /v1/process/empresa/{id_empresa}:
 *   get:
 *     summary: Listar processos por empresa
 *     description: Retorna todos os processos de uma empresa específica com paginação e filtros
 *     tags: [Process]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id_empresa
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da empresa
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Quantidade de itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todos, pendentes, entregues]
 *           default: todos
 *         description: Filtro por status de entrega
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para filtro
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para filtro
 *     responses:
 *       200:
 *         description: Processos encontrados
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
 *                   example: "Processos encontrados"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Process'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 */
router.get(
  '/empresa/:id_empresa',
  verifyToken,
  verifyPermission(['process:read']),
  ProcessController.getProcessesByEmpresa,
);

/**
 * @swagger
 * /v1/process/colaborador/{id_colaborador}:
 *   get:
 *     summary: Listar processos por colaborador
 *     description: Retorna todos os processos de um colaborador específico
 *     tags: [Process]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id_colaborador
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do colaborador
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Quantidade de itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todos, pendentes, entregues]
 *           default: todos
 *         description: Filtro por status de entrega
 *     responses:
 *       200:
 *         description: Processos encontrados
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
 *                   example: "Processos encontrados"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Process'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 */
router.get(
  '/colaborador/:id_colaborador',
  verifyToken,
  verifyPermission(['process:read']),
  ProcessController.getProcessesByColaborador,
);

/**
 * @swagger
 * /v1/process/{id}/confirm-delivery:
 *   patch:
 *     summary: Confirmar entrega (biometria)
 *     description: Confirma a entrega de um processo após coleta de biometria
 *     tags: [Process]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do processo
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmDelivery'
 *     responses:
 *       200:
 *         description: Entrega confirmada com sucesso
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
 *                   example: "Entrega confirmada com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Process'
 *       400:
 *         description: Processo já foi entregue
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Processo não encontrado
 */
router.patch(
  '/:id/confirm-delivery',
  verifyToken,
  verifyPermission(['process:update']),
  ProcessController.confirmDelivery,
);

/**
 * @swagger
 * /v1/process/{id}/register-return:
 *   patch:
 *     summary: Registrar devolução
 *     description: Registra a devolução de EPIs e devolve o estoque
 *     tags: [Process]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do processo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterReturn'
 *     responses:
 *       200:
 *         description: Devolução registrada com sucesso
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
 *                   example: "Devolução registrada com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Process'
 *       400:
 *         description: Processo não foi entregue ou já foi devolvido
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Processo não encontrado
 */
router.patch(
  '/:id/register-return',
  verifyToken,
  verifyPermission(['process:update']),
  ProcessController.registerReturn,
);

/**
 * @swagger
 * /v1/process/list:
 *   get:
 *     summary: Listar todos os processos (admin)
 *     description: Lista todos os processos do sistema com paginação e filtros (apenas administradores)
 *     tags: [Process]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Quantidade de itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por nome/CPF do colaborador ou nome da empresa
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todos, pendentes, entregues]
 *           default: todos
 *         description: Filtro por status de entrega
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para filtro
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para filtro
 *     responses:
 *       200:
 *         description: Processos encontrados
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
 *                   example: "Processos encontrados"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Process'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.get(
  '/list',
  verifyToken,
  verifyPermission(['process:read']),
  ProcessController.listProcesses,
);

export default router;
