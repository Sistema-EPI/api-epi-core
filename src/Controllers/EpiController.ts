import { Request, Response, NextFunction } from 'express';
import {
  CreateEpiSchema,
  DeleteEpiSchema,
  GetEpisSchema,
  GetEpiByIdSchema,
  GetEpisByEmpresaSchema,
  UpdateEpiSchema,
} from '../Schemas/EpiSchema';
import HttpResponse from '../Helpers/HttpResponse';
import HttpError from '../Helpers/HttpError';
import logger from '../Helpers/Logger';
import { EpiService } from '../Services/epiService';
import { CompanyService } from '../Services/companyService';
import { parseDate } from '../Helpers/DateHelper';
import { formatEpiForFrontend, formatListForFrontend } from '../Helpers/EntityFormatter';

const companyService = new CompanyService();

export async function getAllEpis(req: Request, res: Response, next: NextFunction) {
  try {
    const { query } = GetEpisSchema.parse(req);

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);

    const result = await EpiService.getAllEpis(page, limit, query.id_empresa);

    const response = HttpResponse.Ok({
      message: 'EPIs recuperados com sucesso',
      pagination: {
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        totalPages: result.meta.totalPages,
      },
      data: formatListForFrontend(result.data, formatEpiForFrontend),
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getAllEpis:', err);
    next(err);
  }
}

export async function getEpiById(req: Request, res: Response, next: NextFunction) {
  try {
    const { params } = GetEpiByIdSchema.parse(req);
    const id = params.id;

    const existingEpi = await EpiService.getEpiById(id);

    if (!existingEpi) throw new HttpError('EPI não encontrado', 404);

    const response = HttpResponse.Ok({
      message: 'EPI recuperado com sucesso',
      data: formatEpiForFrontend(existingEpi),
    });
    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getEpiById:', err);
    next(err);
  }
}

export async function getEpisByEmpresa(req: Request, res: Response, next: NextFunction) {
  try {
    const { params, query } = GetEpisByEmpresaSchema.parse(req);
    const idEmpresa = params.id_empresa;

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);

    const existingCompany = await companyService.getCompanyByIdSimple(idEmpresa);

    if (!existingCompany) {
      throw new HttpError('Empresa não encontrada', 404);
    }

    const result = await EpiService.getEpisByEmpresa(idEmpresa, page, limit);

    const response = HttpResponse.Ok({
      message: `EPIs da empresa ${existingCompany.nomeFantasia} recuperados com sucesso`,
      pagination: {
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        totalPages: result.meta.totalPages,
        hasNext: result.meta.hasNext,
        hasPrev: result.meta.hasPrev,
      },
      data: formatListForFrontend(result.data, formatEpiForFrontend),
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getEpisByEmpresa:', err);
    next(err);
  }
}

export async function createEpi(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CreateEpiSchema.parse(req.body);

    console.log('body', body);

    const existingCompany = await companyService.getCompanyByIdSimple(body.id_empresa);
    if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);

    const isCaAvailable = await EpiService.isCaAvailable(body.ca, body.id_empresa);
    if (!isCaAvailable) throw new HttpError('CA já cadastrado para esta empresa', 409);

    const epiData = {
      ca: body.ca,
      idEmpresa: body.id_empresa,
      nomeEpi: body.nome_epi,
      validade: parseDate(body.validade),
      descricao: body.descricao,
      quantidade: body.quantidade,
      quantidadeMinima: body.quantidade_minima,
      dataCompra: parseDate(body.data_compra),
      vidaUtil: body.vida_util,
    };

    const epi = await EpiService.createEpi(epiData);

    logger.info(`Novo EPI criado (ID: ${epi.idEpi}, CA: ${epi.ca})`);

    const response = HttpResponse.Created({
      message: 'EPI criado com sucesso',
      data: formatEpiForFrontend(epi),
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in createEpi:', err);
    next(err);
  }
}

export async function updateEpi(req: Request, res: Response, next: NextFunction) {
  try {
    const { body, params } = UpdateEpiSchema.parse(req);
    const id = params.id;

    const existingEpi = await EpiService.getEpiById(id);
    if (!existingEpi) throw new HttpError('EPI não encontrado', 404);

    if (body.id_empresa) {
      const existingCompany = await companyService.getCompanyByIdSimple(body.id_empresa);
      if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);
    }

    if (body.ca && body.ca !== existingEpi.ca) {
      const isCaAvailable = await EpiService.isCaAvailable(
        body.ca,
        body.id_empresa || existingEpi.idEmpresa,
        id,
      );
      if (!isCaAvailable) throw new HttpError('CA já cadastrado para esta empresa', 409);
    }

    const dataToUpdate = {
      ...(body.ca !== undefined && { ca: body.ca }),
      ...(body.id_empresa !== undefined && { idEmpresa: body.id_empresa }),
      ...(body.nome_epi !== undefined && { nomeEpi: body.nome_epi }),
      ...(body.validade !== undefined && {
        validade: parseDate(body.validade),
      }),
      ...(body.descricao !== undefined && { descricao: body.descricao }),
      ...(body.quantidade !== undefined && { quantidade: body.quantidade }),
      ...(body.quantidade_minima !== undefined && { quantidadeMinima: body.quantidade_minima }),
      ...(body.data_compra !== undefined && {
        dataCompra: parseDate(body.data_compra),
      }),
      ...(body.vida_util !== undefined && {
        vidaUtil: body.vida_util,
      }),
    };

    const updatedEpi = await EpiService.updateEpi(id, dataToUpdate);

    const changes: Record<string, { before: any; after: any }> = {};
    for (const key in dataToUpdate) {
      if ((existingEpi as any)[key] !== (updatedEpi as any)[key]) {
        changes[key] = {
          before: (existingEpi as any)[key],
          after: (updatedEpi as any)[key],
        };
      }
    }

    if (Object.keys(changes).length > 0) {
      logger.info(`EPI atualizado (ID: ${id}) com as mudanças: ${JSON.stringify(changes)}`);
    } else {
      logger.info(
        `EPI (ID: ${id}) recebeu uma requisição de update, mas nenhum dado foi alterado.`,
      );
    }

    const response = HttpResponse.Ok({
      message: 'EPI atualizado com sucesso',
      data: formatEpiForFrontend(updatedEpi),
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in updateEpi:', err);
    next(err);
  }
}

export async function deleteEpi(req: Request, res: Response, next: NextFunction) {
  try {
    const { params } = DeleteEpiSchema.parse(req);
    const id = params.id;

    const existingEpi = await EpiService.getEpiById(id);
    if (!existingEpi) throw new HttpError('EPI não encontrado', 404);

    const deletedEpi = await EpiService.deleteEpi(id);

    logger.info(`EPI removido com sucesso (ID: ${id}, CA: ${existingEpi.ca})`);

    const response = HttpResponse.Ok({
      message: 'EPI desativado com sucesso',
      data: deletedEpi,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in deleteEpi:', err);
    next(err);
  }
}
