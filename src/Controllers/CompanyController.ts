import { Request, Response, NextFunction } from 'express';
import { CreateCompanySchema, DeleteCompanySchema, GetCompaniesSchema, GetCompanyByIdSchema, UpdateCompanySchema } from '../Schemas/CompanySchema';
import { Company } from '../Models/CreateCompanyModel';
import HttpResponse from '../Helpers/HttpResponse';
import HttpError from '../Helpers/HttpError';
import logger from '../Helpers/Logger';


export async function getAllCompanies(req: Request, res: Response, next: NextFunction) {
    try {
        const { query } = GetCompaniesSchema.parse(req);

        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '10', 10);
        const offset = (page - 1) * limit;

        const { count, rows } = await Company.findAndCountAll({
            offset,
            limit,
            order: [['createdAt', 'DESC']],
        });

        const response = HttpResponse.Ok({
            message: 'Empresas recuperadas com sucesso',
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
            data: rows,
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        next(err);
    }
}

export async function getCompanyById(req: Request, res: Response, next: NextFunction) {
    try {
        const { params } = GetCompanyByIdSchema.parse(req);
        const companyId = params.id

        const existingCompany = await Company.findByPk(companyId);

        if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);

        const response = HttpResponse.Ok({
            message: 'Empresa recuperada com sucesso',
            data: existingCompany,
        });
        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        next(err);
    };
}

export async function createCompany(req: Request, res: Response, next: NextFunction) {
    try {
        const body = CreateCompanySchema.parse(req.body);

        console.log('body', body);

        const company = await Company.create(body);


        const response = HttpResponse.Created({
            message: 'Company created successfully',
            company: company,
        });

        return res.status(response.statusCode).json(response.payload);

    } catch (err) {
        next(err);
    }
}

export async function updateCompany(req: Request, res: Response) {
    const { body, params } = UpdateCompanySchema.parse(req);

    const companyId = params.id;

    const existingCompany = await Company.findByPk(companyId);

    if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);

    const previousValues = existingCompany.toJSON();

    console.log('Valores anteriores:', existingCompany.toJSON());

    const updatedCompany = await existingCompany.update(body);
    const newValues = updatedCompany.toJSON();

    const changes: Record<string, { before: any; after: any }> = {};
    for (const key in body) {
        if (previousValues[key] !== newValues[key]) {
            changes[key] = {
                before: previousValues[key],
                after: newValues[key],
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
}

export async function deleteCompany(req: Request, res: Response) {
    const { params } = DeleteCompanySchema.parse(req);
    const companyId = params.id;

    const existingCompany = await Company.findByPk(companyId);

    if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);

    await existingCompany.destroy();

    logger.info(`Empresa removida com sucesso (id: ${companyId})`);

    const response = HttpResponse.Ok({
        message: 'Empresa deletada com sucesso',
        company: existingCompany,
    });

    return res.status(response.statusCode).json(response.payload);
}