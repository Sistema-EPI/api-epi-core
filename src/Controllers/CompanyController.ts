import { Request, Response, NextFunction } from 'express';
import {
    CreateCompanySchema,
    DeleteCompanySchema,
    GetCompaniesSchema,
    GetCompanyByIdSchema,
    UpdateCompanySchema,
    UpdateCompanyStatusSchema,
} from '../Schemas/CompanySchema';
import HttpResponse from '../Helpers/HttpResponse';
import { CompanyService } from '../Services/companyService';

const companyService = new CompanyService();

export async function getAllCompanies(req: Request, res: Response, next: NextFunction) {
    try {
        const { query } = GetCompaniesSchema.parse(req);

        const result = await companyService.getAllCompanies(query);

        const response = HttpResponse.Ok({
            message: 'Empresas recuperadas com sucesso',
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            },
            data: result.data,
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

        const companyData = await companyService.getCompanyById(companyId);

        const response = HttpResponse.Ok({
            message: 'Empresa recuperada com sucesso',
            data: companyData,
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

        const companyData = await companyService.createCompany(body);

        const response = HttpResponse.Created({
            message: 'Empresa criada com sucesso',
            data: companyData
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

        const result = await companyService.updateCompany(companyId, body);

        const response = HttpResponse.Ok({
            message: 'Empresa atualizada com sucesso',
            data: result
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

        const result = await companyService.deleteCompany(companyId);

        const response = HttpResponse.Ok({
            message: 'Empresa deletada com sucesso',
            company: result,
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in deleteCompany:', err);
        next(err);
    }
}

export async function updateCompanyStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const { params, body } = UpdateCompanyStatusSchema.parse(req);
        const companyId = params.id;
        const { status_empresa } = body;

        const result = await companyService.updateCompanyStatus(companyId, status_empresa);

        const response = HttpResponse.Ok({
            message: `Status da empresa ${status_empresa ? 'ativado' : 'desativado'} com sucesso`,
            data: result,
        });

        return res.status(response.statusCode).json(response.payload);
    } catch (err) {
        console.error('Error in updateCompanyStatus:', err);
        next(err);
    }
}