import { Request, Response, NextFunction } from 'express';
import { createCompanySchema } from '../Schemas/CompanySchema';
import { Company } from '../Models/CompanyModel';

export async function createCompany(req: Request, res: Response, next: NextFunction) {
    try {
        const body = createCompanySchema.parse(req.body);

        console.log('body', body);

        const company = await Company.create(body);

        res.status(201).json({
            status: 'Created',
            message: 'Company created successfully',
            data: company,
        });
    } catch (err) {
        next(err);
    }
}