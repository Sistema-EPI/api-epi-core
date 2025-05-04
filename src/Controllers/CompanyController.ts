import { Request, Response, NextFunction } from 'express';
import { CreateCompanySchema, UpdateCompanySchema } from '../Schemas/CompanySchema';
import { Company } from '../Models/CreateCompanyModel';
import HttpResponse from '../Helpers/HttpResponse';
import HttpError from '../Helpers/HttpError';
import logger from '../Helpers/Logger';

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
    const updateData = UpdateCompanySchema.parse(req.body);
    
    const companyId = req.params.id;

    const existingCompany = await Company.findByPk(companyId);

    if (!existingCompany) throw new HttpError('Empresa não encontrada', 404);

    const previousValues = existingCompany.toJSON();

    console.log('Valores anteriores:', existingCompany.toJSON());

    const updatedCompany = await existingCompany.update(updateData);
    const newValues = updatedCompany.toJSON();

    const changes: Record<string, { before: any; after: any }> = {};
    for (const key in updateData) {
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
        company: updateCompany,
    });

    return res.status(response.statusCode).json(response.payload);
}