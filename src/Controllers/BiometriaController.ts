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
import {
  formatBiometriaForFrontend,
  formatListForFrontend,
  maskCpf,
} from '../Helpers/EntityFormatter';

interface AuthRequest extends Request {
  company?: {
    idEmpresa: string;
    nomeFantasia: string;
    apiKey: string;
  };
  userRole?: string;
}

export class BiometriaController {
  static async createBiometria(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company } = req;
      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      const validatedData = CreateBiometriaSchema.parse(req.body);

      const biometria = await BiometriaService.createBiometria(validatedData, company.idEmpresa);

      const response = HttpResponse.Created({
        message: 'Biometria criada com sucesso',
        data: formatBiometriaForFrontend(biometria),
      });

      return res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      next(error);
    }
  }

  static async updateBiometria(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company } = req;
      const { id } = req.params;

      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      const validatedData = UpdateBiometriaSchema.parse(req.body);

      const biometriaAtualizada = await BiometriaService.updateBiometria(
        id,
        validatedData,
        company.idEmpresa,
      );

      const response = HttpResponse.Ok({
        message: 'Biometria atualizada com sucesso',
        data: formatBiometriaForFrontend(biometriaAtualizada),
      });

      return res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      next(error);
    }
  }

  static async deleteBiometria(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company } = req;
      const { id } = req.params;

      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      const result = await BiometriaService.deleteBiometria(id, company.idEmpresa);

      const response = HttpResponse.Ok({
        message: result.message,
        data: result,
      });

      return res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      next(error);
    }
  }

  static async getBiometriasByColaborador(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company } = req;
      const { idColaborador } = req.params;

      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      const biometrias = await BiometriaService.getBiometriasByColaborador(
        idColaborador,
        company.idEmpresa,
      );

      const response = HttpResponse.Ok({
        message: 'Biometrias encontradas',
        data: formatListForFrontend(biometrias, formatBiometriaForFrontend),
      });

      return res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      next(error);
    }
  }

  static async hasBiometria(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company } = req;
      const { idColaborador } = req.params;

      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      const result = await BiometriaService.hasBiometria(idColaborador, company.idEmpresa);

      const maskedResult = {
        ...result,
        colaborador: {
          ...result.colaborador,
          cpf: maskCpf(result.colaborador.cpf),
        },
      };

      const response = HttpResponse.Ok({
        message: 'Verificação de biometria realizada',
        data: maskedResult,
      });

      return res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      next(error);
    }
  }

  static async getBiometriaById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company } = req;
      const { id } = req.params;

      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      const biometria = await BiometriaService.getBiometriaById(id, company.idEmpresa);

      const response = HttpResponse.Ok({
        message: 'Biometria encontrada',
        data: formatBiometriaForFrontend(biometria),
      });

      return res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      next(error);
    }
  }

  static async getAllBiometriasByEmpresa(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company, userRole } = req;

      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      const biometrias = await BiometriaService.getAllBiometriasByEmpresa(company.idEmpresa);

      const response = HttpResponse.Ok({
        message: 'Biometrias da empresa encontradas',
        data: formatListForFrontend(biometrias, formatBiometriaForFrontend),
      });

      return res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      next(error);
    }
  }

  static async verifyBiometria(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company } = req;

      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      const validatedData = VerifyBiometriaSchema.parse(req.body);

      const result = await BiometriaService.verifyBiometria(validatedData, company.idEmpresa);

      const response = HttpResponse.Ok({
        message: 'Verificação biométrica realizada',
        data: result,
      });

      return res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      next(error);
    }
  }

  static async matchBiometriaForProcess(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { company } = req;

      if (!company) {
        throw new HttpError('Empresa não identificada', 401);
      }

      const validatedData = MatchBiometriaSchema.parse(req.body);

      const result = await BiometriaService.matchBiometriaForProcess(
        validatedData,
        company.idEmpresa,
      );

      const response = HttpResponse.Ok({
        message: 'Match biométrico realizado com sucesso',
        data: result,
      });

      return res.status(response.statusCode).json(response.toJSON());
    } catch (error) {
      next(error);
    }
  }
}
