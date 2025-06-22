import { Request, Response, NextFunction } from 'express';
import { BiometriaService } from '../Services/biometriaService';
import {
  CreateBiometriaSchema,
  UpdateBiometriaSchema,
  VerifyBiometriaSchema,
  MatchBiometriaSchema,
} from '../Schemas/BiometriaSchema';
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

export class BiometriaController {
  /**
   * Cria uma nova biometria para um colaborador
   */
  static async createBiometria(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company } = req;
      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      // Validar dados de entrada
      const validatedData = CreateBiometriaSchema.parse(req.body);

      // Criar biometria
      const biometria = await BiometriaService.createBiometria(validatedData, company.idEmpresa);

      const response = HttpResponse.Created({
        message: 'Biometria criada com sucesso',
        data: biometria,
      });

      return res.status(response.statusCode).json(response.payload);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza uma biometria existente
   */
  static async updateBiometria(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company } = req;
      const { id } = req.params;

      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      // Validar dados de entrada
      const validatedData = UpdateBiometriaSchema.parse(req.body);

      // Atualizar biometria
      const biometriaAtualizada = await BiometriaService.updateBiometria(
        id,
        validatedData,
        company.idEmpresa,
      );

      const response = HttpResponse.Ok({
        message: 'Biometria atualizada com sucesso',
        data: biometriaAtualizada,
      });

      return res.status(response.statusCode).json(response.payload);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta uma biometria específica
   */
  static async deleteBiometria(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company } = req;
      const { id } = req.params;

      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      // Deletar biometria
      const result = await BiometriaService.deleteBiometria(id, company.idEmpresa);

      const response = HttpResponse.Ok({
        message: result.message,
        data: result,
      });

      return res.status(response.statusCode).json(response.payload);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todas as biometrias de um colaborador
   */
  static async getBiometriasByColaborador(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company } = req;
      const { idColaborador } = req.params;

      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      // Buscar biometrias do colaborador
      const biometrias = await BiometriaService.getBiometriasByColaborador(
        idColaborador,
        company.idEmpresa,
      );

      const response = HttpResponse.Ok({
        message: 'Biometrias encontradas',
        data: biometrias,
      });

      return res.status(response.statusCode).json(response.payload);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifica se um colaborador tem biometria cadastrada
   * FUNCIONALIDADE PRINCIPAL SOLICITADA
   */
  static async hasBiometria(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company } = req;
      const { idColaborador } = req.params;

      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      // Verificar se colaborador tem biometria
      const result = await BiometriaService.hasBiometria(idColaborador, company.idEmpresa);

      const response = HttpResponse.Ok({
        message: 'Verificação de biometria realizada',
        data: result,
      });

      return res.status(response.statusCode).json(response.payload);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca uma biometria específica por ID
   */
  static async getBiometriaById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company } = req;
      const { id } = req.params;

      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      // Buscar biometria
      const biometria = await BiometriaService.getBiometriaById(id, company.idEmpresa);

      const response = HttpResponse.Ok({
        message: 'Biometria encontrada',
        data: biometria,
      });

      return res.status(response.statusCode).json(response.payload);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todas as biometrias da empresa (apenas admin)
   */
  static async getAllBiometriasByEmpresa(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company, userRole } = req;

      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      // Verificar se é admin (caso necessário restringir acesso)
      // if (userRole !== 'admin') {
      //   throw new HttpError('Acesso negado - apenas administradores', 403);
      // }

      // Buscar todas as biometrias da empresa
      const biometrias = await BiometriaService.getAllBiometriasByEmpresa(company.idEmpresa);

      const response = HttpResponse.Ok({
        message: 'Biometrias da empresa encontradas',
        data: biometrias,
      });

      return res.status(response.statusCode).json(response.payload);
    } catch (error) {
      next(error);
    }
  }

  // =====================================================
  // FUNCIONALIDADES COMENTADAS PARA IMPLEMENTAÇÃO FUTURA
  // =====================================================

  /**
   * Verifica/compara dados biométricos
   * TODO: Implementar quando algoritmo biométrico estiver pronto
   */
  // static async verifyBiometria(
  //   req: AuthRequest,
  //   res: Response,
  //   next: NextFunction
  // ) {
  //   try {
  //     const { company } = req;

  //     if (!company) {
  //       throw new HttpError('Empresa não identificada', 401);
  //     }

  //     // Validar dados de entrada
  //     const validatedData = VerifyBiometriaSchema.parse(req.body);

  //     // Verificar biometria
  //     const result = await BiometriaService.verifyBiometria(
  //       validatedData,
  //       company.idEmpresa
  //     );

  //     return HttpResponse.success(
  //       res,
  //       'Verificação biométrica realizada',
  //       result
  //     );
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  /**
   * Realiza match biométrico para confirmação de entrega
   * TODO: Implementar integração com processo de entrega
   */
  // static async matchBiometriaForProcess(
  //   req: AuthRequest,
  //   res: Response,
  //   next: NextFunction
  // ) {
  //   try {
  //     const { company } = req;

  //     if (!company) {
  //       throw new HttpError('Empresa não identificada', 401);
  //     }

  //     // Validar dados de entrada
  //     const validatedData = MatchBiometriaSchema.parse(req.body);

  //     // Realizar match para processo
  //     const result = await BiometriaService.matchBiometriaForProcess(
  //       validatedData,
  //       company.idEmpresa
  //     );

  //     return HttpResponse.success(
  //       res,
  //       'Match biométrico realizado com sucesso',
  //       result
  //     );
  //   } catch (error) {
  //     next(error);
  //   }
  // }
}
