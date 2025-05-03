import { Request, Response, NextFunction } from 'express';
import { createCompanySchema } from '../Schemas/CompanySchema';
import { Company } from '../Models/CompanyModel';
import HttpResponse from '../Helpers/HttpResponse';

export async function createCompany(req: Request, res: Response, next: NextFunction) {
    try {
        const body = createCompanySchema.parse(req.body);

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