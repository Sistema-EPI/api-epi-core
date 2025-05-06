import { Request, Response, NextFunction } from 'express';
import { CreateCompanySchema, DeleteCompanySchema, GetCompaniesSchema, GetCompanyByIdSchema, UpdateCompanySchema } from '../Schemas/CompanySchema';
import HttpResponse from '../Helpers/HttpResponse';
import HttpError from '../Helpers/HttpError';
import logger from '../Helpers/Logger';
import { prisma } from '../server';


export async function getAllCompanies(req: Request, res: Response, next: NextFunction) {
    try {
        const { query } = GetCompaniesSchema.parse(req);

        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '10', 10);
        const skip = (page - 1) * limit;

        const [total, data] = await Promise.all([
            prisma.companies.count(),
            prisma.companies.findMany({
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
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
        next(err);
    }
}

export async function getCompanyById(req: Request, res: Response, next: NextFunction) {
    try {
        const { params } = GetCompanyByIdSchema.parse(req);
        const companyId = params.id;

        const existingCompany = await prisma.companies.findUnique({
            where: { id: companyId },
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
        const body = CreateCompanySchema.parse(req.body);

        console.log('body', body);

        const company = await prisma.companies.create({
            data: body,
        });

        const response = HttpResponse.Created({
            message: 'Company created successfully',
            company,
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        next(err);
    }
}


export async function updateCompany(req: Request, res: Response, next: NextFunction) {
    try {
        const { body, params } = UpdateCompanySchema.parse(req);
        const companyId = params.id;

        const existingCompany = await prisma.companies.findUnique({
            where: { id: companyId },
        });

        if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);

        const updatedCompany = await prisma.companies.update({
            where: { id: companyId },
            data: body,
        });

        const changes: Record<string, { before: any; after: any }> = {};
        for (const key in body) {
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

        const response = HttpResponse.Created({
            message: 'Company updated successfully',
            id: companyId,
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        next(err);
    }
}

export async function deleteCompany(req: Request, res: Response, next: NextFunction) {
    try {
        const { params } = DeleteCompanySchema.parse(req);
        const companyId = params.id;

        const existingCompany = await prisma.companies.findUnique({
            where: { id: companyId },
        });

        if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);

        await prisma.companies.delete({
            where: { id: companyId },
        });

        logger.info(`Empresa removida com sucesso (id: ${companyId})`);

        const response = HttpResponse.Ok({
            message: 'Empresa deletada com sucesso',
            company: existingCompany,
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        next(err);
    }
}