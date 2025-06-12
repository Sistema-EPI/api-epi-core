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

export async function getAllEpis(req: Request, res: Response, next: NextFunction) {
  try {
    const { query } = GetEpisSchema.parse(req);

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);

    // Usar o service para buscar os EPIs
    const result = await EpiService.getAllEpis(page, limit, query.id_empresa);

    const response = HttpResponse.Ok({
      message: 'EPIs recuperados com sucesso',
      pagination: {
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        totalPages: result.meta.totalPages,
      },
      data: result.data,
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

        // Usar o service para buscar o EPI
        const existingEpi = await EpiService.getEpiById(id);

        if (!existingEpi) throw new HttpError('EPI não encontrado', 404);

        const response = HttpResponse.Ok({
            message: 'EPI recuperado com sucesso',
            data: existingEpi,
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

        // Verificar se a empresa existe usando o service
        const existingCompany = await EpiService.getCompanyById(idEmpresa);

        if (!existingCompany) {
            throw new HttpError('Empresa não encontrada', 404);
        }

        // Usar o service para buscar os EPIs
        const result = await EpiService.getEpisByEmpresa(idEmpresa, page, limit);

        const response = HttpResponse.Ok({
            message: `EPIs da empresa ${existingCompany.nomeFantasia} recuperados com sucesso`,
            pagination: {
                total: result.meta.total,
                page: result.meta.page,
                limit: result.meta.limit,
                totalPages: result.meta.totalPages,
                hasNext: result.meta.hasNext,
                hasPrev: result.meta.hasPrev
            },
            data: result.data,
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

        // Verificar se a empresa existe usando o service
        const existingCompany = await EpiService.getCompanyById(body.id_empresa);
        if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);

        // Verificar se o CA já está em uso usando o service
        const isCaAvailable = await EpiService.isCaAvailable(body.ca, body.id_empresa);
        if (!isCaAvailable) throw new HttpError('CA já cadastrado para esta empresa', 409);

        // Preparar dados para criação
        const epiData = {
            ca: body.ca,
            idEmpresa: body.id_empresa,
            nomeEpi: body.nome_epi,
            validade: body.validade ? new Date(body.validade) : undefined,
            descricao: body.descricao,
            quantidade: body.quantidade,
            quantidadeMinima: body.quantidade_minima,
            dataCompra: body.data_compra ? new Date(body.data_compra) : undefined,
            vidaUtil: body.vida_util ? new Date(body.vida_util) : undefined,
        };

        // Usar o service para criar o EPI
        const epi = await EpiService.createEpi(epiData);
        
        logger.info(`Novo EPI criado (ID: ${epi.idEpi}, CA: ${epi.ca})`);

        const response = HttpResponse.Created({
            message: 'EPI criado com sucesso',
            data: epi,
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

        // Verificar se o EPI existe usando o service
        const existingEpi = await EpiService.getEpiById(id);
        if (!existingEpi) throw new HttpError('EPI não encontrado', 404);

        // Verificar se a empresa existe (se fornecida) usando o service
        if (body.id_empresa) {
            const existingCompany = await EpiService.getCompanyById(body.id_empresa);
            if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);
        }

        // Verificar se o CA já está em uso (se fornecido) usando o service
        if (body.ca && body.ca !== existingEpi.ca) {
            const isCaAvailable = await EpiService.isCaAvailable(
                body.ca, 
                body.id_empresa || existingEpi.idEmpresa, 
                id
            );
            if (!isCaAvailable) throw new HttpError('CA já cadastrado para esta empresa', 409);
        }

        // Preparar dados para atualização
        const dataToUpdate = {
            ...(body.ca !== undefined && { ca: body.ca }),
            ...(body.id_empresa !== undefined && { idEmpresa: body.id_empresa }),
            ...(body.nome_epi !== undefined && { nomeEpi: body.nome_epi }),
            ...(body.validade !== undefined && { 
                validade: body.validade ? new Date(body.validade) : undefined 
            }),
            ...(body.descricao !== undefined && { descricao: body.descricao }),
            ...(body.quantidade !== undefined && { quantidade: body.quantidade }),
            ...(body.quantidade_minima !== undefined && { quantidadeMinima: body.quantidade_minima }),
            ...(body.data_compra !== undefined && { 
                dataCompra: body.data_compra ? new Date(body.data_compra) : undefined 
            }),
            ...(body.vida_util !== undefined && { 
                vidaUtil: body.vida_util ? new Date(body.vida_util) : undefined 
            }),
        };

        // Usar o service para atualizar o EPI
        const updatedEpi = await EpiService.updateEpi(id, dataToUpdate);

        // Log das mudanças
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
            logger.info(`EPI (ID: ${id}) recebeu uma requisição de update, mas nenhum dado foi alterado.`);
        }

        const response = HttpResponse.Ok({
            message: 'EPI atualizado com sucesso',
            data: updatedEpi,
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

        // Verificar se o EPI existe usando o service
        const existingEpi = await EpiService.getEpiById(id);
        if (!existingEpi) throw new HttpError('EPI não encontrado', 404);

        // Usar o service para deletar o EPI
        await EpiService.deleteEpi(id);

        logger.info(`EPI removido com sucesso (ID: ${id}, CA: ${existingEpi.ca})`);

        const response = HttpResponse.Ok({
            message: 'EPI deletado com sucesso',
            data: existingEpi,
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in deleteEpi:', err);
        next(err);
    }
}