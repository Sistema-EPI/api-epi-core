import { Request, Response, NextFunction } from 'express';
import { ProcessService } from '../Services/processService';
import { 
  CreateProcessSchema, 
  UpdateProcessSchema, 
  GetProcessByIdSchema,
  GetProcessesByEmpresaSchema,
  GetProcessesByColaboradorSchema,
  ConfirmDeliverySchema,
  RegisterReturnSchema,
  ListProcessesSchema
} from '../Schemas/ProcessSchema';
import HttpResponse from '../Helpers/HttpResponse';
import HttpError from '../Helpers/HttpError';


interface AuthRequest extends Request {
  company?: {
    idEmpresa: string;
    nomeFantasia: string;
    apiKey: string;
  };
  userRole?: string;
}

export class ProcessController {
  static async createProcess(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { idEmpresa } = req.company!;
      const validatedData = CreateProcessSchema.parse(req.body);

      const processo = await ProcessService.createProcess(validatedData, idEmpresa);
      
      const response = HttpResponse.Created({
        message: 'Processo criado com sucesso',
        data: processo
      });

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getProcessById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = GetProcessByIdSchema.parse(req.params);
      const { idEmpresa } = req.company!;

  
      if (req.userRole !== 'admin') {
        await ProcessService.validateProcessOwnership(id, idEmpresa);
      }

      const processo = await ProcessService.getProcessById(id);
      
      const response = HttpResponse.Ok({
        message: 'Processo encontrado',
        data: processo
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateProcess(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = GetProcessByIdSchema.parse(req.params);
      const { idEmpresa } = req.company!;
      const validatedData = UpdateProcessSchema.parse(req.body);

      const processo = await ProcessService.updateProcess(id, validatedData, idEmpresa);
      
      const response = HttpResponse.Ok({
        message: 'Processo atualizado com sucesso',
        data: processo
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProcess(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = GetProcessByIdSchema.parse(req.params);
      const { idEmpresa } = req.company!;

      const result = await ProcessService.deleteProcess(id, idEmpresa);
      
      const response = HttpResponse.Ok({
        message: 'Processo deletado com sucesso',
        data: result
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getProcessesByEmpresa(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id_empresa } = req.params;
      const queryParams = { ...req.query, id_empresa };
      const validatedParams = GetProcessesByEmpresaSchema.parse(queryParams);


      if (req.userRole !== 'admin' && req.company!.idEmpresa !== id_empresa) {
        throw new HttpError('Acesso negado', 403);
      }

      const result = await ProcessService.getProcessesByEmpresa(validatedParams);
      
      const response = HttpResponse.Ok({
        message: 'Processos encontrados',
        data: result.processos,
        pagination: result.pagination
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  }


  static async getProcessesByColaborador(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id_colaborador } = req.params;
      const queryParams = { ...req.query, id_colaborador };
      const validatedParams = GetProcessesByColaboradorSchema.parse(queryParams);

      const result = await ProcessService.getProcessesByColaborador(validatedParams);
      
      const response = HttpResponse.Ok({
        message: 'Processos encontrados',
        data: result.processos,
        pagination: result.pagination
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async confirmDelivery(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = ConfirmDeliverySchema.parse({ id, ...req.body });

 
      const processo = await ProcessService.confirmDelivery(
        validatedData.id, 
        validatedData.dataEntrega,
        validatedData.pdfUrl
      );
      
      const response = HttpResponse.Ok({
        message: 'Entrega confirmada com sucesso',
        data: processo
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  }


  static async registerReturn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = RegisterReturnSchema.parse({ id, ...req.body });
      const { idEmpresa } = req.company!;

      const processo = await ProcessService.registerReturn(
        validatedData.id,
        validatedData.dataDevolucao,
        validatedData.observacoes,
        idEmpresa
      );
      
      const response = HttpResponse.Ok({
        message: 'Devolução registrada com sucesso',
        data: processo
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Listar todos os processos (admin) (todo: tem necessidade? remove?)
  static async listProcesses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.userRole !== 'admin') {
        throw new HttpError('Acesso negado - apenas administradores', 403);
      }

      const validatedParams = ListProcessesSchema.parse(req.query);
      const result = await ProcessService.listProcesses(validatedParams);
      
      const response = HttpResponse.Ok({
        message: 'Processos encontrados',
        data: result.processos,
        pagination: result.pagination
      });

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
