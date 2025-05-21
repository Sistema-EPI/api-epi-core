import { Request, Response, NextFunction } from 'express';
import {
  CreateCompanySchema,
  DeleteCompanySchema,
  GetCompaniesSchema,
  GetCompanyByIdSchema,
  UpdateCompanySchema,
} from '../Schemas/CompanySchema';
import HttpResponse from '../Helpers/HttpResponse';
import HttpError from '../Helpers/HttpError';
import logger from '../Helpers/Logger';
import { prisma } from '../server';
// Importando os tipos necessários do Prisma
import { CompanyStatus } from '@prisma/client';

export async function getAllCompanies(req: Request, res: Response, next: NextFunction) {
  try {
    const { query } = GetCompaniesSchema.parse(req);

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      prisma.company.count(),
      prisma.company.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const response = HttpResponse.Ok({
      message: 'Empresas recuperadas com sucesso',
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
    console.error('Error in getAllCompanies:', err);
    next(err);
  }
}

export async function getCompanyById(req: Request, res: Response, next: NextFunction) {
    try {
        const { params } = GetCompanyByIdSchema.parse(req);
        const companyId = params.id;

        const existingCompany = await prisma.company.findUnique({
            where: { idEmpresa: companyId },
        });

        if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);

        const response = HttpResponse.Ok({
            message: 'Empresa recuperada com sucesso',
            data: existingCompany,
        });
        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in getCompanyById:', err);
        next(err);
    }
}

export async function createCompany(req: Request, res: Response, next: NextFunction) {
    try {
        // Usamos CreateCompanySchema para validar os dados recebidos em snake_case
        const body = CreateCompanySchema.parse(req.body);

        console.log('body', body);

        // Mapeamos do formato snake_case do schema para camelCase do Prisma
        const company = await prisma.company.create({
            data: {
                nomeFantasia: body.nome_fantasia,
                razaoSocial: body.razao_social,
                cnpj: body.cnpj,
                cep: body.cep,
                email: body.email,
                uf: body.uf,
                logradouro: body.logradouro,
                telefone: body.telefone,
                statusEmpresa: body.status_empresa as CompanyStatus, // Utilizando o tipo adequado
            },
        });
        
        logger.info(`Nova empresa criada (id: ${company.idEmpresa})`);

        const response = HttpResponse.Created({
            message: 'Empresa criada com sucesso',
            id: company.idEmpresa,
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in createCompany:', err);
        next(err);
    }
}

export async function updateCompany(req: Request, res: Response, next: NextFunction) {
    try {
        const { body, params } = UpdateCompanySchema.parse(req);
        const companyId = params.id;

        const existingCompany = await prisma.company.findUnique({
            where: { idEmpresa: companyId },
        });

        if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);

        // Importamos o enum do Prisma para garantir compatibilidade de tipo
        // Se necessário, você pode importar o enum do Prisma no topo do arquivo
        // import { CompanyStatus } from '@prisma/client';

        // Mapeamento entre snake_case do schema para camelCase do Prisma
        const dataToUpdate = {
            ...(body.nome_fantasia !== undefined && { nomeFantasia: body.nome_fantasia }),
            ...(body.razao_social !== undefined && { razaoSocial: body.razao_social }),
            ...(body.cnpj !== undefined && { cnpj: body.cnpj }),
            ...(body.cep !== undefined && { cep: body.cep }),
            ...(body.email !== undefined && { email: body.email }),
            ...(body.uf !== undefined && { uf: body.uf }),
            ...(body.logradouro !== undefined && { logradouro: body.logradouro }),
            ...(body.telefone !== undefined && { telefone: body.telefone }),
            // Utilizando o enum para garantir compatibilidade de tipo
            ...(body.status_empresa !== undefined && { 
                statusEmpresa: (body.status_empresa ? 'ATIVO' : 'INATIVO') as CompanyStatus 
            }),
        };

        const updatedCompany = await prisma.company.update({
            where: { idEmpresa: companyId },
            data: dataToUpdate,
        });

        const changes: Record<string, { before: any; after: any }> = {};
        for (const key in dataToUpdate) {
            if ((existingCompany as any)[key] !== (updatedCompany as any)[key]) {
                changes[key] = {
                    before: (existingCompany as any)[key],
                    after: (updatedCompany as any)[key],
                };
            }
        }

        if (Object.keys(changes).length > 0) {
            logger.info(`Empresa atualizada (id: ${companyId}) com as mudanças: ${JSON.stringify(changes)}`);
        } else {
            logger.info(`Empresa (id: ${companyId}) recebeu uma requisição de update, mas nenhum dado foi alterado.`);
        }

        const response = HttpResponse.Ok({
            message: 'Empresa atualizada com sucesso',
            id: companyId,
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in updateCompany:', err);
        next(err);
    }
}

export async function deleteCompany(req: Request, res: Response, next: NextFunction) {
    try {
        const { params } = DeleteCompanySchema.parse(req);
        const companyId = params.id;

        const existingCompany = await prisma.company.findUnique({
            where: { idEmpresa: companyId },
        });

        if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);

        await prisma.company.delete({
            where: { idEmpresa: companyId },
        });

        logger.info(`Empresa removida com sucesso (id: ${companyId})`);

        const response = HttpResponse.Ok({
            message: 'Empresa deletada com sucesso',
            company: existingCompany,
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in deleteCompany:', err);
        next(err);
    }
}