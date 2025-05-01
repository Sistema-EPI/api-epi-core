import { NextFunction, Request, Response } from 'express';
import { createCompanySchema } from '../Schemas/CompanySchema';

export async function createCompany(req: Request, res: Response, next: NextFunction){
    const {body} = await createCompanySchema.parseAsync(req);

    console.log(body);

    res.status(200).send({
        status: 'ok',
        message: 'Company created successfully (not really - testing)',
        data: body,
    });
}