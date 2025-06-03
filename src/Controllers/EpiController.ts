import { Request, Response, NextFunction } from 'express';
import {
  CreateEpiSchema,
  DeleteEpiSchema,
  GetEpisSchema,
  GetEpiByCaSchema,
  UpdateEpiSchema,
} from '../Schemas/EpiSchema';
import HttpResponse from '../Helpers/HttpResponse';
import HttpError from '../Helpers/HttpError';
import logger from '../Helpers/Logger';
import { prisma } from '../server';

export async function getAllEpis(req: Request, res: Response, next: NextFunction) {
  try {
    const { query } = GetEpisSchema.parse(req);

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const whereClause = query.id_empresa 
      ? { idEmpresa: query.id_empresa }
      : {};

    const [total, data] = await Promise.all([
      prisma.epi.count({ where: whereClause }),
      prisma.epi.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          empresa: {
            select: {
              idEmpresa: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
        },
      }),
    ]);

    const response = HttpResponse.Ok({
      message: 'EPIs recuperados com sucesso',
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data,
    });

    return res.status(response.statusCode).json(response.payload);
  } catch (err) {
    console.error('Error in getAllEpis:', err);
    next(err);
  }
}

export async function getEpiByCa(req: Request, res: Response, next: NextFunction) {
    try {
        const { params } = GetEpiByCaSchema.parse(req);
        const ca = params.ca;

        const existingEpi = await prisma.epi.findUnique({
            where: { ca },
            include: {
              empresa: {
                select: {
                  idEmpresa: true,
                  nomeFantasia: true,
                  razaoSocial: true,
                },
              },
            },
        });

        if (!existingEpi) throw new HttpError('EPI não encontrado', 404);

        const response = HttpResponse.Ok({
            message: 'EPI recuperado com sucesso',
            data: existingEpi,
        });
        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in getEpiByCa:', err);
        next(err);
    }
}

export async function createEpi(req: Request, res: Response, next: NextFunction) {
    try {
        const body = CreateEpiSchema.parse(req.body);

        console.log('body', body);

        // Verificar se a empresa existe
        const existingCompany = await prisma.company.findUnique({
            where: { idEmpresa: body.id_empresa },
        });

        if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);

        // Verificar se o CA já existe
        const existingEpi = await prisma.epi.findUnique({
            where: { ca: body.ca },
        });

        if (existingEpi) throw new HttpError('CA já cadastrado', 409);

        const epi = await prisma.epi.create({
            data: {
                ca: body.ca,
                idEmpresa: body.id_empresa,
                nomeEpi: body.nome_epi,
                validade: body.validade ? new Date(body.validade) : null,
                vidaUtil: body.vida_util ? new Date(body.vida_util) : null,
                quantidade: body.quantidade,
                quantidadeMinima: body.quantidade_minima,
                dataCompra: body.data_compra ? new Date(body.data_compra) : null,
            },
        });
        
        logger.info(`Novo EPI criado (CA: ${epi.ca})`);

        const response = HttpResponse.Created({
            message: 'EPI criado com sucesso',
            id: epi.ca,
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
        const ca = params.ca;

        const existingEpi = await prisma.epi.findUnique({
            where: { ca },
        });

        if (!existingEpi) throw new HttpError('EPI não encontrado', 404);

        // Verificar se a empresa existe (se fornecida)
        if (body.id_empresa) {
            const existingCompany = await prisma.company.findUnique({
                where: { idEmpresa: body.id_empresa },
            });

            if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);
        }

        const dataToUpdate = {
            ...(body.id_empresa !== undefined && { idEmpresa: body.id_empresa }),
            ...(body.nome_epi !== undefined && { nomeEpi: body.nome_epi }),
            ...(body.validade !== undefined && { 
                validade: body.validade ? new Date(body.validade) : null 
            }),
            ...(body.vida_util !== undefined && { 
                vidaUtil: body.vida_util ? new Date(body.vida_util) : null 
            }),
            ...(body.quantidade !== undefined && { quantidade: body.quantidade }),
            ...(body.quantidade_minima !== undefined && { quantidadeMinima: body.quantidade_minima }),
            ...(body.data_compra !== undefined && { 
                dataCompra: body.data_compra ? new Date(body.data_compra) : null 
            }),
        };

        const updatedEpi = await prisma.epi.update({
            where: { ca },
            data: dataToUpdate,
        });

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
            logger.info(`EPI atualizado (CA: ${ca}) com as mudanças: ${JSON.stringify(changes)}`);
        } else {
            logger.info(`EPI (CA: ${ca}) recebeu uma requisição de update, mas nenhum dado foi alterado.`);
        }

        const response = HttpResponse.Ok({
            message: 'EPI atualizado com sucesso',
            id: ca,
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
        const ca = params.ca;

        const existingEpi = await prisma.epi.findUnique({
            where: { ca },
        });

        if (!existingEpi) throw new HttpError('EPI não encontrado', 404);

        await prisma.epi.delete({
            where: { ca },
        });

        logger.info(`EPI removido com sucesso (CA: ${ca})`);

        const response = HttpResponse.Ok({
            message: 'EPI deletado com sucesso',
            epi: existingEpi,
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in deleteEpi:', err);
        next(err);
    }
}